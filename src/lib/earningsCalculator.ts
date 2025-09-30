import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

// Interface pour les gains
export interface UserEarnings {
  todayEarnings: number
  totalEarnings: number
  breakdown: {
    referralCommissions: number
    productRevenue: number
    checkInRewards: number
  }
}

// Calculer les gains d'aujourd'hui et totaux
export async function calculateUserEarnings(userId: string): Promise<UserEarnings> {
  try {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    let todayEarnings = 0
    let totalEarnings = 0
    let referralCommissions = 0
    let productRevenue = 0
    let checkInRewards = 0

    // 1. Commissions de parrainage
    const commissionsQuery = query(
      collection(db, 'referralCommissions'),
      where('sponsorId', '==', userId)
    )
    const commissionsSnapshot = await getDocs(commissionsQuery)
    
    commissionsSnapshot.forEach((doc) => {
      const data = doc.data()
      const amount = data.commissionAmount || 0
      totalEarnings += amount
      referralCommissions += amount
      
      // Vérifier si c'est aujourd'hui
      if (data.createdAt && data.createdAt.toDate() >= startOfToday) {
        todayEarnings += amount
      }
    })

    // 2. Revenus des produits (collectés)
    const rentalsQuery = query(
      collection(db, 'rentals'),
      where('userId', '==', userId)
    )
    const rentalsSnapshot = await getDocs(rentalsQuery)
    
    rentalsSnapshot.forEach((doc) => {
      const data = doc.data()
      const collected = data.totalCollected || 0
      totalEarnings += collected
      productRevenue += collected
      
      // Pour aujourd'hui, calculer les revenus collectés aujourd'hui
      // (difficile sans historique, on estime basé sur lastCollectionDate)
      if (data.lastCollectionDate && data.lastCollectionDate.toDate() >= startOfToday) {
        const dailyRevenue = (data.dailyRevenue || 0) * (data.quantity || 1)
        todayEarnings += dailyRevenue
      }
    })

    // 3. Récompenses check-in (depuis localStorage et Firestore)
    // On va chercher dans l'historique des transactions ou dans les données utilisateur
    // Pour simplifier, on peut estimer basé sur le withdrawableBalance
    
    return {
      todayEarnings,
      totalEarnings,
      breakdown: {
        referralCommissions,
        productRevenue,
        checkInRewards
      }
    }
  } catch (error) {
    console.error('Erreur calcul gains:', error)
    return {
      todayEarnings: 0,
      totalEarnings: 0,
      breakdown: {
        referralCommissions: 0,
        productRevenue: 0,
        checkInRewards: 0
      }
    }
  }
}

// Calculer le pourcentage de croissance
export function calculateGrowthPercentage(todayEarnings: number, totalEarnings: number): number {
  if (totalEarnings === 0) return 0
  return Math.round((todayEarnings / totalEarnings) * 100)
}
