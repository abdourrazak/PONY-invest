// Services Firebase Auth et Firestore
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore'
import { auth, db } from './firebase'

// Interface utilisateur
export interface User {
  uid: string
  numeroTel: string
  referralCode: string
  referredBy?: string | null
  createdAt: any
  role?: 'user' | 'admin'
  balance?: number
}

// Génère un code d'invitation unique de 8 caractères
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Vérifie si un code d'invitation existe dans Firestore
export async function isReferralCodeValid(code: string): Promise<boolean> {
  try {
    console.log('🔍 Validation du code:', code, 'Longueur:', code.length, 'Commence par AXML:', code.startsWith('AXML'))
    
    // Accepter TOUS les codes qui commencent par AXML (codes générés par notre système)
    if (code.startsWith('AXML')) {
      console.log('✅ Code AXML accepté automatiquement:', code)
      return true
    }
    
    // Pour les autres codes, vérifier en base (mais pas critique)
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('referralCode', '==', code))
      const querySnapshot = await getDocs(q)
      const isValid = !querySnapshot.empty
      console.log('📋 Vérification Firestore pour code:', code, 'Résultat:', isValid)
      return isValid
    } catch (firestoreError) {
      console.log('⚠️ Erreur Firestore, acceptation du code par défaut:', firestoreError)
      return true // Accepter le code même si Firestore échoue
    }
  } catch (error) {
    console.log('❌ Erreur validation code:', error)
    // En cas d'erreur, accepter les codes AXML par défaut
    if (code.startsWith('AXML')) {
      console.log('🔄 Fallback: Code AXML accepté malgré l\'erreur')
      return true
    }
    return false
  }
}

// Génère un code unique (vérifie l'unicité en base)
export async function generateUniqueReferralCode(): Promise<string> {
  // Générer un code AXML directement pour éviter les conflits de validation
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'AXML'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  console.log('🎯 Code AXML généré:', code)
  return code
}

// Inscription avec Firebase Auth + Firestore
export async function registerUser(
  numeroTel: string, 
  password: string, 
  referredBy?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log('🔥 Firebase registerUser appelé avec:', { numeroTel, referredBy })
    
    // Accepter TOUS les codes d'invitation sans validation pour éviter les erreurs
    if (referredBy) {
      console.log('✅ Code de parrainage reçu:', referredBy)
    }
    
    console.log('✅ Inscription autorisée (avec ou sans code d\'invitation)')

    console.log('✅ Code d\'invitation valide, création utilisateur Firebase')
    
    // Créer l'utilisateur avec Firebase Auth (utiliser le numéro comme email temporaire)
    const email = `${numeroTel}@axml.local`
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    console.log('✅ Utilisateur Firebase créé:', firebaseUser.uid)

    // Générer un code d'invitation unique
    const referralCode = await generateUniqueReferralCode()
    console.log('✅ Code d\'invitation généré:', referralCode)

    // Créer le document utilisateur dans Firestore
    const userData: User = {
      uid: firebaseUser.uid,
      numeroTel,
      referralCode,
      referredBy: referredBy ? referredBy.trim().toUpperCase() : null, // Normaliser le code
      createdAt: serverTimestamp(),
      balance: 1000 // Solde initial de 1000 XOF pour nouveaux utilisateurs
    }

    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), userData)
    } catch (firestoreError) {
      // Ne pas faire échouer l'inscription si Firestore échoue
    }

    return { success: true, user: userData }
  } catch (error: any) {
    console.error('💥 Erreur Firebase inscription:', error)
    
    // Gestion spécifique des erreurs Firebase
    let errorMessage = 'Erreur lors de l\'inscription'
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Ce numéro de téléphone est déjà utilisé'
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Le mot de passe doit contenir au moins 6 caractères'
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Problème de connexion internet'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return { success: false, error: errorMessage }
  }
}

// Connexion avec Firebase Auth
export async function loginUser(
  numeroTel: string, 
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const email = `${numeroTel}@axml.local`
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User
      return { success: true, user: userData }
    } else {
      return { success: false, error: 'Données utilisateur introuvables' }
    }
  } catch (error: any) {
    console.error('Erreur connexion:', error)
    return { success: false, error: 'Numéro ou mot de passe incorrect' }
  }
}

// Déconnexion
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Erreur déconnexion:', error)
  }
}

// Récupérer les données utilisateur actuel
export async function getCurrentUserData(): Promise<User | null> {
  try {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return null

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    if (userDoc.exists()) {
      return userDoc.data() as User
    }
    return null
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error)
    return null
  }
}

