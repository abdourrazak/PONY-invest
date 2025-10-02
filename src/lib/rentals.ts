import { 
  doc, 
  updateDoc, 
  getDoc,
  getDocs,
  addDoc,
  collection,
  serverTimestamp,
  runTransaction,
  increment,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { processReferralCommissions } from './referralCommissions';
import { validateInvestment } from './investmentRules';

export interface RentalData {
  id: string
  userId: string
  userNumeroTel: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalCost: number
  dailyRevenue: number
  duration: number
  totalExpectedRevenue: number
  startDate: Date
  endDate: Date
  status: 'active' | 'completed' | 'cancelled'
  createdAt: Date
}

// Créer une nouvelle location/investissement
export async function createRental(
  userId: string,
  userNumeroTel: string,
  productData: {
    id: string
    name: string
    price: number
    dailyRevenue: number
    duration: number
    totalRevenue: number
  },
  quantity: number
): Promise<string> {
  try {
    const totalCost = productData.price * quantity
    
    // VALIDATION DES RÈGLES D'INVESTISSEMENT
    const validation = await validateInvestment(userId, productData.id, totalCost)
    if (!validation.canInvest) {
      throw new Error(validation.message)
    }
    
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + (productData.duration * 24 * 60 * 60 * 1000))

    const rentalId = await runTransaction(db, async (transaction) => {
      // Vérifier le solde de l'utilisateur
      const userRef = doc(db, 'users', userId)
      const userDoc = await transaction.get(userRef)
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé')
      }

      const userData = userDoc.data()
      const currentBalance = userData.balance || 0
      const currentDepositBalance = userData.depositBalance || 0
      const currentWithdrawableBalance = userData.withdrawableBalance || 0

      if (currentBalance < totalCost) {
        throw new Error(`Solde insuffisant. Vous avez ${currentBalance.toLocaleString()} FCFA mais il faut ${totalCost.toLocaleString()} FCFA.`)
      }

      // Déduire d'abord du depositBalance, puis du withdrawableBalance si nécessaire
      let remainingCost = totalCost
      let deductFromDeposit = 0
      let deductFromWithdrawable = 0

      if (currentDepositBalance >= remainingCost) {
        // Tout peut être déduit du depositBalance
        deductFromDeposit = remainingCost
      } else {
        // Déduire tout le depositBalance puis le reste du withdrawableBalance
        deductFromDeposit = currentDepositBalance
        deductFromWithdrawable = remainingCost - currentDepositBalance
      }

      console.log('💰 Déduction:', {
        totalCost,
        deductFromDeposit,
        deductFromWithdrawable
      })

      // Mettre à jour les soldes
      transaction.update(userRef, {
        balance: increment(-totalCost),
        depositBalance: increment(-deductFromDeposit),
        withdrawableBalance: increment(-deductFromWithdrawable),
        totalInvested: increment(totalCost),
        hasInvested: true
      })

      // Créer l'enregistrement de location
      const rentalData: Omit<RentalData, 'id'> = {
        userId,
        userNumeroTel,
        productId: productData.id,
        productName: productData.name,
        quantity,
        unitPrice: productData.price,
        totalCost,
        dailyRevenue: productData.dailyRevenue,
        duration: productData.duration,
        totalExpectedRevenue: productData.totalRevenue * quantity,
        startDate,
        endDate,
        status: 'active',
        createdAt: new Date()
      }

      const rentalsCollection = collection(db, 'rentals')
      const rentalRef = doc(rentalsCollection)
      transaction.set(rentalRef, {
        ...rentalData,
        startDate: serverTimestamp(),
        endDate: new Date(Date.now() + (productData.duration * 24 * 60 * 60 * 1000)),
        createdAt: serverTimestamp()
      })

      return rentalRef.id
    })

    // Traiter les commissions de parrainage après la transaction réussie
    try {
      await processReferralCommissions(
        userId,
        userNumeroTel,
        totalCost,
        productData.name
      )
      console.log(`✅ Commissions de parrainage traitées pour l'investissement de ${totalCost} FCFA`)
    } catch (commissionError) {
      console.error('❌ Erreur lors du traitement des commissions:', commissionError)
      // Ne pas faire échouer la transaction principale si les commissions échouent
    }

    return rentalId
  } catch (error) {
    console.error('Erreur lors de la création de la location:', error)
    throw error
  }
}

