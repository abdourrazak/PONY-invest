import { NextRequest, NextResponse } from 'next/server'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, userId, userPhone, userName } = body

    // Validation
    if (!amount || !userId || !userPhone) {
      return NextResponse.json(
        { error: 'Montant, userId et numéro de téléphone requis' },
        { status: 400 }
      )
    }

    // Configuration Lygos
    const LYGOS_API_KEY = process.env.NEXT_PUBLIC_LYGOS_API_KEY
    const LYGOS_API_URL = process.env.NEXT_PUBLIC_LYGOS_API_URL || 'https://api.lygosapp.com/v1/gateway'
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL

    if (!LYGOS_API_KEY) {
      return NextResponse.json(
        { error: 'Configuration Lygos manquante' },
        { status: 500 }
      )
    }

    // Générer un ID de commande unique
    const orderId = `PONY-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`

    // Préparer le payload pour Lygos
    const payload = {
      amount: amount,
      shop_name: 'PONY Invest',
      message: `Dépôt de ${amount} FCFA - ${userName || userPhone}`,
      success_url: `${APP_URL}/depot-success?order_id=${orderId}&user_id=${userId}`,
      failure_url: `${APP_URL}/depot-failed?order_id=${orderId}&user_id=${userId}`,
      order_id: orderId,
    }

    console.log('🔄 Création de la session de paiement Lygos:', {
      orderId,
      amount,
      userId,
    })

    // Appel à l'API Lygos
    const response = await fetch(LYGOS_API_URL, {
      method: 'POST',
      headers: {
        'api-key': LYGOS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Erreur API Lygos:', data)
      return NextResponse.json(
        { error: 'Erreur lors de la création du paiement', details: data },
        { status: response.status }
      )
    }

    console.log('✅ Session Lygos créée:', data)

    // Sauvegarder le paiement en attente dans Firestore
    try {
      const pendingPaymentRef = doc(db, 'pendingPayments', orderId)
      await setDoc(pendingPaymentRef, {
        orderId,
        userId,
        amount,
        userPhone,
        userName: userName || 'Utilisateur',
        status: 'pending',
        paymentUrl: data.link,
        createdAt: Timestamp.now(),
      })
      console.log('💾 Paiement en attente sauvegardé')
    } catch (saveError) {
      console.error('⚠️ Erreur sauvegarde paiement:', saveError)
    }

    // Retourner le lien de paiement
    return NextResponse.json({
      success: true,
      paymentUrl: data.link,
      orderId: orderId,
      message: 'Session de paiement créée avec succès',
    })

  } catch (error: any) {
    console.error('❌ Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    )
  }
}
