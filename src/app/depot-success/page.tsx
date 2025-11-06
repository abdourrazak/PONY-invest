'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DepotSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')

  const orderId = searchParams.get('order_id')
  const userId = searchParams.get('user_id')

  useEffect(() => {
    if (!orderId || !userId) {
      setError('Informations de paiement manquantes')
      setVerifying(false)
      return
    }

    // Vérifier le paiement
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/lygos/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, userId }),
        })

        const data = await response.json()

        if (data.success) {
          setVerified(true)
          // Rediriger vers le portefeuille après 3 secondes
          setTimeout(() => {
            router.push('/portefeuille')
          }, 3000)
        } else {
          setError('Erreur lors de la vérification du paiement')
        }
      } catch (err) {
        console.error('Erreur vérification:', err)
        setError('Erreur de connexion')
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [orderId, userId, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center">
        {verifying ? (
          <>
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Vérification en cours...
            </h1>
            <p className="text-white/70">
              Nous vérifions votre paiement, veuillez patienter.
            </p>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Erreur
            </h1>
            <p className="text-white/70 mb-6">{error}</p>
            <Link
              href="/portefeuille"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-white font-medium transition-all"
            >
              <ArrowLeft size={20} />
              <span>Retour au portefeuille</span>
            </Link>
          </>
        ) : verified ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Paiement réussi ! 🎉
            </h1>
            <p className="text-white/70 mb-2">
              Votre dépôt a été effectué avec succès.
            </p>
            <p className="text-white/60 text-sm mb-6">
              Votre solde sera crédité dans quelques instants.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-white/50 text-xs mb-1">Référence</p>
              <p className="text-white font-mono text-sm">{orderId}</p>
            </div>
            <p className="text-white/60 text-sm">
              Redirection automatique vers votre portefeuille...
            </p>
          </>
        ) : null}
      </div>
    </div>
  )
}
