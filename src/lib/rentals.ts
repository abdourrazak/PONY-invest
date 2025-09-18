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
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + (productData.duration * 24 * 60 * 60 * 1000))

    return await runTransaction(db, async (transaction) => {
      // Vérifier le solde de l'utilisateur
      const userRef = doc(db, 'users', userId)
      const userDoc = await transaction.get(userRef)
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé')
      }

      const userData = userDoc.data()
      const currentBalance = userData.balance || 0

      if (currentBalance < totalCost) {
        throw new Error(`Solde insuffisant. Vous avez ${currentBalance.toLocaleString()} FCFA mais il faut ${totalCost.toLocaleString()} FCFA.`)
      }

      // Déduire le montant du solde
      transaction.update(userRef, {
        balance: increment(-totalCost),
        hasInvested: true // Marquer l'utilisateur comme ayant investi
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
        dailyRevenue: productData.dailyRevenue * quantity,
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
  } catch (error) {
    console.error('Erreur lors de la création de la location:', error)
    throw error
  }
}

// Récupérer les locations d'un utilisateur
export async function getUserRentals(userId: string): Promise<RentalData[]> {
  try {
    const rentalsCollection = collection(db, 'rentals')
    const q = query(
      rentalsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const rentals: RentalData[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      rentals.push({
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date()
      } as RentalData)
    })
    
    return rentals
  } catch (error) {
    console.error('Erreur lors de la récupération des locations:', error)
    return []
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
