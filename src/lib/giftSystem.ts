import { db } from './firebase'
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, Timestamp, addDoc } from 'firebase/firestore'
import { getReferrals } from './firebaseAuth'

// Interface pour les données de cadeau utilisateur
export interface UserGiftData {
  userId: string
  totalBonus: number
  validReferrals: number
  lastSpin: Timestamp | null
  canSpin: boolean
  spinCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Interface pour l'historique des spins
export interface SpinHistory {
  id: string
  userId: string
  amount: number
  spinType: 'first' | 'referral' | 'daily'
  timestamp: Timestamp
}

// Créer ou récupérer les données de cadeau d'un utilisateur
export async function getUserGiftData(userId: string): Promise<UserGiftData> {
  try {
    const giftDocRef = doc(db, 'userGifts', userId)
    const giftDoc = await getDoc(giftDocRef)
    
    if (giftDoc.exists()) {
      return { ...giftDoc.data(), userId } as UserGiftData
    } else {
      // Créer de nouvelles données de cadeau
      const newGiftData: UserGiftData = {
        userId,
        totalBonus: 0,
        validReferrals: 0,
        lastSpin: null,
        canSpin: true,
        spinCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      
      await setDoc(giftDocRef, newGiftData)
      return newGiftData
    }
  } catch (error) {
    console.error('Erreur récupération données cadeau:', error)
    throw error
  }
}

// Vérifier les filleuls valides avec le système de transactions
export async function validateReferrals(userId: string, referralCode: string): Promise<number> {
  try {
    // Récupérer tous les filleuls
    const referrals = await getReferrals(referralCode)
    
    let validCount = 0
    
    // Vérifier chaque filleul
    for (const referral of referrals) {
      const isValid = await checkReferralValidity(referral.uid)
      if (isValid) {
        validCount++
      }
    }
    
    return validCount
  } catch (error) {
    console.error('Erreur validation filleuls:', error)
    return 0
  }
}

// Vérifier si un filleul est valide (a fait des transactions approuvées >= 500 $)
export async function checkReferralValidity(referralUserId: string): Promise<boolean> {
  try {
    const transactionsRef = collection(db, 'transactions')
    const q = query(
      transactionsRef,
      where('userId', '==', referralUserId),
      where('type', '==', 'deposit'),
      where('status', '==', 'approved')
    )
    
    const querySnapshot = await getDocs(q)
    let totalDeposits = 0
    
    querySnapshot.forEach((doc) => {
      const transaction = doc.data()
      totalDeposits += transaction.amount || 0
    })
    
    return totalDeposits >= 500
  } catch (error) {
    console.error('Erreur vérification validité filleul:', error)
    return false
  }
}

// Effectuer un spin et mettre à jour Firestore
export async function performSpin(userId: string, referralCode: string): Promise<{
  success: boolean
  amount: number
  newTotal: number
  spinType: 'first' | 'referral' | 'daily'
  message: string
}> {
  try {
    // Récupérer les données actuelles
    const giftData = await getUserGiftData(userId)
    
    // Vérifier si l'utilisateur peut tourner
    if (!canUserSpin(giftData)) {
      return {
        success: false,
        amount: 0,
        newTotal: giftData.totalBonus,
        spinType: 'daily',
        message: 'Vous devez attendre 24h avant le prochain tour'
      }
    }
    
    // Vérifier les nouveaux filleuls valides
    const currentValidReferrals = await validateReferrals(userId, referralCode)
    const newValidReferrals = Math.max(0, currentValidReferrals - giftData.validReferrals)
    
    // Calculer le montant du spin
    let spinAmount: number
    let spinType: 'first' | 'referral' | 'daily'
    
    if (giftData.spinCount === 0) {
      // Premier spin : montant élevé
      spinAmount = Math.floor(Math.random() * 61) + 4850 // 4850-4910 $
      spinType = 'first'
    } else if (newValidReferrals > 0) {
      // Bonus de parrainage
      spinAmount = Math.floor(Math.random() * 6) + 1 // 1-6 $
      spinType = 'referral'
    } else {
      // Spin quotidien normal
      spinAmount = Math.floor(Math.random() * 5) + 1 // 1-5 $
      spinType = 'daily'
    }
    
    // Calculer le nouveau total (max 5000 $)
    const newTotal = Math.min(giftData.totalBonus + spinAmount, 5000)
    
    // Mettre à jour les données dans Firestore
    const giftDocRef = doc(db, 'userGifts', userId)
    const updateData: Partial<UserGiftData> = {
      totalBonus: newTotal,
      validReferrals: currentValidReferrals,
      lastSpin: Timestamp.now(),
      canSpin: currentValidReferrals >= 60, // Peut tourner immédiatement si 60+ filleuls
      spinCount: giftData.spinCount + 1,
      updatedAt: Timestamp.now()
    }
    
    await updateDoc(giftDocRef, updateData)
    
    // Enregistrer l'historique du spin
    await recordSpinHistory(userId, spinAmount, spinType)
    
    return {
      success: true,
      amount: spinAmount,
      newTotal,
      spinType,
      message: `Vous avez gagné ${spinAmount.toLocaleString()} $ !`
    }
    
  } catch (error) {
    console.error('Erreur lors du spin:', error)
    return {
      success: false,
      amount: 0,
      newTotal: 0,
      spinType: 'daily',
      message: 'Erreur lors du spin. Veuillez réessayer.'
    }
  }
}

// Vérifier si un utilisateur peut tourner
export function canUserSpin(giftData: UserGiftData): boolean {
  if (!giftData.lastSpin) return true
  
  // Si l'utilisateur a 60+ filleuls valides, pas de cooldown
  if (giftData.validReferrals >= 60) return true
  
  // Sinon, vérifier le cooldown de 24h
  const now = Date.now()
  const lastSpinTime = giftData.lastSpin.toMillis()
  const cooldown = 24 * 60 * 60 * 1000 // 24h en millisecondes
  
  return (now - lastSpinTime) >= cooldown
}

// Calculer le temps restant avant le prochain spin
export function getTimeUntilNextSpin(giftData: UserGiftData): number {
  if (!giftData.lastSpin || giftData.validReferrals >= 60) return 0
  
  const now = Date.now()
  const lastSpinTime = giftData.lastSpin.toMillis()
  const cooldown = 24 * 60 * 60 * 1000 // 24h
  const timeRemaining = cooldown - (now - lastSpinTime)
  
  return Math.max(0, timeRemaining)
}

// Enregistrer l'historique des spins
async function recordSpinHistory(userId: string, amount: number, spinType: 'first' | 'referral' | 'daily'): Promise<void> {
  try {
    const historyRef = collection(db, 'spinHistory')
    const historyData: Omit<SpinHistory, 'id'> = {
      userId,
      amount,
      spinType,
      timestamp: Timestamp.now()
    }
    
    await setDoc(doc(historyRef), historyData)
  } catch (error) {
    console.error('Erreur enregistrement historique spin:', error)
  }
}

// Récupérer l'historique des spins d'un utilisateur
export async function getUserSpinHistory(userId: string, limit: number = 10): Promise<SpinHistory[]> {
  try {
    const historyRef = collection(db, 'spinHistory')
    const q = query(historyRef, where('userId', '==', userId))
    
    const querySnapshot = await getDocs(q)
    const history: SpinHistory[] = []
    
    querySnapshot.forEach((doc) => {
      history.push({ ...doc.data(), id: doc.id } as SpinHistory)
    })
    
    // Trier par date décroissante et limiter
    return history
      .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
      .slice(0, limit)
  } catch (error) {
    console.error('Erreur récupération historique:', error)
    return []
  }
}
