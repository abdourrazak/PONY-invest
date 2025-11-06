'use client'
import { useSearchParams } from 'next/navigation'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function DepotFailedPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-white mb-2">
          Paiement échoué
        </h1>
        
        <p className="text-white/70 mb-6">
          Votre paiement n'a pas pu être traité. Veuillez réessayer.
        </p>

        {orderId && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <p className="text-white/50 text-xs mb-1">Référence</p>
            <p className="text-white font-mono text-sm">{orderId}</p>
          </div>
        )}

        <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 text-sm font-medium mb-2">
            Raisons possibles :
          </p>
          <ul className="text-white/70 text-xs text-left space-y-1">
            <li>• Solde insuffisant</li>
            <li>• Code PIN incorrect</li>
            <li>• Transaction annulée</li>
            <li>• Problème de connexion</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/recharge"
            className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-white font-medium transition-all"
          >
            <RefreshCw size={20} />
            <span>Réessayer</span>
          </Link>
          
          <Link
            href="/portefeuille"
            className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