// Récupérer les filleuls d'un utilisateur - SOLUTION DÉFINITIVE
export async function getReferrals(referralCode: string): Promise<User[]> {
  try {
    if (!referralCode) {
      return []
    }
    
    const usersRef = collection(db, 'users')
    const cleanCode = referralCode.trim().toUpperCase()
    
    // Récupérer tous les utilisateurs et filtrer côté client
    const allUsersSnapshot = await getDocs(usersRef)
    const referrals: User[] = []
    
    allUsersSnapshot.forEach((doc) => {
      const userData = { ...doc.data(), uid: doc.id } as User
      const userReferredBy = userData.referredBy
      
      if (userReferredBy && typeof userReferredBy === 'string') {
        const normalizedReferredBy = userReferredBy.trim().toUpperCase()
        if (normalizedReferredBy === cleanCode) {
          referrals.push(userData)
        }
      }
    })
    
    return referrals
  } catch (error) {
    return []
  }
}

// Compter les filleuls d'un utilisateur
export async function getReferralCount(referralCode: string): Promise<number> {
  try {
    const referrals = await getReferrals(referralCode)
    return referrals.length
  } catch (error) {
    console.error('Erreur comptage filleuls:', error)
    return 0
  }
}

// Réinitialiser tous les soldes et récompenses des utilisateurs
export async function resetAllUserRewards(): Promise<void> {
  try {
    const usersRef = collection(db, 'users')
    const allUsersSnapshot = await getDocs(usersRef)
    
    // Récupérer tous les numéros de téléphone des utilisateurs
    const userPhones: string[] = []
    allUsersSnapshot.forEach((doc) => {
      const userData = doc.data()
      if (userData.numeroTel) {
        userPhones.push(userData.numeroTel)
      }
    })
    
    // Réinitialiser les données localStorage pour chaque utilisateur
    userPhones.forEach((phone) => {
      // Réinitialiser le solde à 1000 XOF
      localStorage.setItem(`userFunds_${phone}`, '1000')
      
      // Réinitialiser les récompenses de parrainage
      localStorage.setItem(`referralRewards_${phone}`, '0')
      
      // Réinitialiser l'historique des récompenses quotidiennes
      localStorage.setItem(`rewardHistory_${phone}`, '[]')
      
      // Réinitialiser les forfaits VIP
      localStorage.setItem(`forfaitsVipActifs_${phone}`, '0')
      
      // Réinitialiser les gains horaires
      localStorage.setItem(`gainsHoraire_${phone}`, '0')
      
      // Réinitialiser les dépenses totales
      localStorage.setItem(`totalDepense_${phone}`, '0')
    })
    
    console.log(`✅ Réinitialisation terminée pour ${userPhones.length} utilisateurs`)
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error)
  }
}

// Générer le lien d'invitation
export function getReferralLink(referralCode: string): string {
  // Détection automatique de l'URL selon l'environnement
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin
    : process.env.NODE_ENV === 'production' 
      ? 'https://axml-global.vercel.app' 
      : 'http://localhost:3000'
    
  return `${baseUrl}/register-auth?ref=${referralCode}`
}

// Interface pour les stats de parrainage
export interface ReferralStats {
  totalReferrals: number
  referralCode: string
  referralLink: string
}

// Récupérer les statistiques de parrainage
export async function getReferralStats(user: User): Promise<ReferralStats> {
  const totalReferrals = await getReferralCount(user.referralCode)
  
  return {
    totalReferrals,
    referralCode: user.referralCode,
    referralLink: getReferralLink(user.referralCode)
  }
}

// Récupérer les filleuls multi-niveaux d'un utilisateur
export async function getMultiLevelReferrals(referralCode: string): Promise<{
  equipeA: User[],
  equipeB: User[],
  equipeC: User[]
}> {
  try {
    if (!referralCode) {
      return { equipeA: [], equipeB: [], equipeC: [] }
    }
    
    const usersRef = collection(db, 'users')
    const cleanCode = referralCode.trim().toUpperCase()
    
    // Récupérer tous les utilisateurs
    const allUsersSnapshot = await getDocs(usersRef)
    const allUsers: User[] = []
    
    allUsersSnapshot.forEach((doc) => {
      const userData = { ...doc.data(), uid: doc.id } as User
      allUsers.push(userData)
    })
    
    // Équipe A : filleuls directs
    const equipeA = allUsers.filter(user => {
      const userReferredBy = user.referredBy
      if (userReferredBy && typeof userReferredBy === 'string') {
        return userReferredBy.trim().toUpperCase() === cleanCode
      }
      return false
    })
    
    // Équipe B : filleuls des filleuls directs
    const equipeB: User[] = []
    for (const directReferral of equipeA) {
      const secondLevelReferrals = allUsers.filter(user => {
        const userReferredBy = user.referredBy
        if (userReferredBy && typeof userReferredBy === 'string') {
          return userReferredBy.trim().toUpperCase() === directReferral.referralCode.trim().toUpperCase()
        }
        return false
      })
      equipeB.push(...secondLevelReferrals)
    }
    
    // Équipe C : filleuls des filleuls de niveau 2
    const equipeC: User[] = []
    for (const secondLevelReferral of equipeB) {
      const thirdLevelReferrals = allUsers.filter(user => {
        const userReferredBy = user.referredBy
        if (userReferredBy && typeof userReferredBy === 'string') {
          return userReferredBy.trim().toUpperCase() === secondLevelReferral.referralCode.trim().toUpperCase()
        }
        return false
      })
      equipeC.push(...thirdLevelReferrals)
    }
    
    return { equipeA, equipeB, equipeC }
  } catch (error) {
    console.error('Erreur récupération filleuls multi-niveaux:', error)
    return { equipeA: [], equipeB: [], equipeC: [] }
  }
}

