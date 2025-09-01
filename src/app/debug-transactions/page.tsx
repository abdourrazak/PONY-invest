'use client'
import { useState, useEffect } from 'react'
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { subscribeToAllTransactions } from '@/lib/transactions'

export default function DebugTransactions() {
  const [manualTransactions, setManualTransactions] = useState<any[]>([])
  const [realtimeTransactions, setRealtimeTransactions] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Test de récupération manuelle
  const fetchManualTransactions = async () => {
    try {
      console.log('🔍 Debug: Récupération manuelle des transactions...')
      const transactionsRef = collection(db, 'transactions')
      const q = query(transactionsRef, orderBy('submittedAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const transactions: any[] = []
      snapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      console.log('📊 Debug: Transactions manuelles récupérées:', transactions)
      setManualTransactions(transactions)
    } catch (err) {
      console.error('❌ Debug: Erreur récupération manuelle:', err)
      setError(err?.toString() || 'Erreur inconnue')
    }
  }

  // Test de l'écoute temps réel
  useEffect(() => {
    console.log('🔧 Debug: Initialisation écoute temps réel...')
    
    const unsubscribe = subscribeToAllTransactions((transactions) => {
      console.log('📡 Debug: Écoute temps réel - transactions reçues:', transactions)
      setRealtimeTransactions(transactions)
      setLoading(false)
    })

    // Récupération manuelle pour comparaison
    fetchManualTransactions()

    return () => {
      console.log('🔧 Debug: Nettoyage écoute temps réel')
      unsubscribe()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔧 Debug Transactions</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transactions Manuelles */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Récupération Manuelle</h2>
            <button 
              onClick={fetchManualTransactions}
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
            >
              Actualiser
            </button>
            <p className="text-sm text-gray-600 mb-4">
              Transactions trouvées: {manualTransactions.length}
            </p>
            <div className="max-h-96 overflow-y-auto">
              {manualTransactions.map((transaction, index) => (
                <div key={transaction.id} className="border-b pb-2 mb-2">
                  <div className="text-sm">
                    <strong>#{index + 1}</strong> - {transaction.type} - {transaction.amount}€
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: {transaction.status} | User: {transaction.userNumeroTel}
                  </div>
                  <div className="text-xs text-gray-400">
                    ID: {transaction.id}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions Temps Réel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📡 Écoute Temps Réel</h2>
            {loading && <p className="text-yellow-600">Chargement...</p>}
            <p className="text-sm text-gray-600 mb-4">
              Transactions reçues: {realtimeTransactions.length}
            </p>
            <div className="max-h-96 overflow-y-auto">
              {realtimeTransactions.map((transaction, index) => (
                <div key={transaction.id} className="border-b pb-2 mb-2">
                  <div className="text-sm">
                    <strong>#{index + 1}</strong> - {transaction.type} - {transaction.amount}€
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: {transaction.status} | User: {transaction.userNumeroTel}
                  </div>
                  <div className="text-xs text-gray-400">
                    ID: {transaction.id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* État de la connexion Firebase */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">🔥 État Firebase</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Database:</strong> {db ? '✅ Connecté' : '❌ Non connecté'}
            </div>
            <div>
              <strong>Collection:</strong> transactions
            </div>
            <div>
              <strong>Récupération manuelle:</strong> {manualTransactions.length > 0 ? '✅' : '❌'}
            </div>
            <div>
              <strong>Écoute temps réel:</strong> {realtimeTransactions.length > 0 ? '✅' : '❌'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
