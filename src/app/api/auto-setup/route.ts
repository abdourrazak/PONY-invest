import { NextRequest, NextResponse } from 'next/server'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'

function generateReferralCode(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PONY${timestamp}${random}`.toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const phone = '+237697058617'
    const email = '697058617@axml.local'
    const password = '697058617'

    console.log('🚀 Configuration automatique admin pour:', phone)

    let user
    let isNewUser = false

    try {
      // Essayer de se connecter d'abord
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user = userCredential.user
      console.log('✅ Utilisateur existant connecté:', user.uid)
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Créer un nouveau compte
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        user = userCredential.user
        isNewUser = true
        console.log('✅ Nouveau compte créé:', user.uid)
      } else {
        throw error
      }
    }

    // Vérifier si l'utilisateur existe dans Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (!userDoc.exists() || isNewUser) {
      // Créer le document utilisateur complet
      const userData = {
        uid: user.uid,
        numeroTel: phone,
        referralCode: generateReferralCode(),
        createdAt: serverTimestamp(),
        role: 'admin',
        balance: 0,
        updatedAt: serverTimestamp()
      }
      
      await setDoc(doc(db, 'users', user.uid), userData)
      console.log('✅ Document utilisateur créé avec rôle admin')
    } else {
      // Mettre à jour le rôle admin
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'admin',
        balance: 0,
        updatedAt: serverTimestamp()
      })
      console.log('✅ Rôle admin attribué à l\'utilisateur existant')
    }

    // Créer une transaction test
    const transactionId = `test_deposit_${Date.now()}`
    await setDoc(doc(db, 'transactions', transactionId), {
      id: transactionId,
      userId: user.uid,
      userPhone: phone,
      type: 'deposit',
      amount: 25000,
      paymentMethod: 'orange',
      status: 'pending',
      beneficiaryName: 'Admin Test',
      beneficiaryCode: 'ADMIN123',
      proofImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('✅ Transaction test créée')

    // Créer une transaction de retrait test
    const withdrawalId = `test_withdrawal_${Date.now()}`
    await setDoc(doc(db, 'transactions', withdrawalId), {
      id: withdrawalId,
      userId: user.uid,
      userPhone: phone,
      type: 'withdrawal',
      amount: 5000,
      paymentMethod: 'mtn',
      status: 'pending',
      beneficiaryName: 'Admin Test Retrait',
      beneficiaryCode: 'WITHDRAW123',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('✅ Transaction retrait test créée')

    return NextResponse.json({
      success: true,
      message: 'Configuration admin terminée avec succès!',
      user: {
        uid: user.uid,
        phone: phone,
        role: 'admin'
      },
      transactions: {
        deposit: transactionId,
        withdrawal: withdrawalId
      }
    })

  } catch (error: any) {
    console.error('❌ Erreur configuration auto:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la configuration automatique', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
