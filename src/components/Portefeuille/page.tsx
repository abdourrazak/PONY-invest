'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Eye, Trash2, X, AlertTriangle, Clock, CheckCircle, XCircle, Bell } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { subscribeUserTransactions, subscribeToUserBalance, Transaction } from '@/lib/transactions'
import { TransactionStatus, PaymentMethod } from '@/types/transactions'
import { db } from '@/lib/firebase'
import { doc, deleteDoc } from 'firebase/firestore'

// Types locaux pour compatibilité avec l'ancien code
interface LocalTransaction {
  id: string
  amount: number
  paymentMethod: PaymentMethod
  transactionImage?: string
  proofImage?: string
  status: TransactionStatus
  submittedAt: string
  beneficiaryCode?: string
  beneficiaryName?: string
  phoneNumber?: string
  cryptoAddress?: string
  type?: 'deposit' | 'withdrawal'
}

export default function Portefeuille() {
  const { currentUser, userData } = useAuth()
  const [deposits, setDeposits] = useState<LocalTransaction[]>([])
  const [withdrawals, setWithdrawals] = useState<LocalTransaction[]>([])
  const [firestoreTransactions, setFirestoreTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState(0)
  const [selectedDeposit, setSelectedDeposit] = useState<LocalTransaction | null>(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<LocalTransaction | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals'>('deposits')

  useEffect(() => {
    if (!currentUser) return

    // S'abonner aux transactions Firestore
    const unsubscribeTransactions = subscribeUserTransactions(currentUser.uid, (transactions) => {
      console.log('🔄 Portefeuille: Nouvelles transactions reçues:', transactions.length)
      
      // Séparer les dépôts et retraits depuis Firestore
      const firestoreDeposits = transactions
        .filter(t => t.type === 'deposit')
        .map(t => {
          // Gérer les différents formats de date
          let submittedAt = new Date().toISOString()
          if (t.submittedAt) {
            if (typeof t.submittedAt === 'object' && 'toDate' in t.submittedAt) {
              submittedAt = (t.submittedAt as any).toDate().toISOString()
            } else if (t.submittedAt instanceof Date) {
              submittedAt = t.submittedAt.toISOString()
            }
          } else if (t.createdAt) {
            if (typeof t.createdAt === 'object' && 'toDate' in t.createdAt) {
              submittedAt = (t.createdAt as any).toDate().toISOString()
            } else if (t.createdAt instanceof Date) {
              submittedAt = t.createdAt.toISOString()
            }
          }

          console.log(`📥 Dépôt ${t.id}: statut=${t.status}, montant=${t.amount}`)
          
          return {
            id: t.id,
            amount: t.amount,
            paymentMethod: t.paymentMethod,
            transactionImage: t.proofImage || '',
            proofImage: t.proofImage,
            status: t.status,
            submittedAt,
            beneficiaryCode: t.beneficiaryName || '',
            beneficiaryName: t.beneficiaryName || '',
            type: 'deposit' as const
          }
        })

      const firestoreWithdrawals = transactions
        .filter(t => t.type === 'withdrawal')
        .map(t => {
          // Gérer les différents formats de date
          let submittedAt = new Date().toISOString()
          if (t.submittedAt) {
            if (typeof t.submittedAt === 'object' && 'toDate' in t.submittedAt) {
              submittedAt = (t.submittedAt as any).toDate().toISOString()
            } else if (t.submittedAt instanceof Date) {
              submittedAt = t.submittedAt.toISOString()
            }
          } else if (t.createdAt) {
            if (typeof t.createdAt === 'object' && 'toDate' in t.createdAt) {
              submittedAt = (t.createdAt as any).toDate().toISOString()
            } else if (t.createdAt instanceof Date) {
              submittedAt = t.createdAt.toISOString()
            }
          }

          console.log(`💸 Retrait ${t.id}: statut=${t.status}, montant=${t.amount}`)
          
          return {
            id: t.id,
            amount: t.amount,
            paymentMethod: t.paymentMethod,
            phoneNumber: t.phoneNumber || '',
            cryptoAddress: t.cryptoAddress || '',
            status: t.status,
            submittedAt,
            type: 'withdrawal' as const
          }
        })

      console.log(`✅ Portefeuille: ${firestoreDeposits.length} dépôts, ${firestoreWithdrawals.length} retraits`)
      console.log('📊 Statuts dépôts:', firestoreDeposits.map(d => `${d.id.slice(-4)}:${d.status}`))
      console.log('📊 Statuts retraits:', firestoreWithdrawals.map(w => `${w.id.slice(-4)}:${w.status}`))

      // Utiliser directement les données Firestore pour la synchronisation temps réel
      setDeposits(firestoreDeposits)
      setWithdrawals(firestoreWithdrawals)
      setFirestoreTransactions(transactions)
    })

    // S'abonner au solde
    const unsubscribeBalance = subscribeToUserBalance(currentUser.uid, (newBalance) => {
      setBalance(newBalance)
    })

    return () => {
      unsubscribeTransactions()
      unsubscribeBalance()
    }
  }, [currentUser, userData])

  const deleteDeposit = async (depositId: string) => {
    try {
      // Supprimer uniquement de Firestore - pas de localStorage
      const transactionToDelete = firestoreTransactions.find(t => t.id === depositId)
      if (transactionToDelete) {
        const transactionRef = doc(db, 'transactions', depositId)
        await deleteDoc(transactionRef)
        console.log('Transaction supprimée de Firestore:', depositId)
      }
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la transaction')
    }
  }

  const deleteWithdrawal = async (withdrawalId: string) => {
    try {
      // Supprimer uniquement de Firestore - pas de localStorage
      const transactionToDelete = firestoreTransactions.find(t => t.id === withdrawalId)
      if (transactionToDelete) {
        const transactionRef = doc(db, 'transactions', withdrawalId)
        await deleteDoc(transactionRef)
        console.log('Transaction supprimée de Firestore:', withdrawalId)
      }
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la transaction')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300'
      case 'approved': return 'bg-green-500/20 border-green-400/30 text-green-300'
      case 'success': return 'bg-green-500/20 border-green-400/30 text-green-300'
      case 'rejected': return 'bg-red-500/20 border-red-400/30 text-red-300'
      default: return 'bg-white/20 border-white/30 text-white/70'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-400" />
      case 'approved': return <CheckCircle size={16} className="text-green-400" />
      case 'success': return <CheckCircle size={16} className="text-green-400" />
      case 'rejected': return <XCircle size={16} className="text-red-400" />
      default: return <Clock size={16} className="text-white/60" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'approved': return 'Approuvé'
      case 'success': return 'Réussi'
      case 'rejected': return 'Rejeté'
      default: return 'Inconnu'
    }
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'orange': return 'Orange Money'
      case 'mtn': return 'MTN Mobile Money'
      case 'crypto': return 'Cryptomonnaie (USDT)'
      default: return method
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'orange': return 'from-orange-500 to-red-500'
      case 'mtn': return 'from-yellow-500 to-orange-500'
      case 'crypto': return 'from-blue-500 to-purple-500'
      default: return 'from-purple-500 to-pink-500'
    }
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
    {/* Header */}
    <header className="bg-black/20 backdrop-blur-md px-4 py-5 border-b border-white/10">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <Link href="/" className="hover:scale-110 transition-transform duration-200">
          <ArrowLeft className="text-white" size={20} />
        </Link>
        <div className="flex items-center">
          <div className="w-8 h-8 mr-3">
            <Image
              src="/asml_logo_.png"
              alt="Global Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain animate-spin"
              style={{ animationDuration: '3s' }}
            />
          </div>
          <h1 className="text-lg font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            Mon Portefeuille
          </h1>
        </div>
        <div className="w-5"></div>
      </div>

      {/* Balance Display */}
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
          <div className="text-white/70 text-sm mb-1">Solde disponible</div>
          <div className="text-white text-2xl font-bold">{balance.toLocaleString()} FCFA</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1 flex">
          <button
            onClick={() => setActiveTab('deposits')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'deposits'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            📥 Dépôts ({deposits.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'withdrawals'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            💸 Retraits ({withdrawals.length})
          </button>
        </div>
      </div>
    </header>

    {/* Content Lists */}
    <main className="max-w-md mx-auto px-4 py-6 pb-24 space-y-4">
      {activeTab === 'deposits' ? (
        deposits.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
            <div className="text-white/40 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Aucun dépôt</h3>
            <p className="text-white/70 text-sm mb-4">Vous n'avez encore effectué aucun dépôt.</p>
            <Link href="/recharge">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
                Effectuer un dépôt
              </button>
            </Link>
          </div>
        ) : (
          deposits.map((deposit, index) => (
            <div key={deposit.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPaymentMethodColor(deposit.paymentMethod)} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">
                      {deposit.paymentMethod === 'orange' ? 'O' : 
                       deposit.paymentMethod === 'mtn' ? 'M' : '₿'}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{deposit.amount.toLocaleString()} FCFA</div>
                    <div className="text-sm text-white/70 font-medium">{getPaymentMethodName(deposit.paymentMethod)}</div>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 backdrop-blur-sm border ${getStatusColor(deposit.status)}`}>
                  {getStatusIcon(deposit.status)}
                  <span>{getStatusText(deposit.status)}</span>
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 space-y-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-white/70 text-xs font-medium mb-0.5">Date de soumission</div>
                    <div className="text-white font-medium">{new Date(deposit.submittedAt).toLocaleDateString('fr-FR')}</div>
                    <div className="text-white/60 text-xs">{new Date(deposit.submittedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div>
                    <div className="text-white/70 text-xs font-medium mb-0.5">ID de transaction</div>
                    <div className="font-mono text-white font-bold text-xs">#{deposit.id.slice(-8).toUpperCase()}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <div className="text-white/70 text-xs font-medium">Bénéficiaire</div>
                    <div className="text-white font-medium truncate max-w-28 text-sm">{deposit.beneficiaryName}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedDeposit(deposit)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
                    >
                      <Eye size={12} />
                      <span>Détails</span>
                    </button>
                    {(deposit.status === 'success' || deposit.status === 'approved' || deposit.status === 'rejected') && (
                      <button 
                        onClick={() => setShowDeleteConfirm(deposit.id)}
                        className="w-8 h-8 bg-white/20 hover:bg-red-500/30 border border-white/20 hover:border-red-400/30 rounded-xl flex items-center justify-center transition-all duration-200 group backdrop-blur-sm"
                        title="Supprimer cette transaction"
                      >
                        <Trash2 size={12} className="text-white/70 group-hover:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )
      ) : (
        withdrawals.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
            <div className="text-white/40 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Aucun retrait</h3>
            <p className="text-white/70 text-sm mb-4">Vous n'avez encore effectué aucune demande de retrait.</p>
            <Link href="/retrait">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
                Demander un retrait
              </button>
            </Link>
          </div>
        ) : (
          withdrawals.map((withdrawal) => (
            <div key={withdrawal.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPaymentMethodColor(withdrawal.paymentMethod)} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">
                      {withdrawal.paymentMethod === 'orange' ? 'O' : withdrawal.paymentMethod === 'mtn' ? 'M' : '₿'}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{(typeof withdrawal.amount === 'string' ? parseInt(withdrawal.amount) : withdrawal.amount).toLocaleString()} {withdrawal.paymentMethod === 'crypto' ? 'USDT' : 'FCFA'}</div>
                    <div className="text-sm text-white/70 font-medium">{getPaymentMethodName(withdrawal.paymentMethod)}</div>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 backdrop-blur-sm border ${getStatusColor(withdrawal.status)}`}>
                  {getStatusIcon(withdrawal.status)}
                  <span>{getStatusText(withdrawal.status)}</span>
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 space-y-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-white/70 text-xs font-medium mb-0.5">Date de soumission</div>
                    <div className="text-white font-medium">{new Date(withdrawal.submittedAt).toLocaleDateString('fr-FR')}</div>
                    <div className="text-white/60 text-xs">{new Date(withdrawal.submittedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div>
                    <div className="text-white/70 text-xs font-medium mb-0.5">ID de transaction</div>
                    <div className="font-mono text-white font-bold text-xs">#{withdrawal.id.slice(-8).toUpperCase()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <div className="text-white/70 text-xs font-medium">Destination</div>
                    <div className="text-white font-medium truncate max-w-28 text-sm">
                      {withdrawal.paymentMethod === 'crypto' ? withdrawal.cryptoAddress : withdrawal.phoneNumber}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedWithdrawal(withdrawal)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
                    >
                      <Eye size={12} />
                      <span>Détails</span>
                    </button>
                    {(withdrawal.status === 'success' || withdrawal.status === 'approved' || withdrawal.status === 'rejected') && (
                      <button
                        onClick={() => setShowDeleteConfirm(withdrawal.id)}
                        className="w-8 h-8 bg-white/20 hover:bg-red-500/30 border border-white/20 hover:border-red-400/30 rounded-xl flex items-center justify-center transition-all duration-200 group backdrop-blur-sm"
                        title="Supprimer cette transaction"
                      >
                        <Trash2 size={12} className="text-white/70 group-hover:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )
      )}
    </main>

    {/* Modal for withdrawal details */}
    {selectedWithdrawal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Détails du retrait</h3>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {(typeof selectedWithdrawal.amount === 'string' ? parseInt(selectedWithdrawal.amount) : selectedWithdrawal.amount).toLocaleString()} {selectedWithdrawal.paymentMethod === 'crypto' ? 'USDT' : 'FCFA'}
              </div>
              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full backdrop-blur-sm border text-sm font-bold ${getStatusColor(selectedWithdrawal.status)}`}>
                {getStatusIcon(selectedWithdrawal.status)}
                <span>{getStatusText(selectedWithdrawal.status)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-white/70 mb-1">Méthode de paiement</div>
                <div className="text-white">{getPaymentMethodName(selectedWithdrawal.paymentMethod)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-white/70 mb-1">Date de soumission</div>
                <div className="text-white">{new Date(selectedWithdrawal.submittedAt).toLocaleDateString('fr-FR')} à {new Date(selectedWithdrawal.submittedAt).toLocaleTimeString('fr-FR')}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-white/70 mb-1">ID de transaction</div>
                <div className="font-mono text-white">#{selectedWithdrawal.id.slice(-8).toUpperCase()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-white/70 mb-1">Destination</div>
                <div className="text-white break-all">
                  {selectedWithdrawal.paymentMethod === 'crypto' ? selectedWithdrawal.cryptoAddress : selectedWithdrawal.phoneNumber}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Modal for deposit details */}
    {selectedDeposit && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Détails du dépôt</h3>
              <button
                onClick={() => setSelectedDeposit(null)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {(typeof selectedDeposit.amount === 'string' ? parseInt(selectedDeposit.amount) : selectedDeposit.amount).toLocaleString()} FCFA
              </div>
              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full backdrop-blur-sm border text-sm font-bold ${getStatusColor(selectedDeposit.status)}`}>
                {getStatusIcon(selectedDeposit.status)}
                <span>{getStatusText(selectedDeposit.status)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-white/70 mb-1">Méthode de paiement</div>
                <div className="text-white">{getPaymentMethodName(selectedDeposit.paymentMethod)}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-white/70 mb-1">Code bénéficiaire</div>
                <div className="text-white font-mono text-sm">{selectedDeposit.beneficiaryCode}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-white/70 mb-1">Nom du bénéficiaire</div>
                <div className="text-white">{selectedDeposit.beneficiaryName}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-white/70 mb-1">Date de soumission</div>
                <div className="text-white">
                  {new Date(selectedDeposit.submittedAt).toLocaleDateString('fr-FR')} à {new Date(selectedDeposit.submittedAt).toLocaleTimeString('fr-FR')}
                </div>
              </div>

              {selectedDeposit.transactionImage && (
                <div>
                  <div className="text-sm font-medium text-white/70 mb-2">Capture de transaction</div>
                  <div className="border border-white/20 rounded-xl overflow-hidden">
                    <img
                      src={selectedDeposit.transactionImage || selectedDeposit.proofImage || ''}
                      alt="Transaction capture"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Delete Confirmation Modal */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-sm w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Confirmer la suppression</h3>
            <p className="text-white/70 text-sm mb-6">
              Êtes-vous sûr de vouloir annuler cette {activeTab === 'deposits' ? 'demande de dépôt' : 'demande de retrait'} ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 px-4 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl text-white font-medium transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'deposits') {
                    deleteDeposit(showDeleteConfirm)
                  } else {
                    deleteWithdrawal(showDeleteConfirm)
                  }
                }}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Navigation Bottom */}
    <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <Link href="/" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
          <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
            <span className="text-white text-xs">🏠</span>
          </div>
          <span className="text-white/70 text-xs">Accueil</span>
        </Link>
        <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
          <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
            <span className="text-white text-xs">📊</span>
          </div>
          <span className="text-white/70 text-xs">Produits</span>
        </Link>
        <Link href="/portefeuille" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-1 shadow-lg">
            <span className="text-white text-xs">💼</span>
          </div>
          <span className="text-purple-400 text-xs font-semibold">Portefeuille</span>
        </Link>
        <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
          <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
            <span className="text-white text-xs">👤</span>
          </div>
          <span className="text-white/70 text-xs">Compte</span>
        </Link>
      </div>
    </div>
  </div>
  )
}
