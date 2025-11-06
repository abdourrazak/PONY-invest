import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, userId } = body

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: 'Order ID et User ID requis' },
        { status: 400 }
      )
    }

    console.log('🔍 Vérification du paiement:', { orderId, userId })

    // Vérifier si la transaction existe déjà dans Firestore
    const transactionRef = doc(db, 'transactions', orderId)
    const transactionDoc = await getDoc(transactionRef)

    if (transactionDoc.exists()) {
      const transactionData = transactionDoc.data()
      
      console.log('✅ Transaction trouvée:', transactionData)

      return NextResponse.json({
        success: true,
        status: transactionData.status,
        transaction: transactionData,
      })
    }

    // Si la transaction n'existe pas encore, elle est en attente
    console.log('⏳ Transaction en attente de confirmation')

    return NextResponse.json({
      success: true,
      status: 'pending',
      message: 'Paiement en cours de traitement',
    })

  } catch (error: any) {
    console.error('❌ Erreur vérification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification', details: error.message },
      { status: 500 }
    )
  }
}
