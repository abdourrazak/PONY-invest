'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  subscribeToAllTransactions, 
  updateTransactionStatus,
  Transaction
} from '@/lib/transactions'
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
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0
  })

  useEffect(() => {
    // S'abonner à toutes les transactions
    const unsubscribe = subscribeToAllTransactions((allTransactions) => {
      setTransactions(allTransactions)
      
      // Calculer les statistiques
      const stats = {
        totalDeposits: allTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0),
        totalWithdrawals: allTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0),
        pendingCount: allTransactions.filter(t => t.status === 'pending').length,
        approvedCount: allTransactions.filter(t => t.status === 'success').length,
        rejectedCount: allTransactions.filter(t => t.status === 'rejected').length
      }
      setStats(stats)
    })

    return () => unsubscribe()
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
      await updateTransactionStatus(transaction.id, 'success')
      setSelectedTransaction(null)
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
      alert('Erreur lors de l\'approbation de la transaction')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/compte" className="text-white/70 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-white">
              🛡️ Administration - Gestion des Transactions
            </h1>
          </div>
          <div className="text-sm text-white/70">
            Admin: {userData?.numeroTel}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-green-400" size={20} />
              <span className="text-xs text-white/60">Dépôts</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.totalDeposits.toLocaleString()}
            </div>
            <div className="text-xs text-white/60">FCFA</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="text-red-400" size={20} />
              <span className="text-xs text-white/60">Retraits</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.totalWithdrawals.toLocaleString()}
            </div>
            <div className="text-xs text-white/60">FCFA</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-yellow-400" size={20} />
              <span className="text-xs text-white/60">En attente</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.pendingCount}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-400" size={20} />
              <span className="text-xs text-white/60">Approuvées</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.approvedCount}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="text-red-400" size={20} />
              <span className="text-xs text-white/60">Rejetées</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.rejectedCount}
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-white text-purple-900' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Toutes ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              En attente ({stats.pendingCount})
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Approuvées ({stats.approvedCount})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'rejected' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Rejetées ({stats.rejectedCount})
            </button>
          </div>
        </div>

        {/* Liste des transactions */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
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
                      {transaction.userPhone || 'N/A'}
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
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-white/50">
                Aucune transaction trouvée
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Détails de la transaction
              </h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Type</div>
                  <div className="font-medium">
                    {selectedTransaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Montant</div>
                  <div className="font-bold text-xl">
                    {selectedTransaction.amount.toLocaleString()} FCFA
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Méthode</div>
                  <div className="font-medium">
                    {selectedTransaction.paymentMethod.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Statut</div>
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
                <h3 className="font-medium text-gray-800 mb-2">Informations utilisateur</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Téléphone:</span>
                    <span className="ml-2 font-medium">{selectedTransaction.userPhone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">ID Utilisateur:</span>
                    <span className="ml-2 font-mono text-xs">{selectedTransaction.userId}</span>
                  </div>
                </div>
              </div>

              {/* Détails spécifiques */}
              {selectedTransaction.type === 'withdrawal' && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-800 mb-2">Détails du retrait</h3>
                  <div className="space-y-2 text-sm">
                    {selectedTransaction.phoneNumber && (
                      <div>
                        <span className="text-gray-600">Numéro de téléphone:</span>
                        <span className="ml-2 font-medium">{selectedTransaction.phoneNumber}</span>
                      </div>
                    )}
                    {selectedTransaction.cryptoAddress && (
                      <div>
                        <span className="text-gray-600">Adresse crypto:</span>
                        <span className="ml-2 font-mono text-xs">{selectedTransaction.cryptoAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTransaction.type === 'deposit' && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-800 mb-2">Détails du dépôt</h3>
                  <div className="space-y-2 text-sm">
                    {selectedTransaction.beneficiaryName && (
                      <div>
                        <span className="text-gray-600">Nom du bénéficiaire:</span>
                        <span className="ml-2 font-medium">{selectedTransaction.beneficiaryName}</span>
                      </div>
                    )}
                    {selectedTransaction.beneficiaryCode && (
                      <div>
                        <span className="text-gray-600">Code bénéficiaire:</span>
                        <span className="ml-2 font-medium">{selectedTransaction.beneficiaryCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preuve de transaction */}
              {selectedTransaction.proofImage && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-800 mb-2">Preuve de transaction</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={selectedTransaction.proofImage} 
                      alt="Preuve de transaction"
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedTransaction.status === 'pending' && (
                <div className="border-t pt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => handleReject(selectedTransaction)}
                    disabled={processing === selectedTransaction.id}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <XCircle size={18} />
                    <span>{processing === selectedTransaction.id ? 'Traitement...' : 'Rejeter'}</span>
                  </button>
                  <button
                    onClick={() => handleApprove(selectedTransaction)}
                    disabled={processing === selectedTransaction.id}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <CheckCircle size={18} />
                    <span>{processing === selectedTransaction.id ? 'Traitement...' : 'Approuver'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
