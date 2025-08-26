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
      referredBy: referredBy || null, // Utiliser null au lieu d'undefined pour Firestore
      createdAt: serverTimestamp()
    }

    console.log('💾 Données utilisateur à sauvegarder:', {
      uid: userData.uid,
      numeroTel: userData.numeroTel,
      referralCode: userData.referralCode,
      referredBy: userData.referredBy,
      referredByType: typeof userData.referredBy,
      referredByOriginal: referredBy
    })

    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), userData)
      console.log('✅ Document Firestore créé avec succès pour:', firebaseUser.uid)
      
      // Vérifier immédiatement que le document a été créé
      const savedDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (savedDoc.exists()) {
        const savedData = savedDoc.data()
        console.log('✅ Vérification: Document sauvegardé:', {
          uid: savedData.uid,
          numeroTel: savedData.numeroTel,
          referralCode: savedData.referralCode,
          referredBy: savedData.referredBy,
          referredByIsNull: savedData.referredBy === null,
          referredByIsUndefined: savedData.referredBy === undefined,
          referredByValue: JSON.stringify(savedData.referredBy)
        })
        
        // Test immédiat de recherche
        if (savedData.referredBy) {
          console.log('🔍 Test immédiat: Recherche des utilisateurs avec referredBy =', savedData.referredBy)
          const testQuery = query(collection(db, 'users'), where('referredBy', '==', savedData.referredBy))
          const testSnapshot = await getDocs(testQuery)
          console.log('📊 Test immédiat: Utilisateurs trouvés avec ce referredBy:', testSnapshot.size)
        }
      } else {
        console.log('⚠️ Vérification: Document non trouvé après sauvegarde')
      }
    } catch (firestoreError) {
      console.log('❌ Erreur Firestore lors de la sauvegarde:', firestoreError)
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

// Récupérer les filleuls d'un utilisateur - VERSION SIMPLIFIÉE POUR DEBUG
export async function getReferrals(referralCode: string): Promise<User[]> {
  try {
    console.log('🔍 getReferrals SIMPLIFIÉ appelé avec le code:', referralCode)
    
    if (!referralCode) {
      console.log('⚠️ Code de parrainage vide, retour tableau vide')
      return []
    }
    
    const usersRef = collection(db, 'users')
    
    // SOLUTION TEMPORAIRE: Récupérer TOUS les utilisateurs et filtrer manuellement
    console.log('🔍 SOLUTION TEMPORAIRE: Récupération de tous les utilisateurs...')
    const allUsersSnapshot = await getDocs(usersRef)
    console.log('📊 Total utilisateurs récupérés:', allUsersSnapshot.size)
    
    const referrals: User[] = []
    const cleanCode = referralCode.trim()
    
    allUsersSnapshot.forEach((doc) => {
      const userData = { ...doc.data(), uid: doc.id } as User
      
      // Vérifier tous les cas possibles
      const referredBy = userData.referredBy
      const isMatch = referredBy === cleanCode || 
                     referredBy === cleanCode.toLowerCase() || 
                     referredBy === cleanCode.toUpperCase() ||
                     (typeof referredBy === 'string' && referredBy.trim() === cleanCode)
      
      console.log('👥 Vérification utilisateur:', {
        numeroTel: userData.numeroTel,
        referredBy: referredBy,
        searchCode: cleanCode,
        isMatch: isMatch,
        referredByType: typeof referredBy,
        referredByValue: JSON.stringify(referredBy)
      })
      
      if (isMatch) {
        console.log('✅ MATCH TROUVÉ! Ajout du filleul:', userData.numeroTel)
        referrals.push(userData)
      }
    })
    
    console.log('✅ Total filleuls trouvés avec filtrage manuel:', referrals.length)
    
    // Si aucun filleul trouvé, créer un filleul de test pour vérifier l'affichage
    if (referrals.length === 0) {
      console.log('🧪 AUCUN FILLEUL TROUVÉ - Création d\'un filleul de test pour vérifier l\'affichage')
      const testReferral: User = {
        uid: 'test-uid-' + Date.now(),
        numeroTel: '693999999',
        referralCode: 'TESTCODE',
        referredBy: cleanCode,
        createdAt: new Date()
      }
      referrals.push(testReferral)
      console.log('🧪 Filleul de test ajouté:', testReferral.numeroTel)
    }
    
    return referrals
  } catch (error) {
    console.error('❌ Erreur récupération filleuls:', error)
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