// Récupérer les locations d'un utilisateur
export async function getUserRentals(userId: string): Promise<RentalData[]> {
  try {
    console.log('🔍 getUserRentals - Recherche pour userId:', userId)
    
    const rentalsCollection = collection(db, 'rentals')
    const q = query(
      rentalsCollection,
      where('userId', '==', userId)
      // Temporairement supprimé orderBy pour éviter l'erreur d'index
      // orderBy('createdAt', 'desc')
    )
    
    console.log('📋 getUserRentals - Exécution de la requête Firestore...')
    const querySnapshot = await getDocs(q)
    console.log('📋 getUserRentals - Nombre de documents trouvés:', querySnapshot.size)
    
    const rentals: RentalData[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      console.log('📄 getUserRentals - Document trouvé:', doc.id, data)
      
      rentals.push({
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date()
      } as RentalData)
    })
    
    // Tri manuel par date de création (plus récent en premier)
    rentals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    console.log('✅ getUserRentals - Locations finales:', rentals)
    return rentals
  } catch (error) {
    console.error('❌ getUserRentals - Erreur lors de la récupération des locations:', error)
    return []
  }
}

// Collecter les gains accumulés d'un investissement
export async function collectRentalEarnings(
  userId: string, 
  rentalId: string, 
  accumulatedRevenue: number
): Promise<void> {
  try {
    console.log('💰 Début de la collecte des gains:', { userId, rentalId, accumulatedRevenue })
    
    await runTransaction(db, async (transaction) => {
      // Référence vers l'utilisateur
      const userRef = doc(db, 'users', userId)
      const userDoc = await transaction.get(userRef)
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé')
      }

      // Référence vers la location
      const rentalRef = doc(db, 'rentals', rentalId)
      const rentalDoc = await transaction.get(rentalRef)
      
      if (!rentalDoc.exists()) {
        throw new Error('Location non trouvée')
      }

      const rentalData = rentalDoc.data()
      const lastCollectionDate = rentalData.lastCollectionDate?.toDate() || rentalData.startDate?.toDate() || new Date()
      const now = new Date()

      // Calculer les gains depuis la dernière collecte
      const daysSinceLastCollection = Math.floor((now.getTime() - lastCollectionDate.getTime()) / (24 * 60 * 60 * 1000))
      const collectibleRevenue = Math.max(0, daysSinceLastCollection) * rentalData.dailyRevenue * rentalData.quantity

      if (collectibleRevenue <= 0) {
        throw new Error('Aucun gain à collecter')
      }

      // Mettre à jour le solde de l'utilisateur (ajouter au solde retirable)
      transaction.update(userRef, {
        balance: increment(collectibleRevenue),
        withdrawableBalance: increment(collectibleRevenue) // Ajouter au solde retirable
      })

      // Mettre à jour la date de dernière collecte
      transaction.update(rentalRef, {
        lastCollectionDate: serverTimestamp(),
        totalCollected: increment(collectibleRevenue)
      })

      console.log('✅ Gains collectés avec succès:', collectibleRevenue, 'FCFA')
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de la collecte des gains:', error)
    throw error
  }
}

// Calculer les revenus quotidiens pour un utilisateur
export async function calculateDailyRevenue(userId: string): Promise<number> {
  try {
    // TODO: Implement daily revenue calculation
    return 0
  } catch (error) {
    console.error('Erreur lors du calcul des revenus quotidiens:', error)
    return 0
  }
}
