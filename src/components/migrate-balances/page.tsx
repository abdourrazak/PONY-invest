'use client'
import { useState } from 'react'
import { ArrowLeft, Database, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { migrateUsersForInvestmentRules } from '@/lib/migrationUtils'

export default function MigrateBalancesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const handleMigration = async () => {
    if (!confirm('Êtes-vous sûr de vouloir migrer tous les utilisateurs ? Cette action mettra à jour tous les comptes existants.')) {
      return
    }

    setIsLoading(true)
    setMessage('Migration en cours...')
    setMessageType('')

    try {
      await migrateUsersForInvestmentRules()
      setMessage('✅ Migration terminée avec succès ! Tous les soldes existants ont été convertis en soldes retirables.')
      setMessageType('success')
    } catch (error: any) {
      setMessage(`❌ Erreur lors de la migration: ${error.message}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard-admin" className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-white/10">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center space-x-2">
                <Database className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl font-bold">Migration des Soldes</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Message de statut */}
        {message && (
          <div className={`p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-300'
              : messageType === 'error'
              ? 'bg-red-500/20 border-red-500/30 text-red-300'
              : 'bg-blue-500/20 border-blue-500/30 text-blue-300'
          }`}>
            <div className="flex items-center space-x-2">
              {messageType === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Section Migration */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold">Migration des Soldes Utilisateurs</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-white/80">
              Cette migration va mettre à jour tous les comptes utilisateurs existants pour séparer les soldes en deux catégories :
            </p>
            
            <div className="bg-black/20 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="text-green-400 font-bold mb-2">✅ Solde Retirable (withdrawableBalance)</h3>
                <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
                  <li>Tous les soldes actuels des utilisateurs</li>
                  <li>Bonus d'inscription</li>
                  <li>Commissions de parrainage</li>
                  <li>Gains des investissements</li>
                  <li>Récompenses check-in</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-orange-400 font-bold mb-2">💰 Solde de Dépôt (depositBalance)</h3>
                <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
                  <li>Initialisé à 0 pour tous les comptes existants</li>
                  <li>Futurs dépôts iront dans ce solde</li>
                  <li>Doit être investi avant d'être retirable</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                ⚠️ <strong>Important :</strong> Cette migration est sûre et ne supprime aucune donnée. 
                Tous les soldes existants seront conservés et deviendront retirables immédiatement.
              </p>
            </div>

            <button
              onClick={handleMigration}
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
              }`}
            >
              {isLoading ? 'Migration en cours...' : 'Lancer la Migration'}
            </button>
          </div>
        </div>

        {/* Informations Techniques */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold mb-4">Détails Techniques</h3>
          <div className="space-y-2 text-sm text-white/70">
            <p>• La migration utilise des batch writes pour optimiser les performances</p>
            <p>• Seuls les comptes sans les nouveaux champs seront mis à jour</p>
            <p>• Les logs de migration seront affichés dans la console</p>
            <p>• La migration peut être exécutée plusieurs fois sans danger</p>
          </div>
        </div>
      </div>
    </div>
  )
}
