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
  const q = query(
    transactionsCollection,
    where('userId', '==', userId),
    orderBy('submittedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const transactions: Transaction[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Mapper "approved" vers "success" pour compatibilité
      if (data.status === 'approved') {
        data.status = 'success';
      }
      transactions.push({
        id: doc.id,
        ...data
      } as Transaction);
    });
    callback(transactions);
  }, (error) => {
    console.error('Erreur lors de l\'écoute des transactions:', error);
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
  const q = query(
    transactionsCollection,
    orderBy('submittedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const transactions: Transaction[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Mapper "approved" vers "success" pour compatibilité
      if (data.status === 'approved') {
        data.status = 'success';
      }
      transactions.push({
        id: doc.id,
        ...data
      } as Transaction);
    });
    callback(transactions);
  }, (error) => {
    console.error('Erreur lors de l\'écoute des transactions:', error);
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
        // Créer l'utilisateur s'il n'existe pas
        transaction.set(userRef, {
          uid: transactionData.userId,
          numeroTel: transactionData.userNumeroTel,
          balance: transactionData.amount,
          role: 'user',
          createdAt: serverTimestamp()
        });
      } else {
        // Mettre à jour le solde
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
      // Créer le nouvel utilisateur
      await updateDoc(userRef, {
        uid,
        numeroTel,
        displayName,
        balance: 0,
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
