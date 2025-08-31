import { NextRequest, NextResponse } from 'next/server'
import { doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import * as admin from 'firebase-admin'

// Fonction pour générer un code de parrainage unique
function generateReferralCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `AXML${timestamp}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const phone = '+237697058617'
    const email = '697058617@axml.local'
    const password = '697058617'

    console.log('🚀 Configuration forcée admin pour:', phone)

    // Essayer de se connecter ou créer le compte
    let user
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user = userCredential.user
      console.log('✅ Utilisateur existant trouvé:', user.uid)
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        user = userCredential.user
        console.log('✅ Nouveau compte créé:', user.uid)
      } else if (error.code === 'auth/invalid-login-credentials') {
        // Créer un nouveau compte avec un email légèrement différent
        const altEmail = `697058617.admin@axml.local`
        const userCredential = await createUserWithEmailAndPassword(auth, altEmail, password)
        user = userCredential.user
        console.log('✅ Compte alternatif créé:', user.uid)
      } else {
        throw error
      }
    }

    // Forcer la création/mise à jour du document utilisateur
    const userData = {
      uid: user.uid,
      numeroTel: phone,
      referralCode: generateReferralCode(),
      createdAt: serverTimestamp(),
      role: 'admin',
      balance: 0,
      updatedAt: serverTimestamp()
    }

    // Utiliser set avec merge pour forcer la création
    await setDoc(doc(db, 'users', user.uid), userData, { merge: true })
    console.log('✅ Document utilisateur admin créé/mis à jour')

    // Créer des transactions test
    const transactions = []

    // Transaction dépôt
    const depositId = `deposit_${Date.now()}`
    await setDoc(doc(db, 'transactions', depositId), {
      id: depositId,
      userId: user.uid,
      userPhone: phone,
      type: 'deposit',
      amount: 50000,
      paymentMethod: 'orange',
      status: 'pending',
      beneficiaryName: 'Test Admin Dépôt',
      beneficiaryCode: 'DEP123',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    transactions.push(depositId)

    // Transaction retrait
    const withdrawalId = `withdrawal_${Date.now()}`
    await setDoc(doc(db, 'transactions', withdrawalId), {
      id: withdrawalId,
      userId: user.uid,
      userPhone: phone,
      type: 'withdrawal',
      amount: 10000,
      paymentMethod: 'mtn',
      status: 'pending',
      beneficiaryName: 'Test Admin Retrait',
      beneficiaryCode: 'WITH456',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    transactions.push(withdrawalId)

    // Vérifier le système de parrainage
    const usersRef = collection(db, 'users')
    const allUsers = await getDocs(usersRef)
    const referralStats = {
      totalUsers: allUsers.size,
      usersWithReferralCode: 0,
      usersWithReferrer: 0,
      adminUsers: 0
    }

    allUsers.forEach(doc => {
      const data = doc.data()
      if (data.referralCode) referralStats.usersWithReferralCode++
      if (data.referredBy) referralStats.usersWithReferrer++
      if (data.role === 'admin') referralStats.adminUsers++
    })

    return NextResponse.json({
      success: true,
      message: 'Configuration admin forcée avec succès!',
      user: {
        uid: user.uid,
        phone: phone,
        role: 'admin',
        referralCode: userData.referralCode
      },
      transactions: transactions,
      referralSystem: {
        status: 'operational',
        stats: referralStats
      },
      nextSteps: [
        'Accédez au dashboard admin: /admin-x7k9m2p4',
        'Validez les transactions test',
        'Testez le système de parrainage avec le code: ' + userData.referralCode
      ]
    })

  } catch (error: any) {
    console.error('❌ Erreur configuration forcée:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la configuration forcée', 
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    )
  }
}
