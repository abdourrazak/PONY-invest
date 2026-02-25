import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import { User } from './firebaseAuth'

// Obtenir le solde retirable d'un utilisateur
export async function getWithdrawableBalance(userId: string): Promise<number> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return 0
    }

    const userData = userDoc.data() as User
    // S'assurer que le solde ne soit jamais négatif
    return Math.max(0, userData.withdrawableBalance || 0)
  } catch (error) {
    console.error('Erreur récupération solde retirable:', error)
    return 0
  }
}

// S'abonner au solde retirable en temps réel
export function subscribeToWithdrawableBalance(
  userId: string,
  callback: (withdrawableBalance: number, depositBalance: number, totalBalance: number) => void
): () => void {
  const userRef = doc(db, 'users', userId)

  const unsubscribe = onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const userData = doc.data() as User
      // S'assurer que les soldes ne soient jamais négatifs
      const withdrawableBalance = Math.max(0, userData.withdrawableBalance || 0)
      const depositBalance = Math.max(0, userData.depositBalance || 0)
      const totalBalance = Math.max(0, userData.balance || 0)

      callback(withdrawableBalance, depositBalance, totalBalance)
    } else {
      callback(0, 0, 0)
    }
  }, (error) => {
    console.error('Erreur abonnement solde retirable:', error)
    callback(0, 0, 0)
  })

  return unsubscribe
}

// Obtenir la répartition complète du solde
export async function getBalanceBreakdown(userId: string): Promise<{
  totalBalance: number
  depositBalance: number
  withdrawableBalance: number
  breakdown: {
    signupBonus: number
    referralCommissions: number
    productEarnings: number
    checkinRewards: number
  }
}> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return {
        totalBalance: 0,
        depositBalance: 0,
        withdrawableBalance: 0,
        breakdown: {
          signupBonus: 0,
          referralCommissions: 0,
          productEarnings: 0,
          checkinRewards: 0
        }
      }
    }

    const userData = userDoc.data() as User

    return {
      totalBalance: Math.max(0, userData.balance || 0),
      depositBalance: Math.max(0, userData.depositBalance || 0),
      withdrawableBalance: Math.max(0, userData.withdrawableBalance || 0),
      breakdown: {
        signupBonus: 2, // Bonus d'inscription fixe $2
        referralCommissions: 0, // À calculer depuis referralCommissions
        productEarnings: 0, // À calculer depuis rentals
        checkinRewards: 0 // À calculer depuis userGifts
      }
    }
  } catch (error) {
    console.error('Erreur récupération répartition solde:', error)
    return {
      totalBalance: 0,
      depositBalance: 0,
      withdrawableBalance: 0,
      breakdown: {
        signupBonus: 0,
        referralCommissions: 0,
        productEarnings: 0,
        checkinRewards: 0
      }
    }
  }
}
