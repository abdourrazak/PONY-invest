'use client'

import { useEffect, useState } from 'react'
import { 
  Transaction, 
  TransactionFilters, 
  TransactionStats,
  TransactionStatus,
  TransactionType,
  PaymentMethod 
} from '@/types/transactions'
import {
  adminListTransactions,
  adminApproveDeposit,
  adminApproveWithdrawal,
  adminRejectTransaction,
  getTransactionStats
} from '@/lib/transactions'
import {
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Eye,
  Check,
  X,
  RefreshCw,
  Download,
  ChevronDown
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Composant Badge de statut
function StatusBadge({ status }: { status: TransactionStatus }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    success: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300'
  }

  const icons = {
    pending: <Clock className="w-3 h-3" />,
    success: <CheckCircle className="w-3 h-3" />,
    rejected: <XCircle className="w-3 h-3" />
  }

  const labels = {
    pending: 'En attente',
    success: 'Approuvé',
    rejected: 'Rejeté'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {icons[status]}
      {labels[status]}
    </span>
  )
}

// Composant Carte de statistique
function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string
  value: string | number
  icon: any
  color: string 
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

// Modal de confirmation
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'success'
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'success' | 'danger'
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal de détails de transaction
function TransactionDetailsModal({
  transaction,
  onClose,
  onApprove,
  onReject
}: {
  transaction: Transaction | null
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}) {
  if (!transaction) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Détails de la transaction</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ID Transaction</p>
              <p className="font-mono text-sm font-semibold">{transaction.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <StatusBadge status={transaction.status} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-semibold capitalize">{transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Montant</p>
              <p className="font-bold text-lg">{transaction.amount.toLocaleString()} FCFA</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Méthode de paiement</p>
              <p className="font-semibold uppercase">{transaction.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Numéro de téléphone</p>
              <p className="font-semibold">{transaction.userNumeroTel}</p>
            </div>
            {transaction.beneficiaryName && (
              <div>
                <p className="text-sm text-gray-500">Bénéficiaire</p>
                <p className="font-semibold">{transaction.beneficiaryName}</p>
              </div>
            )}
            {transaction.phoneNumber && (
              <div>
                <p className="text-sm text-gray-500">Téléphone destinataire</p>
                <p className="font-semibold">{transaction.phoneNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Date de soumission</p>
              <p className="font-semibold">
                {transaction.submittedAt && format(
                  transaction.submittedAt instanceof Date ? transaction.submittedAt : transaction.submittedAt.toDate(),
                  'dd MMM yyyy HH:mm',
                  { locale: fr }
                )}
              </p>
            </div>
            {transaction.updatedAt && (
              <div>
                <p className="text-sm text-gray-500">Dernière mise à jour</p>
                <p className="font-semibold">
                  {format(
                    transaction.updatedAt instanceof Date ? transaction.updatedAt : transaction.updatedAt.toDate(),
                    'dd MMM yyyy HH:mm',
                    { locale: fr }
                  )}
                </p>
              </div>
            )}
          </div>

          {transaction.adminNotes && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Notes admin</p>
              <p className="text-gray-700">{transaction.adminNotes}</p>
            </div>
          )}

          {transaction.status === 'pending' && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onApprove}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Approuver
              </button>
              <button
                onClick={onReject}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Rejeter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats>({
    totalPending: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    volume24h: 0,
    totalTransactions: 0
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: 'approve' | 'reject' | null
    transaction: Transaction | null
  }>({ isOpen: false, type: null, transaction: null })
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'deposits' | 'withdrawals'>('pending')

  // Charger les transactions et les stats
  const loadData = async () => {
    setLoading(true)
    try {
      // Appliquer les filtres selon l'onglet actif
      let currentFilters: TransactionFilters = { ...filters }
      
      if (activeTab === 'pending') {
        currentFilters.status = 'pending'
      } else if (activeTab === 'deposits') {
        currentFilters.type = 'deposit'
      } else if (activeTab === 'withdrawals') {
        currentFilters.type = 'withdrawal'
      }

      if (searchTerm) {
        currentFilters.searchTerm = searchTerm
      }

      const [transactionsData, statsData] = await Promise.all([
        adminListTransactions(currentFilters),
        getTransactionStats()
      ])

      setTransactions(transactionsData)
      setStats(statsData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeTab, searchTerm])

  // Gérer l'approbation
  const handleApprove = async (transaction: Transaction) => {
    try {
      if (transaction.type === 'deposit') {
        await adminApproveDeposit(transaction.id)
      } else {
        await adminApproveWithdrawal(transaction.id)
      }
      
      // Notification de succès
      alert('Transaction approuvée avec succès')
      
      // Recharger les données
      loadData()
      setSelectedTransaction(null)
      setConfirmModal({ isOpen: false, type: null, transaction: null })
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    }
  }

  // Gérer le rejet
  const handleReject = async (transaction: Transaction) => {
    const reason = prompt('Motif du rejet (optionnel):')
    
    try {
      await adminRejectTransaction(transaction.id, reason || undefined)
      
      // Notification de succès
      alert('Transaction rejetée')
      
      // Recharger les données
      loadData()
      setSelectedTransaction(null)
      setConfirmModal({ isOpen: false, type: null, transaction: null })
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header avec titre et actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Transactions</h1>
          <p className="text-gray-500 mt-1">Gérez les dépôts et retraits en attente</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="En attente (Total)"
          value={stats.totalPending}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatsCard
          title="Dépôts en attente"
          value={stats.pendingDeposits}
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <StatsCard
          title="Retraits en attente"
          value={stats.pendingWithdrawals}
          icon={TrendingDown}
          color="bg-purple-500"
        />
        <StatsCard
          title="Volume 24h"
          value={`${stats.volume24h.toLocaleString()} FCFA`}
          icon={DollarSign}
          color="bg-green-500"
        />
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Onglets */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setActiveTab('deposits')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'deposits'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dépôts
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'withdrawals'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Retraits
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par téléphone, ID, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table des transactions */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune transaction trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-mono text-gray-900">{transaction.id.slice(0, 8)}...</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.userNumeroTel}</p>
                        {transaction.beneficiaryName && (
                          <p className="text-xs text-gray-500">{transaction.beneficiaryName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        transaction.type === 'deposit' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <>
                            <TrendingUp className="w-3 h-3" />
                            Dépôt
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3" />
                            Retrait
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-gray-900">
                        {transaction.amount.toLocaleString()} FCFA
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 uppercase">{transaction.paymentMethod}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-500">
                        {transaction.submittedAt && format(
                          transaction.submittedAt instanceof Date ? transaction.submittedAt : transaction.submittedAt.toDate(),
                          'dd/MM/yyyy',
                          { locale: fr }
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setConfirmModal({
                                isOpen: true,
                                type: 'approve',
                                transaction
                              })}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Approuver"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setConfirmModal({
                                isOpen: true,
                                type: 'reject',
                                transaction
                              })}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Rejeter"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onApprove={() => {
            setConfirmModal({
              isOpen: true,
              type: 'approve',
              transaction: selectedTransaction
            })
          }}
          onReject={() => {
            setConfirmModal({
              isOpen: true,
              type: 'reject',
              transaction: selectedTransaction
            })
          }}
        />
      )}

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, transaction: null })}
        onConfirm={() => {
          if (confirmModal.transaction && confirmModal.type === 'approve') {
            handleApprove(confirmModal.transaction)
          } else if (confirmModal.transaction && confirmModal.type === 'reject') {
            handleReject(confirmModal.transaction)
          }
        }}
        title={confirmModal.type === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
        message={
          confirmModal.type === 'approve'
            ? `Voulez-vous approuver cette transaction de ${confirmModal.transaction?.amount.toLocaleString()} FCFA ?`
            : `Voulez-vous rejeter cette transaction de ${confirmModal.transaction?.amount.toLocaleString()} FCFA ?`
        }
        confirmText={confirmModal.type === 'approve' ? 'Approuver' : 'Rejeter'}
        type={confirmModal.type === 'approve' ? 'success' : 'danger'}
      />
    </div>
  )
}
