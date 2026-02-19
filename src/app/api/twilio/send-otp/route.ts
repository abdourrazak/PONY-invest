import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

// Store global partagé entre send-otp et verify-otp
declare global {
    var otpStore: Map<string, { code: string; expiresAt: number; attempts: number }> | undefined
}
if (!globalThis.otpStore) {
    globalThis.otpStore = new Map()
}

export async function POST(request: NextRequest) {
    try {
        const { phoneNumber } = await request.json()

        if (!phoneNumber) {
            return NextResponse.json(
                { error: 'Numéro de téléphone requis' },
                { status: 400 }
            )
        }

        // Nettoyer le numéro : on s'assure qu'il a l'indicatif pays
        // Ex: "699123456" → "+237699123456"
        const cleanPhone = phoneNumber.replace(/\s+/g, '').trim()
        const fullPhone = cleanPhone.startsWith('+') ? cleanPhone : `+237${cleanPhone}`

        // Vérifier si un code récent existe encore (anti-spam : 1 min entre chaque envoi)
        const existing = globalThis.otpStore!.get(fullPhone)
        if (existing && existing.expiresAt - 4 * 60 * 1000 > Date.now()) {
            return NextResponse.json(
                { error: 'Veuillez attendre 1 minute avant de renvoyer un code' },
                { status: 429 }
            )
        }

        // Générer un code OTP à 6 chiffres
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // Stocker le code (expire dans 5 minutes)
        globalThis.otpStore!.set(fullPhone, {
            code: otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
            attempts: 0,
        })

        // Credentials Twilio
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const from = process.env.TWILIO_WHATSAPP_FROM

        if (!accountSid || !authToken || !from) {
            console.error('❌ Variables Twilio manquantes')
            return NextResponse.json(
                { error: 'Configuration Twilio manquante' },
                { status: 500 }
            )
        }

        const client = twilio(accountSid, authToken)

        // Envoi du message WhatsApp
        const message = await client.messages.create({
            from: from,
            to: `whatsapp:${fullPhone}`,
            body: `🔐 *PONY Invest* — Votre code de vérification est :\n\n*${otp}*\n\nCe code expire dans 5 minutes. Ne le partagez jamais.`,
        })

        console.log('✅ OTP envoyé via WhatsApp:', message.sid, 'vers:', fullPhone)

        return NextResponse.json({
            success: true,
            message: 'Code envoyé par WhatsApp',
            // En développement seulement, afficher le code pour tester facilement
            ...(process.env.NODE_ENV === 'development' && { debugCode: otp }),
        })
    } catch (error: any) {
        console.error('❌ Erreur envoi OTP:', error)

        // Message d'erreur Twilio compréhensible
        let errorMsg = 'Erreur lors de l\'envoi du code'
        if (error.code === 63007) {
            errorMsg = 'Ce numéro WhatsApp n\'a pas rejoint le sandbox Twilio'
        } else if (error.code === 21211) {
            errorMsg = 'Numéro de téléphone invalide'
        } else if (error.message) {
            errorMsg = error.message
        }

        return NextResponse.json(
            { error: errorMsg, twilioCode: error.code },
            { status: 500 }
        )
    }
}
