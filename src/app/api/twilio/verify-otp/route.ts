import { NextRequest, NextResponse } from 'next/server'

// Import du même store (note: en production utiliser Redis pour partager entre instances)
// Pour l'instant on utilise un module partagé
declare global {
    var otpStore: Map<string, { code: string; expiresAt: number; attempts: number }> | undefined
}

// Accès au store global partagé avec send-otp
// On utilise globalThis pour persister entre les requêtes en développement
if (!globalThis.otpStore) {
    globalThis.otpStore = new Map()
}

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

        const stored = globalThis.otpStore!.get(fullPhone)

        // Vérifier si un code existe pour ce numéro
        if (!stored) {
            return NextResponse.json(
                { error: 'Aucun code envoyé pour ce numéro. Demandez un nouveau code.' },
                { status: 400 }
            )
        }

        // Vérifier si le code a expiré
        if (Date.now() > stored.expiresAt) {
            globalThis.otpStore!.delete(fullPhone)
            return NextResponse.json(
                { error: 'Code expiré. Demandez un nouveau code.' },
                { status: 400 }
            )
        }

        // Vérifier le nombre de tentatives (max 5)
        if (stored.attempts >= 5) {
            globalThis.otpStore!.delete(fullPhone)
            return NextResponse.json(
                { error: 'Trop de tentatives. Demandez un nouveau code.' },
                { status: 429 }
            )
        }

        // Incrémenter les tentatives
        stored.attempts++
        globalThis.otpStore!.set(fullPhone, stored)

        // Vérifier le code
        if (stored.code !== code.toString().trim()) {
            const remaining = 5 - stored.attempts
            return NextResponse.json(
                {
                    error: `Code incorrect. ${remaining} tentative(s) restante(s).`,
                    attemptsRemaining: remaining
                },
                { status: 400 }
            )
        }

        // ✅ Code correct : supprimer du store et confirmer
        globalThis.otpStore!.delete(fullPhone)

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
