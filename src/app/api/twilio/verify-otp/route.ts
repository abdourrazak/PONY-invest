import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'

// Initialiser Firebase client
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export async function POST(request: NextRequest) {
    try {
        const { phoneNumber, code } = await request.json()

        if (!phoneNumber || !code) {
            return NextResponse.json(
                { error: 'Numéro de téléphone et code requis' },
                { status: 400 }
            )
        }

        const cleanPhone = phoneNumber.replace(/\s+/g, '').trim()
        const fullPhone = cleanPhone.startsWith('+') ? cleanPhone : `+237${cleanPhone}`
        const docId = fullPhone.replace('+', '')

        // Lire le code depuis Firestore
        const otpRef = doc(db, 'otp_verifications', docId)
        const otpDoc = await getDoc(otpRef)

        if (!otpDoc.exists()) {
            return NextResponse.json(
                { error: 'Aucun code envoyé pour ce numéro. Demandez un nouveau code.' },
                { status: 400 }
            )
        }

        const stored = otpDoc.data()

        // Vérifier expiration
        if (Date.now() > stored.expiresAtMs) {
            await deleteDoc(otpRef)
            return NextResponse.json(
                { error: 'Code expiré. Demandez un nouveau code.' },
                { status: 400 }
            )
        }

        // Vérifier tentatives max
        if (stored.attempts >= 5) {
            await deleteDoc(otpRef)
            return NextResponse.json(
                { error: 'Trop de tentatives. Demandez un nouveau code.' },
                { status: 429 }
            )
        }

        // Incrémenter tentatives
        await updateDoc(otpRef, { attempts: stored.attempts + 1 })

        // Comparer le code
        if (stored.code !== code.toString().trim()) {
            const remaining = 5 - (stored.attempts + 1)
            return NextResponse.json(
                {
                    error: `Code incorrect. ${remaining} tentative(s) restante(s).`,
                    attemptsRemaining: remaining,
                },
                { status: 400 }
            )
        }

        // ✅ Code correct → supprimer de Firestore
        await deleteDoc(otpRef)

        console.log('✅ OTP vérifié avec succès pour:', fullPhone)

        return NextResponse.json({
            success: true,
            message: 'Numéro WhatsApp vérifié avec succès',
            verifiedPhone: fullPhone,
        })

    } catch (error: any) {
        console.error('❌ Erreur vérification OTP:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la vérification' },
            { status: 500 }
        )
    }
}
