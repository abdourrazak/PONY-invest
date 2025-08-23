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
  referredBy?: string
  createdAt: any
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
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('referralCode', '==', code))
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    console.error('Erreur vérification code:', error)
    return false
  }
}

// Génère un code unique (vérifie l'unicité en base)
export async function generateUniqueReferralCode(): Promise<string> {
  let code = generateReferralCode()
  let isUnique = false
  
  while (!isUnique) {
    const exists = await isReferralCodeValid(code)
    if (!exists) {
      isUnique = true
    } else {
      code = generateReferralCode()
    }
  }
  
  return code
}

// Inscription avec Firebase Auth + Firestore
export async function registerUser(
  numeroTel: string, 
  password: string, 
  referredBy?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Vérifier si le code de parrainage existe (si fourni)
    if (referredBy && !(await isReferralCodeValid(referredBy))) {
      return { success: false, error: 'Code d\'invitation invalide' }
    }

    // Créer l'utilisateur avec Firebase Auth (utiliser le numéro comme email temporaire)
    const email = `${numeroTel}@axml.local`
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Générer un code d'invitation unique
    const referralCode = await generateUniqueReferralCode()

    // Créer le document utilisateur dans Firestore
    const userData: User = {
      uid: firebaseUser.uid,
      numeroTel,
      referralCode,
      referredBy,
      createdAt: serverTimestamp()
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), userData)

    return { success: true, user: userData }
  } catch (error: any) {
    console.error('Erreur inscription:', error)
    return { success: false, error: error.message }
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

// Compter les filleuls d'un utilisateur
export async function getReferralCount(referralCode: string): Promise<number> {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('referredBy', '==', referralCode))
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    console.error('Erreur comptage filleuls:', error)
    return 0
  }
}

// Récupérer tous les filleuls d'un utilisateur
export async function getReferrals(referralCode: string): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('referredBy', '==', referralCode))
    const querySnapshot = await getDocs(q)
    
    const referrals: User[] = []
    querySnapshot.forEach((doc) => {
      referrals.push(doc.data() as User)
    })
    
    return referrals
  } catch (error) {
    console.error('Erreur récupération filleuls:', error)
    return []
  }
}

// Générer le lien d'invitation
export function getReferralLink(referralCode: string): string {
  if (typeof window === 'undefined') return ''
  
  // Détection automatique de l'URL selon l'environnement
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://axml-global.vercel.app' 
    : window.location.origin
    
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
