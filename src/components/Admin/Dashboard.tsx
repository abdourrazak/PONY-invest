'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  subscribeToAllTransactions, 
  updateTransactionStatus,
  adminApproveDeposit,
  adminApproveWithdrawal,
  Transaction
} from '@/lib/transactions'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  X
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { userData } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'success' | 'rejected'>('pending')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('🔄 Initialisation...')
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0
  })

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR')
    setDebugInfo(prev => [...prev.slice(-9), `${timestamp}: ${message}`])
  }

  useEffect(() => {
    addDebugLog('🔧 Initialisation directe de la récupération')
    setConnectionStatus('🔄 Connexion à Firestore...')
    
    // Récupération directe similaire à la page de debug qui fonctionne
    const fetchTransactions = async () => {
      try {
        addDebugLog('🔍 Récupération directe des transactions...')
        const transactionsRef = collection(db, 'transactions')
        const snapshot = await getDocs(transactionsRef)
        
        const allTransactions: any[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          allTransactions.push({
            id: doc.id,
            ...data
          })
        })
        
        addDebugLog(`📊 Transactions récupérées: ${allTransactions.length}`)
        setConnectionStatus('✅ Connecté - Données récupérées')
        setTransactions(allTransactions)
        
        // Calculer les statistiques
        const stats = {
          totalDeposits: allTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0),
          totalWithdrawals: allTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0),
          pendingCount: allTransactions.filter(t => t.status === 'pending').length,
          approvedCount: allTransactions.filter(t => t.status === 'success').length,
          rejectedCount: allTransactions.filter(t => t.status === 'rejected').length
        }
        addDebugLog(`📈 Stats: ${stats.pendingCount} en attente, ${stats.approvedCount} approuvées`)
        setStats(stats)
        
        // Configurer un polling toutes les 10 secondes pour les mises à jour
        setInterval(fetchTransactions, 10000)
        
      } catch (error) {
        addDebugLog(`❌ Erreur: ${error}`)
        setConnectionStatus('❌ Erreur de connexion')
      }
    }

    fetchTransactions()

    // Pas de cleanup nécessaire pour cette approche simple
    return () => {
      addDebugLog('🔧 Nettoyage')
    }
  }, [])

  useEffect(() => {
    // Filtrer les transactions
    if (filter === 'all') {
      setFilteredTransactions(transactions)
    } else {
      setFilteredTransactions(transactions.filter(t => 
        filter === 'success' ? t.status === 'success' : t.status === filter
      ))
    }
  }, [transactions, filter])

  const handleApprove = async (transaction: Transaction) => {
    if (processing) return
    
    setProcessing(transaction.id)
    try {
      // Utiliser la fonction spécialisée qui met à jour le solde automatiquement
      if (transaction.type === 'deposit') {
        await adminApproveDeposit(transaction.id)
        addDebugLog(`✅ Dépôt approuvé: ${transaction.amount} FCFA ajouté au solde`)
      } else if (transaction.type === 'withdrawal') {
        await adminApproveWithdrawal(transaction.id)
        addDebugLog(`✅ Retrait approuvé: ${transaction.amount} FCFA déduit du solde`)
      }
      setSelectedTransaction(null)
      
      // Rafraîchir les données
      window.location.reload()
    } catch (error: any) {
      console.error('Erreur lors de l\'approbation:', error)
      const errorMessage = error?.message || 'Erreur inconnue'
      alert(`Erreur lors de l'approbation: ${errorMessage}`)
      addDebugLog(`❌ Erreur approbation: ${errorMessage}`)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (transaction: Transaction) => {
    if (processing) return
    
    setProcessing(transaction.id)
    try {
      await updateTransactionStatus(transaction.id, 'rejected')
      setSelectedTransaction(null)
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
      alert('Erreur lors du rejet de la transaction')
    } finally {
      setProcessing(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />
      case 'success': return <CheckCircle size={14} />
      case 'rejected': return <XCircle size={14} />
      default: return null
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (processing) return
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      return
    }
    
    setProcessing(transactionId)
    try {
      const transactionRef = doc(db, 'transactions', transactionId)
      await deleteDoc(transactionRef)
      
      // Supprimer de l'état local
      setTransactions(prev => prev.filter(t => t.id !== transactionId))
      
      alert('Transaction supprimée avec succès')
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      const errorMessage = error?.message || 'Erreur inconnue'
      alert(`Erreur lors de la suppression: ${errorMessage}`)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Header - Optimisé mobile */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2 sm:mb-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/compte" className="text-white/70 hover:text-white">
                <ArrowLeft size={18} />
              </Link>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                🛡️ Admin
              </h1>
            </div>
            <div className="text-xs sm:text-sm text-white/70">
              {userData?.numeroTel}
            </div>
          </div>
          <div className="sm:hidden">
            <h2 className="text-sm text-white/80">Gestion des Transactions</h2>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Statistiques - Optimisées pour mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <TrendingUp className="text-green-400" size={16} />
              <span className="text-xs text-white/60">Dépôts</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-white">
              {(stats.totalDeposits / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-white/60">FCFA</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <TrendingDown className="text-red-400" size={16} />
              <span className="text-xs text-white/60">Retraits</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-white">
              {(stats.totalWithdrawals / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-white/60">FCFA</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <Clock className="text-yellow-400" size={16} />
              <span className="text-xs text-white/60">En attente</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-white">
              {stats.pendingCount}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <CheckCircle className="text-green-400" size={16} />
              <span className="text-xs text-white/60">Approuvées</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-white">
              {stats.approvedCount}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <XCircle className="text-red-400" size={16} />
              <span className="text-xs text-white/60">Rejetées</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-white">
              {stats.rejectedCount}
            </div>
          </div>
        </div>


        {/* Filtres - Optimisés pour mobile */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 mb-4 sm:mb-6">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-white text-purple-900' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Toutes ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              En attente ({stats.pendingCount})
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                filter === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Approuvées ({stats.approvedCount})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                filter === 'rejected' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Rejetées ({stats.rejectedCount})
            </button>
          </div>
        </div>

        {/* Liste des transactions - Version mobile optimisée */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 overflow-hidden">
          {/* Version desktop (tableau) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Méthode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-white/90">
                      {transaction.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'deposit' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.type === 'deposit' ? '↓ Dépôt' : '↑ Retrait'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/90">
                      {transaction.userNumeroTel || transaction.userPhone || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {transaction.amount.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-sm text-white/90">
                      {transaction.paymentMethod.toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'pending' 
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : transaction.status === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {getStatusIcon(transaction.status)}
                        <span>
                          {transaction.status === 'pending' ? 'En attente' 
                            : transaction.status === 'success' ? 'Approuvée' 
                            : 'Rejetée'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        {(transaction.status === 'success' || transaction.status === 'rejected') && (
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Supprimer"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Version mobile (cartes) */}
          <div className="lg:hidden space-y-3 p-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'deposit' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.type === 'deposit' ? '↓ Dépôt' : '↑ Retrait'}
                    </span>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'pending' 
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : transaction.status === 'success'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {getStatusIcon(transaction.status)}
                      <span>
                        {transaction.status === 'pending' ? 'En attente' 
                          : transaction.status === 'success' ? 'Approuvée' 
                          : 'Rejetée'}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                    >
                      <Eye size={18} />
                    </button>
                    {(transaction.status === 'success' || transaction.status === 'rejected') && (
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                        title="Supprimer"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-white/60 text-xs mb-1">Utilisateur</div>
                    <div className="text-white font-medium">{transaction.userNumeroTel || transaction.userPhone || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-xs mb-1">Montant</div>
                    <div className="text-white font-bold">{transaction.amount.toLocaleString()} FCFA</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-xs mb-1">Méthode</div>
                    <div className="text-white">{transaction.paymentMethod.toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-xs mb-1">Date</div>
                    <div className="text-white">{transaction.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'N/A'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
            
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-white/50">
              Aucune transaction trouvée
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails - Optimisé mobile */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Détails transaction
              </h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Informations principales - Mobile optimisé */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Type</div>
                  <div className="font-medium text-lg">
                    {selectedTransaction.type === 'deposit' ? '↓ Dépôt' : '↑ Retrait'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Montant</div>
                  <div className="font-bold text-xl text-green-600">
                    {selectedTransaction.amount.toLocaleString()} FCFA
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Méthode</div>
                  <div className="font-medium">
                    {selectedTransaction.paymentMethod.toUpperCase()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Statut</div>
                  <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusIcon(selectedTransaction.status)}
                    <span>
                      {selectedTransaction.status === 'pending' ? 'En attente' 
                        : selectedTransaction.status === 'success' ? 'Approuvée' 
                        : 'Rejetée'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informations utilisateur */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">👤 Informations utilisateur</h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <span className="text-gray-600 block text-xs mb-1">Téléphone:</span>
                    <span className="font-medium text-lg">{selectedTransaction.userNumeroTel || selectedTransaction.userPhone}</span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <span className="text-gray-600 block text-xs mb-1">ID Utilisateur:</span>
                    <span className="font-mono text-sm break-all">{selectedTransaction.userId}</span>
                  </div>
                </div>
              </div>

              {/* Détails spécifiques */}
              {selectedTransaction.type === 'withdrawal' && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-800 mb-3">💸 Détails du retrait</h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-red-50 rounded-lg p-3">
                      <span className="text-gray-600 block text-xs mb-1">Date de transaction:</span>
                      <span className="font-medium">{selectedTransaction.createdAt?.toDate?.()?.toLocaleString('fr-FR') || 'N/A'}</span>
                    </div>
                    {selectedTransaction.phoneNumber && (
                      <div className="bg-red-50 rounded-lg p-3">
                        <span className="text-gray-600 block text-xs mb-1">Numéro de téléphone:</span>
                        <span className="font-medium">{selectedTransaction.phoneNumber}</span>
                      </div>
                    )}
                    {selectedTransaction.withdrawalAccount && (
                      <div className="bg-red-50 rounded-lg p-3">
                        <span className="text-gray-600 block text-xs mb-1">Informations de retrait configurées:</span>
                        <div className="mt-2 space-y-1">
                          <div><strong>Opérateur:</strong> {
                            selectedTransaction.withdrawalAccount.operator === 'bank' ? 'Compte bancaire' : 
                            selectedTransaction.withdrawalAccount.operator === 'orange' ? 'Orange Money' :
                            selectedTransaction.withdrawalAccount.operator === 'mtn' ? 'MTN Mobile Money' :
                            selectedTransaction.withdrawalAccount.operator === 'moov' ? 'Moov Money' :
                            selectedTransaction.withdrawalAccount.operator === 'wave' ? 'Wave' : 
                            selectedTransaction.withdrawalAccount.operator
                          }</div>
                          <div><strong>Numéro de compte:</strong> {selectedTransaction.withdrawalAccount.accountNumber}</div>
                          <div><strong>Nom du titulaire:</strong> {selectedTransaction.withdrawalAccount.holderName}</div>
                        </div>
                      </div>
                    )}
                    {selectedTransaction.cryptoAddress && (
                      <div className="bg-red-50 rounded-lg p-3">
                        <span className="text-gray-600 block text-xs mb-1">Adresse crypto:</span>
                        <span className="font-mono text-sm break-all">{selectedTransaction.cryptoAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTransaction.type === 'deposit' && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-800 mb-3">💰 Détails du dépôt</h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-green-50 rounded-lg p-3">
                      <span className="text-gray-600 block text-xs mb-1">Date de transaction:</span>
                      <span className="font-medium">{selectedTransaction.createdAt?.toDate?.()?.toLocaleString('fr-FR') || 'N/A'}</span>
                    </div>
                    {selectedTransaction.beneficiaryName && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <span className="text-gray-600 block text-xs mb-1">Nom du bénéficiaire:</span>
                        <span className="font-medium">{selectedTransaction.beneficiaryName}</span>
                      </div>
                    )}
                    {selectedTransaction.beneficiaryCode && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <span className="text-gray-600 block text-xs mb-1">Code bénéficiaire:</span>
                        <span className="font-medium">{selectedTransaction.beneficiaryCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preuve de transaction */}
              {selectedTransaction.proofImage && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-800 mb-3">📸 Preuve de transaction</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={selectedTransaction.proofImage} 
                      alt="Preuve de transaction"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {/* Actions - Mobile optimisé */}
              {selectedTransaction.status === 'pending' && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleReject(selectedTransaction)}
                      disabled={processing === selectedTransaction.id}
                      className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <XCircle size={18} />
                      <span>{processing === selectedTransaction.id ? 'Traitement...' : 'Rejeter'}</span>
                    </button>
                    <button
                      onClick={() => handleApprove(selectedTransaction)}
                      disabled={processing === selectedTransaction.id}
                      className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <CheckCircle size={18} />
                      <span>{processing === selectedTransaction.id ? 'Traitement...' : 'Approuver'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
