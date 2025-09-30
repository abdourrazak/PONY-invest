import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  Timestamp,
  QueryConstraint,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Transaction, 
  CreateTransactionData, 
  TransactionFilters,
  TransactionStats,
  TransactionStatus,
  User
} from '@/types/transactions';

// Collection references
const transactionsCollection = collection(db, 'transactions');
const usersCollection = collection(db, 'users');

// Créer une nouvelle transaction
export async function createTransaction(
  userId: string,
  userNumeroTel: string,
  data: CreateTransactionData
): Promise<string> {
  try {
    // Vérifier les règles de retrait si c'est un retrait
    if (data.type === 'withdrawal') {
      const { canUserWithdraw } = await import('./investmentRules');
      const withdrawalCheck = await canUserWithdraw(userId);
      if (!withdrawalCheck.canWithdraw) {
        throw new Error(withdrawalCheck.message);
      }
    }

    const transactionData = {
      ...data,
      userId,
      userNumeroTel,
      status: 'pending' as TransactionStatus,
      submittedAt: serverTimestamp(),
    };

    const docRef = await addDoc(transactionsCollection, transactionData);
    console.log('Transaction créée avec ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error);
    throw error;
  }
}

// S'abonner aux transactions d'un utilisateur
export function subscribeUserTransactions(
  userId: string,
  callback: (transactions: Transaction[]) => void
): () => void {
  // Requête simple sans orderBy pour éviter les problèmes d'index
  const q = query(
    transactionsCollection,
    where('userId', '==', userId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    console.log(`📊 subscribeUserTransactions: ${snapshot.size} transactions reçues pour utilisateur ${userId}`);
    const transactions: Transaction[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📄 Transaction ${doc.id}: statut=${data.status}, type=${data.type}, montant=${data.amount}`);
      
      // Assurer que tous les champs requis sont présents
      const transaction: Transaction = {
        id: doc.id,
        type: data.type || 'deposit',
        amount: data.amount || 0,
        paymentMethod: data.paymentMethod || 'orange',
        status: data.status || 'pending',
        userId: data.userId || userId,
        userNumeroTel: data.userNumeroTel || '',
        userPhone: data.userPhone || data.userNumeroTel || '',
        beneficiaryName: data.beneficiaryName || '',
        phoneNumber: data.phoneNumber || '',
        cryptoAddress: data.cryptoAddress || '',
        proofImage: data.proofImage || '',
        transactionImage: data.transactionImage || data.proofImage || '',
        submittedAt: data.submittedAt || data.createdAt || new Date(),
        createdAt: data.createdAt || data.submittedAt || new Date(),
        adminNotes: data.adminNotes || '',
        updatedAt: data.updatedAt || null
      };
      
      transactions.push(transaction);
    });
    
    // Trier manuellement par date
    transactions.sort((a, b) => {
      const getTime = (date: any) => {
        if (!date) return 0;
        if (typeof date === 'object' && date.seconds) return date.seconds * 1000;
        if (date instanceof Date) return date.getTime();
        if (typeof date === 'string') return new Date(date).getTime();
        return 0;
      };
      
      const timeA = getTime(a.submittedAt) || getTime(a.createdAt);
      const timeB = getTime(b.submittedAt) || getTime(b.createdAt);
      return timeB - timeA; // Plus récent en premier
    });
    
    console.log(`✅ subscribeUserTransactions: Envoi de ${transactions.length} transactions triées`);
    console.log('📋 Détail transactions:', transactions.map(t => `${t.id.slice(-4)}:${t.status}:${t.type}`));
    
    callback(transactions);
  }, (error) => {
    console.error('❌ Erreur lors de l\'écoute des transactions:', error);
    // En cas d'erreur, essayer de récupérer les transactions sans orderBy
    callback([]);
  });

  return unsubscribe;
}

// Récupérer les transactions pour l'admin avec filtres
export async function adminListTransactions(
  filters: TransactionFilters = {}
): Promise<Transaction[]> {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters.type) {
      constraints.push(where('type', '==', filters.type));
    }

    if (filters.paymentMethod) {
      constraints.push(where('paymentMethod', '==', filters.paymentMethod));
    }

    // Toujours trier par date de soumission
    constraints.push(orderBy('submittedAt', 'desc'));

    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }

    const q = query(transactionsCollection, ...constraints);
    const snapshot = await getDocs(q);

    const transactions: Transaction[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Mapper "approved" vers "success"
      if (data.status === 'approved') {
        data.status = 'success';
      }
      transactions.push({
        id: doc.id,
        ...data
      } as Transaction);
    });

    // Filtrage côté client pour la recherche
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return transactions.filter(t => 
        t.userNumeroTel.includes(searchLower) ||
        t.id.toLowerCase().includes(searchLower) ||
        t.beneficiaryName?.toLowerCase().includes(searchLower)
      );
    }

    return transactions;
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions admin:', error);
    throw error;
  }
}

// Alias pour compatibilité avec Dashboard
export const updateTransactionStatus = adminUpdateTransactionStatus;

// S'abonner à toutes les transactions pour l'admin
export function subscribeToAllTransactions(
  callback: (transactions: Transaction[]) => void
): () => void {
  console.log('🔧 subscribeToAllTransactions: Initialisation de l\'écoute');
  
  // Écoute simple sans orderBy pour éviter les erreurs d'index
  const unsubscribe = onSnapshot(transactionsCollection, (snapshot) => {
    console.log('📊 subscribeToAllTransactions: Snapshot reçu, nombre de docs:', snapshot.size);
    
    const transactions: Transaction[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Document reçu:', doc.id, data);
      
      // Mapper "approved" vers "success" pour compatibilité
      if (data.status === 'approved') {
        data.status = 'success';
      }
      transactions.push({
        id: doc.id,
        ...data
      } as Transaction);
    });
    
    // Trier manuellement par date de soumission (si elle existe)
    transactions.sort((a, b) => {
      const getTimestamp = (date: any) => {
        if (!date) return 0;
        if (typeof date === 'object' && 'seconds' in date) return date.seconds;
        if (date instanceof Date) return date.getTime() / 1000;
        return 0;
      };
      
      const dateA = getTimestamp(a.submittedAt);
      const dateB = getTimestamp(b.submittedAt);
      return dateB - dateA;
    });
    
    console.log('✅ subscribeToAllTransactions: Envoi de', transactions.length, 'transactions');
    callback(transactions);
  }, (error) => {
    console.error('❌ subscribeToAllTransactions: Erreur:', error);
    // En cas d'erreur, appeler le callback avec un tableau vide
    callback([]);
  });

  return unsubscribe;
}

// Mettre à jour le statut d'une transaction (admin uniquement)
export async function adminUpdateTransactionStatus(
  transactionId: string,
  newStatus: TransactionStatus,
  adminNotes?: string
): Promise<void> {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    const updateData: any = {
      status: newStatus,
      updatedAt: serverTimestamp()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    await updateDoc(transactionRef, updateData);
    console.log(`Transaction ${transactionId} mise à jour avec statut: ${newStatus}`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw error;
  }
}

// Approuver un dépôt (avec mise à jour atomique du solde)
export async function adminApproveDeposit(transactionId: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      // Récupérer la transaction
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionDoc = await transaction.get(transactionRef);
      
      if (!transactionDoc.exists()) {
        throw new Error('Transaction non trouvée');
      }

      const transactionData = transactionDoc.data() as Transaction;
      
      // Vérifier que c'est bien un dépôt en attente
      if (transactionData.type !== 'deposit') {
        throw new Error('Cette transaction n\'est pas un dépôt');
      }

      if (transactionData.status !== 'pending') {
        throw new Error('Cette transaction a déjà été traitée');
      }

      // Récupérer l'utilisateur
      const userRef = doc(db, 'users', transactionData.userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        // Créer l'utilisateur s'il n'existe pas avec solde initial de 1000 XOF + montant du dépôt
        transaction.set(userRef, {
          uid: transactionData.userId,
          numeroTel: transactionData.userNumeroTel,
          balance: 1000 + transactionData.amount, // Solde initial + dépôt
          role: 'user',
          createdAt: serverTimestamp()
        });
      } else {
        // Mettre à jour le solde principal (Atout) avec le montant du dépôt
        transaction.update(userRef, {
          balance: increment(transactionData.amount)
        });
      }

      // Mettre à jour le statut de la transaction
      transaction.update(transactionRef, {
        status: 'success',
        updatedAt: serverTimestamp()
      });
    });

    console.log(`Dépôt ${transactionId} approuvé avec succès`);
  } catch (error) {
    console.error('Erreur lors de l\'approbation du dépôt:', error);
    throw error;
  }
}

// Approuver un retrait (avec mise à jour atomique du solde)
export async function adminApproveWithdrawal(transactionId: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      // Récupérer la transaction
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionDoc = await transaction.get(transactionRef);
      
      if (!transactionDoc.exists()) {
        throw new Error('Transaction non trouvée');
      }

      const transactionData = transactionDoc.data() as Transaction;
      
      // Vérifier que c'est bien un retrait en attente
      if (transactionData.type !== 'withdrawal') {
        throw new Error('Cette transaction n\'est pas un retrait');
      }

      if (transactionData.status !== 'pending') {
        throw new Error('Cette transaction a déjà été traitée');
      }

      // Récupérer l'utilisateur
      const userRef = doc(db, 'users', transactionData.userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userDoc.data() as User;

      // Vérifier le solde suffisant
      if (userData.balance < transactionData.amount) {
        throw new Error('Solde insuffisant pour ce retrait');
      }

      // Mettre à jour le solde
      transaction.update(userRef, {
        balance: increment(-transactionData.amount)
      });

      // Mettre à jour le statut de la transaction
      transaction.update(transactionRef, {
        status: 'success',
        updatedAt: serverTimestamp()
      });
    });

    console.log(`Retrait ${transactionId} approuvé avec succès`);
  } catch (error) {
    console.error('Erreur lors de l\'approbation du retrait:', error);
    throw error;
  }
}

// Rejeter une transaction
export async function adminRejectTransaction(
  transactionId: string,
  reason?: string
): Promise<void> {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    await updateDoc(transactionRef, {
      status: 'rejected',
      adminNotes: reason || 'Transaction rejetée par l\'administrateur',
      updatedAt: serverTimestamp()
    });
    console.log(`Transaction ${transactionId} rejetée`);
  } catch (error) {
    console.error('Erreur lors du rejet de la transaction:', error);
    throw error;
  }
}

// Obtenir les statistiques des transactions
export async function getTransactionStats(): Promise<TransactionStats> {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Requêtes pour les statistiques
    const pendingQuery = query(transactionsCollection, where('status', '==', 'pending'));
    const pendingSnapshot = await getDocs(pendingQuery);

    let pendingDeposits = 0;
    let pendingWithdrawals = 0;
    let totalPending = 0;

    pendingSnapshot.forEach((doc) => {
      const data = doc.data();
      totalPending++;
      if (data.type === 'deposit') {
        pendingDeposits++;
      } else if (data.type === 'withdrawal') {
        pendingWithdrawals++;
      }
    });

    // Volume 24h (transactions approuvées)
    const volume24hQuery = query(
      transactionsCollection,
      where('status', '==', 'success'),
      where('updatedAt', '>=', Timestamp.fromDate(twentyFourHoursAgo))
    );
    const volume24hSnapshot = await getDocs(volume24hQuery);
    
    let volume24h = 0;
    volume24hSnapshot.forEach((doc) => {
      const data = doc.data();
      volume24h += data.amount;
    });

    // Total des transactions
    const allTransactionsSnapshot = await getDocs(transactionsCollection);
    const totalTransactions = allTransactionsSnapshot.size;

    return {
      totalPending,
      pendingDeposits,
      pendingWithdrawals,
      volume24h,
      totalTransactions
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      totalPending: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
      volume24h: 0,
      totalTransactions: 0
    };
  }
}

// Récupérer le solde d'un utilisateur
export async function getUserBalance(userId: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      return userData.balance || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Erreur lors de la récupération du solde:', error);
    return 0;
  }
}

// S'abonner au solde d'un utilisateur
export function subscribeToUserBalance(
  userId: string,
  callback: (balance: number) => void
): () => void {
  const userRef = doc(db, 'users', userId);
  
  const unsubscribe = onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const userData = doc.data() as User;
      callback(userData.balance || 0);
    } else {
      callback(0);
    }
  }, (error) => {
    console.error('Erreur lors de l\'écoute du solde:', error);
    callback(0);
  });

  return unsubscribe;
}

// Approuver une transaction (admin)
export async function approveTransaction(
  transactionId: string,
  adminId: string
): Promise<void> {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    
    await runTransaction(db, async (transaction) => {
      const transactionDoc = await transaction.get(transactionRef);
      
      if (!transactionDoc.exists()) {
        throw new Error('Transaction non trouvée');
      }
      
      const transactionData = transactionDoc.data();
      
      if (transactionData.status !== 'pending') {
        throw new Error('Transaction déjà traitée');
      }
      
      // Mettre à jour le statut de la transaction
      transaction.update(transactionRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: adminId
      });
      
      // Mettre à jour le solde utilisateur selon le type de transaction
      const userRef = doc(db, 'users', transactionData.userId);
      
      if (transactionData.type === 'deposit') {
        // Ajouter le montant au solde de dépôt (ne peut être retiré, doit être investi)
        transaction.update(userRef, {
          balance: increment(transactionData.amount),
          depositBalance: increment(transactionData.amount), // Solde de dépôt (pour investissement)
          totalDeposited: increment(transactionData.amount), // Ajouter au total des dépôts
          lastDepositDate: serverTimestamp() // Mettre à jour la date du dernier dépôt
        });
      } else if (transactionData.type === 'withdrawal') {
        // Déduire le montant du solde retirable uniquement
        transaction.update(userRef, {
          balance: increment(-transactionData.amount),
          withdrawableBalance: increment(-transactionData.amount) // Déduire du solde retirable
        });
      }
    });
    
    console.log(`✅ Transaction ${transactionId} approuvée et solde mis à jour instantanément`);
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error);
    throw error;
  }
}

// Rejeter une transaction (admin)
export async function rejectTransaction(
  transactionId: string,
  adminId: string,
  reason?: string
): Promise<void> {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    
    await updateDoc(transactionRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      rejectedBy: adminId,
      rejectionReason: reason || 'Aucune raison spécifiée'
    });
    
    console.log(`❌ Transaction ${transactionId} rejetée`);
  } catch (error) {
    console.error('Erreur lors du rejet:', error);
    throw error;
  }
}

// Vérifier si un utilisateur est admin
export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      return userData.role === 'admin';
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle admin:', error);
    return false;
  }
}

// Initialiser ou mettre à jour un utilisateur
export async function initializeUser(
  uid: string,
  numeroTel: string,
  displayName: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Créer le nouvel utilisateur avec solde de base 1000 XOF
      await updateDoc(userRef, {
        uid,
        numeroTel,
        displayName,
        balance: 1000, // Solde initial de 1000 XOF
        role: 'user',
        createdAt: serverTimestamp()
      });
    } else {
      // Mettre à jour les infos si nécessaire
      await updateDoc(userRef, {
        numeroTel,
        displayName
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'utilisateur:', error);
  }
}

// Ajouter une récompense check-in au solde Firestore
export async function addCheckInReward(
  uid: string,
  rewardAmount: number
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const currentBalance = userDoc.data().balance || 0;
      const currentWithdrawable = userDoc.data().withdrawableBalance || 0;
      transaction.update(userRef, {
        balance: currentBalance + rewardAmount,
        withdrawableBalance: currentWithdrawable + rewardAmount // Ajouter au solde retirable
      });
    });
    
    console.log(`Récompense check-in de ${rewardAmount} FCFA ajoutée au solde`);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la récompense check-in:', error);
    throw error;
  }
}

// S'abonner aux transactions en temps réel (pour admin)
export function subscribeToTransactions(
  callback: (transactions: Transaction[]) => void,
  filters?: TransactionFilters
): () => void {
  let q = query(
    transactionsCollection,
    orderBy('submittedAt', 'desc')
  );

  // Appliquer les filtres si fournis
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters?.type) {
    q = query(q, where('type', '==', filters.type));
  }
  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const transactions: Transaction[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const transaction = {
        ...data,
        id: doc.id,
        submittedAt: data.submittedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || null,
        rejectedAt: data.rejectedAt?.toDate() || null,
      };
      transactions.push(transaction as unknown as Transaction);
    });
    callback(transactions);
  }, (error) => {
    console.error('Erreur lors de l\'écoute des transactions:', error);
    callback([]);
  });

  return unsubscribe;
}

export type { Transaction };

