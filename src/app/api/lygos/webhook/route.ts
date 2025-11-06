import { NextRequest, NextResponse } from 'next/server'
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Webhook Lygos pour recevoir les notifications de paiement
 * URL à configurer dans Lygos: https://votre-domaine.vercel.app/api/lygos/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📥 Webhook Lygos reçu:', body)

    // Extraire les informations du webhook
    const { order_id, status, amount, phone, payment_method, transaction_id } = body

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID manquant' },
        { status: 400 }
      )
    }

    // Extraire le userId depuis l'order_id (format: PONY-timestamp-uuid)
    // Note: On devrait stocker le userId dans une collection temporaire lors de l'initiation
    // Pour l'instant, on va chercher dans les transactions existantes
    
    const transactionRef = doc(db, 'transactions', order_id)
    const transactionDoc = await getDoc(transactionRef)

    let userId = null
    let transactionData: any = {}

    if (transactionDoc.exists()) {
      // Transaction existe déjà, on la met à jour
      transactionData = transactionDoc.data()
      userId = transactionData.userId
      
      await updateDoc(transactionRef, {
        status: status === 'successful' ? 'approved' : status === 'failed' ? 'rejected' : 'pending',
        lygosStatus: status,
        lygosTransactionId: transaction_id,
        paymentMethod: payment_method || 'lygos_mobile_money',
        phone: phone,
        updatedAt: Timestamp.now(),
      })

      console.log('✅ Transaction mise à jour:', order_id)
    } else {
      // Nouvelle transaction depuis le webhook
      // On va essayer de récupérer le userId depuis une collection temporaire
      const pendingPaymentRef = doc(db, 'pendingPayments', order_id)
      const pendingPaymentDoc = await getDoc(pendingPaymentRef)

      if (pendingPaymentDoc.exists()) {
        const pendingData = pendingPaymentDoc.data()
        userId = pendingData.userId

        // Créer la transaction
        transactionData = {
          id: order_id,
          userId: userId,
          type: 'deposit',
          amount: amount,
          status: status === 'successful' ? 'approved' : status === 'failed' ? 'rejected' : 'pending',
          lygosStatus: status,
          lygosTransactionId: transaction_id,
          paymentMethod: payment_method || 'lygos_mobile_money',
          phone: phone,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }

        await setDoc(transactionRef, transactionData)
        console.log('✅ Transaction créée depuis webhook:', order_id)
      } else {
        console.warn('⚠️ Impossible de trouver le userId pour:', order_id)
        return NextResponse.json({
          success: false,
          message: 'User ID introuvable',
        })
      }
    }

    // Si le paiement est réussi, créditer le solde de l'utilisateur
    if (status === 'successful' && userId) {
      try {
        const userRef = doc(db, 'users', userId)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          const currentBalance = userData.balance || 0
          const currentDepositBalance = userData.depositBalance || 0
          const currentTotalDeposited = userData.totalDeposited || 0

          await updateDoc(userRef, {
            balance: currentBalance + amount,
            depositBalance: currentDepositBalance + amount,
            totalDeposited: currentTotalDeposited + amount,
            lastDepositDate: Timestamp.now(),
          })

          console.log('💰 Solde utilisateur crédité:', {
            userId,
            amount,
            newBalance: currentBalance + amount,
          })
        }
      } catch (error) {
        console.error('❌ Erreur mise à jour solde:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook traité avec succès',
    })

  } catch (error: any) {
    console.error('❌ Erreur webhook:', error)
    return NextResponse.json(
      { error: 'Erreur traitement webhook', details: error.message },
      { status: 500 }
    )
  }
}

// Permettre GET pour tester le webhook
export async function GET() {
  return NextResponse.json({
    message: 'Webhook Lygos actif',
    endpoint: '/api/lygos/webhook',
  })
}
