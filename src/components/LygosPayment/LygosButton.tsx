'use client'
import { useState } from 'react'
import { Loader2, Globe } from 'lucide-react'

interface LygosButtonProps {
  amount: number
  userId: string
  userPhone: string
  userName?: string
  disabled?: boolean
}

export default function LygosButton({ 
  amount, 
  userId, 
  userPhone, 
  userName,
  disabled = false 
}: LygosButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLygosPayment = async () => {
    if (!amount || amount < 100) {
      setError('Montant minimum : 100 FCFA')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🚀 Initiation paiement Lygos:', { 
        amount, 
        userId, 
        userPhone, 
        userName 
      })

      const payload = {
        amount,
        userId,
        userPhone,
        userName,
      }

      console.log('📤 Payload envoyé:', payload)

      const response = await fetch('/api/lygos/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la création du paiement')
      }

      console.log('✅ Redirection vers Lygos:', data.paymentUrl)

      // Rediriger vers la page de paiement Lygos
      window.location.href = data.paymentUrl

    } catch (err: any) {
      console.error('❌ Erreur paiement Lygos:', err)
      setError(err.message || 'Erreur lors du paiement')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleLygosPayment}
        disabled={disabled || loading || !amount}
        className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 rounded-2xl text-white font-bold text-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={24} />
            <span>Redirection vers Lygos...</span>
          </>
        ) : (
          <>
            <Globe size={24} />
            <span>Payer avec Lygos</span>
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
        <p className="text-blue-400 text-xs font-medium mb-2 text-center">
          🌍 Paiement international avec Lygos
        </p>
        <ul className="text-white/70 text-xs space-y-1">
          <li>✅ Orange Money & MTN Money (tous pays)</li>
          <li>✅ Paiement sécurisé et instantané</li>
          <li>✅ Confirmation automatique</li>
        </ul>
      </div>
    </div>
  )
}