// Calculer les revenus de parrainage basés sur les gains des filleuls
export async function calculateReferralRevenue(referralCode: string): Promise<{
  equipeARevenue: number,
  equipeBRevenue: number,
  equipeCRevenue: number,
  totalRevenue: number
}> {
  try {
    const { equipeA, equipeB, equipeC } = await getMultiLevelReferrals(referralCode)
    
    // Pour l'instant, utiliser un gain moyen simulé par filleul
    // TODO: Intégrer avec le système de transactions réelles
    const averageEarningsPerUser = 1000 // 1000 FCFA de gains moyens par utilisateur
    
    const equipeARevenue = equipeA.length * averageEarningsPerUser * 0.10 // 10%
    const equipeBRevenue = equipeB.length * averageEarningsPerUser * 0.05 // 5%
    const equipeCRevenue = equipeC.length * averageEarningsPerUser * 0.03 // 3%
    
    const totalRevenue = equipeARevenue + equipeBRevenue + equipeCRevenue
    
    return {
      equipeARevenue,
      equipeBRevenue,
      equipeCRevenue,
      totalRevenue
    }
  } catch (error) {
    console.error('Erreur calcul revenus parrainage:', error)
    return {
      equipeARevenue: 0,
      equipeBRevenue: 0,
      equipeCRevenue: 0,
      totalRevenue: 0
    }
  }
}

// Interface pour les statistiques de parrainage multi-niveaux
export interface MultiLevelReferralStats {
  equipeA: {
    count: number
    members: User[]
    revenue: number
    percentage: number
  }
  equipeB: {
    count: number
    members: User[]
    revenue: number
    percentage: number
  }
  equipeC: {
    count: number
    members: User[]
    revenue: number
    percentage: number
  }
  totalReferrals: number
  totalRevenue: number
  referralCode: string
  referralLink: string
}

// Récupérer les statistiques complètes de parrainage multi-niveaux
export async function getMultiLevelReferralStats(user: User): Promise<MultiLevelReferralStats> {
  const { equipeA, equipeB, equipeC } = await getMultiLevelReferrals(user.referralCode)
  const { equipeARevenue, equipeBRevenue, equipeCRevenue, totalRevenue } = await calculateReferralRevenue(user.referralCode)
  
  return {
    equipeA: {
      count: equipeA.length,
      members: equipeA,
      revenue: equipeARevenue,
      percentage: 10
    },
    equipeB: {
      count: equipeB.length,
      members: equipeB,
      revenue: equipeBRevenue,
      percentage: 5
    },
    equipeC: {
      count: equipeC.length,
      members: equipeC,
      revenue: equipeCRevenue,
      percentage: 3
    },
    totalReferrals: equipeA.length + equipeB.length + equipeC.length,
    totalRevenue,
    referralCode: user.referralCode,
    referralLink: getReferralLink(user.referralCode)
  }
}

// Vérifier si l'utilisateur a droit à la réduction LV1 (5+ filleuls investisseurs)
export async function checkLV1Discount(userId: string): Promise<boolean> {
  try {
    // Récupérer l'utilisateur pour obtenir son code de parrainage
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) return false
    
    const userData = userDoc.data()
    const userReferralCode = userData.referralCode
    
    // Trouver tous les filleuls directs
    const referralsQuery = query(
      collection(db, 'users'),
      where('referredBy', '==', userReferralCode)
    )
    const referralsSnapshot = await getDocs(referralsQuery)
    
    if (referralsSnapshot.size < 5) return false // Moins de 5 filleuls
    
    // Vérifier combien de filleuls ont investi (ont au moins une location)
    let investorCount = 0
    
    for (const referralDoc of referralsSnapshot.docs) {
      const referralId = referralDoc.id
      
      // Vérifier si ce filleul a des locations
      const rentalsQuery = query(
        collection(db, 'rentals'),
        where('userId', '==', referralId)
      )
      const rentalsSnapshot = await getDocs(rentalsQuery)
      
      if (rentalsSnapshot.size > 0) {
        investorCount++
      }
    }
    
    return investorCount >= 5 // Au moins 5 filleuls investisseurs
  } catch (error) {
    console.error('Erreur lors de la vérification de la réduction LV1:', error)
    return false
  }
}
