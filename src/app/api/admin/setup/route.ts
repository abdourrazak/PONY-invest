import { NextRequest, NextResponse } from 'next/server'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'

function generateReferralCode(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `AXML${timestamp}${random}`.toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const { phone, action } = await request.json()

    if (!phone || !phone.startsWith('+237')) {
      return NextResponse.json(
        { error: 'Numéro de téléphone invalide. Format requis: +237XXXXXXXXXX' },
        { status: 400 }
      )
    }

    const email = `${phone.replace('+', '')}@axml.local`
    const password = phone.slice(-6) + 'AXML2024'

    let user
    let userData

    if (action === 'create') {
      // Créer un nouveau compte
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user = userCredential.user

      // Créer le document utilisateur avec rôle admin
      userData = {
        uid: user.uid,
        numeroTel: phone,
        referralCode: generateReferralCode(),
        createdAt: serverTimestamp(),
        role: 'admin',
        balance: 0
      }

      await setDoc(doc(db, 'users', user.uid), userData)
    } else {
      // Mettre à jour un compte existant
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user = userCredential.user

      // Mettre à jour le rôle
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'admin'
      })

      // Récupérer les données utilisateur
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      userData = userDoc.data()
    }

    // Créer une transaction test
    const transactionId = `test_${Date.now()}`
    await setDoc(doc(db, 'transactions', transactionId), {
      id: transactionId,
      userId: user.uid,
      userPhone: phone,
      type: 'deposit',
      amount: 10000,
      paymentMethod: 'orange',
      status: 'pending',
      beneficiaryName: 'Test Admin',
      beneficiaryCode: 'TEST123',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        phone: phone,
        role: 'admin'
      },
      message: 'Compte admin configuré avec succès!'
    })

  } catch (error: any) {
    console.error('Erreur configuration admin:', error)
    
    let errorMessage = 'Erreur lors de la configuration'
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Ce compte existe déjà. Utilisez "Mettre à jour un compte existant"'
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Mot de passe incorrect'
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'Utilisateur non trouvé. Utilisez "Créer un nouveau compte admin"'
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    )
  }
}
