import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

// Initialiser Firebase client (côté serveur dans la route API)
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
        const { phoneNumber } = await request.json()

        if (!phoneNumber) {
            return NextResponse.json(
                { error: 'Numéro de téléphone requis' },
                { status: 400 }
            )
        }

        // Normaliser le numéro
        const cleanPhone = phoneNumber.replace(/\s+/g, '').trim()
        const fullPhone = cleanPhone.startsWith('+') ? cleanPhone : `+237${cleanPhone}`
        // Clé Firestore sans le "+" (caractère interdit dans les IDs Firestore)
        const docId = fullPhone.replace('+', '')

        // Vérifier anti-spam : 1 minute minimum entre deux envois
        const otpRef = doc(db, 'otp_verifications', docId)
        const existing = await getDoc(otpRef)

        if (existing.exists()) {
            const data = existing.data()
            const sentAt = data.sentAt?.toMillis ? data.sentAt.toMillis() : data.sentAtMs || 0
            if (Date.now() - sentAt < 60 * 1000) {
                const secondsLeft = Math.ceil((60 * 1000 - (Date.now() - sentAt)) / 1000)
                return NextResponse.json(
                    { error: `Attendez ${secondsLeft}s avant de renvoyer un code` },
                    { status: 429 }
                )
            }
        }

        // Générer OTP 6 chiffres
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAtMs = Date.now() + 5 * 60 * 1000 // expire dans 5 min

        // Sauvegarder dans Firestore
        await setDoc(otpRef, {
            code: otp,
            expiresAtMs,
            sentAtMs: Date.now(),
            attempts: 0,
            phone: fullPhone,
        })

        // Envoyer via Twilio WhatsApp
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const from = process.env.TWILIO_WHATSAPP_FROM

        if (!accountSid || !authToken || !from) {
            return NextResponse.json({ error: 'Configuration Twilio manquante' }, { status: 500 })
        }

        const client = twilio(accountSid, authToken)

        await client.messages.create({
            from,
            to: `whatsapp:${fullPhone}`,
            body: `🔐 *PONY Invest* — Votre code de vérification :\n\n*${otp}*\n\nValable 5 minutes. Ne le partagez jamais.`,
        })

        console.log('✅ OTP envoyé et stocké Firestore pour:', fullPhone)

        return NextResponse.json({ success: true, message: 'Code envoyé par WhatsApp' })

    } catch (error: any) {
        console.error('❌ Erreur envoi OTP:', error)

        let errorMsg = 'Erreur lors de l\'envoi du code'
        if (error.code === 63007) errorMsg = 'Ce numéro n\'a pas rejoint le sandbox Twilio'
        else if (error.code === 21211) errorMsg = 'Numéro de téléphone invalide'
        else if (error.code === 20003) errorMsg = 'Limite daily dépassée. Réessayez demain.'
        else if (error.message) errorMsg = error.message

        return NextResponse.json({ error: errorMsg, twilioCode: error.code }, { status: 500 })
    }
}
