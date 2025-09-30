import { doc, getDoc, getDocs, query, where, collection } from 'firebase/firestore'
import { db } from './firebase'
import { User } from './firebaseAuth'
import { RentalData } from './rentals'

// Interface pour les règles d'investissement
export interface InvestmentValidation {
  canInvest: boolean
  canWithdraw: boolean
  message: string
  nextAllowedLevel?: string
}

// Vérifier si un utilisateur peut investir dans un produit
export async function validateInvestment(
  userId: string, 
  productId: string, 
  investmentAmount: number
): Promise<InvestmentValidation> {
  try {
    // Récupérer les données utilisateur
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return {
        canInvest: false,
        canWithdraw: false,
        message: 'Utilisateur non trouvé'
      }
    }

    const userData = userDoc.data() as User
    
    // Récupérer les investissements existants
    const rentalsQuery = query(
      collection(db, 'rentals'),
      where('userId', '==', userId)
    )
    const rentalsSnapshot = await getDocs(rentalsQuery)
    const userRentals: RentalData[] = []
    
    rentalsSnapshot.forEach((doc) => {
      const data = doc.data()
      userRentals.push({
        id: doc.id,
        userId: data.userId,
        userNumeroTel: data.userNumeroTel,
        productId: data.productId,
        productName: data.productName,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalCost: data.totalCost,
        dailyRevenue: data.dailyRevenue,
        duration: data.duration,
        totalExpectedRevenue: data.totalExpectedRevenue,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        status: data.status || 'active',
        createdAt: data.createdAt?.toDate() || new Date(),
        lastCollectionDate: data.lastCollectionDate?.toDate() || null,
        totalCollected: data.totalCollected || 0
      } as RentalData)
    })

    // RÈGLE 1: Vérifier si l'utilisateur a déjà investi dans ce produit
    const existingInvestment = userRentals.find(rental => rental.productId === productId)
    if (existingInvestment) {
      return {
        canInvest: false,
        canWithdraw: false,
        message: `Vous avez déjà investi dans ${productId.toUpperCase()}. Vous ne pouvez pas investir deux fois dans le même produit.`
      }
    }

    // RÈGLE 2: Vérifier qu'on ne revient pas en arrière (pas de régression)
    const levelOrder = ['lv1', 'lv2', 'lv3', 'lv4', 'lv5', 'lv6', 'lv7']
    const currentProductIndex = levelOrder.indexOf(productId.toLowerCase())
    
    if (currentProductIndex === -1) {
      return {
        canInvest: false,
        canWithdraw: false,
        message: 'Produit non reconnu'
      }
    }

    // Trouver le niveau le plus élevé déjà investi
    let highestInvestedLevel = -1
    userRentals.forEach(rental => {
      const rentalIndex = levelOrder.indexOf(rental.productId.toLowerCase())
      if (rentalIndex > highestInvestedLevel) {
        highestInvestedLevel = rentalIndex
      }
    })

    // Vérifier qu'on ne revient pas en arrière (on peut sauter des niveaux mais pas régresser)
    if (currentProductIndex <= highestInvestedLevel) {
      return {
        canInvest: false,
        canWithdraw: false,
        message: `Vous ne pouvez pas investir dans ${productId.toUpperCase()} car vous avez déjà investi dans un niveau supérieur ou égal. Vous devez progresser vers des niveaux plus élevés.`,
        nextAllowedLevel: highestInvestedLevel < levelOrder.length - 1 ? levelOrder[highestInvestedLevel + 1]?.toUpperCase() : undefined
      }
    }

    // RÈGLE 3: Vérifier si l'utilisateur peut retirer (doit avoir investi tout son dépôt)
    const totalDeposited = userData.totalDeposited || 0
    const totalInvested = userData.totalInvested || 0
    const remainingToInvest = totalDeposited - totalInvested
    
    const canWithdraw = remainingToInvest <= 0

    // Si l'investissement actuel dépasse ce qui reste à investir
    if (investmentAmount > remainingToInvest && remainingToInvest > 0) {
      return {
        canInvest: false,
        canWithdraw: false,
        message: `Vous devez d'abord investir les ${remainingToInvest.toLocaleString()} FCFA restants de votre dépôt avant de pouvoir investir plus.`
      }
    }

    return {
      canInvest: true,
      canWithdraw: canWithdraw,
      message: 'Investissement autorisé'
    }

  } catch (error) {
    console.error('Erreur validation investissement:', error)
    return {
      canInvest: false,
      canWithdraw: false,
      message: 'Erreur lors de la validation'
    }
  }
}

// Vérifier si un utilisateur peut effectuer un retrait
export async function canUserWithdraw(userId: string): Promise<{canWithdraw: boolean, message: string}> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return {
        canWithdraw: false,
        message: 'Utilisateur non trouvé'
      }
    }

    const userData = userDoc.data() as User
    const totalDeposited = userData.totalDeposited || 0
    const totalInvested = userData.totalInvested || 0
    const remainingToInvest = totalDeposited - totalInvested

    if (remainingToInvest > 0) {
      return {
        canWithdraw: false,
        message: `Vous devez d'abord investir les ${remainingToInvest.toLocaleString()} FCFA restants de votre dépôt avant de pouvoir effectuer un retrait.`
      }
    }

    return {
      canWithdraw: true,
      message: 'Retrait autorisé'
    }

  } catch (error) {
    console.error('Erreur vérification retrait:', error)
    return {
      canWithdraw: false,
      message: 'Erreur lors de la vérification'
    }
  }
}

// Obtenir le niveau minimum autorisé pour un utilisateur (premier niveau supérieur au plus haut investi)
export async function getNextAllowedLevel(userId: string): Promise<string | null> {
  try {
    const rentalsQuery = query(
      collection(db, 'rentals'),
      where('userId', '==', userId)
    )
    const rentalsSnapshot = await getDocs(rentalsQuery)
    
    const levelOrder = ['lv1', 'lv2', 'lv3', 'lv4', 'lv5', 'lv6', 'lv7']
    let highestInvestedLevel = -1
    
    rentalsSnapshot.forEach((doc) => {
      const data = doc.data()
      const rentalIndex = levelOrder.indexOf(data.productId.toLowerCase())
      if (rentalIndex > highestInvestedLevel) {
        highestInvestedLevel = rentalIndex
      }
    })

    // Retourner le niveau suivant le plus élevé (mais l'utilisateur peut aussi choisir des niveaux supérieurs)
    const nextLevelIndex = highestInvestedLevel + 1
    return nextLevelIndex < levelOrder.length ? levelOrder[nextLevelIndex] : null

  } catch (error) {
    console.error('Erreur récupération prochain niveau:', error)
    return null
  }
}
