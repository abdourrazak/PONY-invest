'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Eye, Trash2, X, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'
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
      setFirestoreTransactions(transactions)
      // Séparer les dépôts et retraits depuis Firestore
      const firestoreDeposits = transactions
        .filter(t => t.type === 'deposit')
        .map(t => ({
          id: t.id,
          amount: t.amount,
          paymentMethod: t.paymentMethod,
          transactionImage: t.proofImage || '',
          proofImage: t.proofImage,
          status: t.status,  // Garder le statut Firestore original
          submittedAt: t.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          beneficiaryCode: t.beneficiaryName || '',
          beneficiaryName: t.beneficiaryName || '',
          type: 'deposit' as const
        }))

      const firestoreWithdrawals = transactions
        .filter(t => t.type === 'withdrawal')
        .map(t => ({
          id: t.id,
          amount: t.amount,
          paymentMethod: t.paymentMethod,
          phoneNumber: t.phoneNumber || '',
          cryptoAddress: t.cryptoAddress || '',
          status: t.status,  // Garder le statut Firestore original
          submittedAt: t.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          type: 'withdrawal' as const
        }))

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
    if (!userData?.numeroTel) return

    try {
      // Supprimer de Firestore si c'est une transaction réelle
      const transactionToDelete = firestoreTransactions.find(t => t.id === depositId)
      if (transactionToDelete) {
        const transactionRef = doc(db, 'transactions', depositId)
        await deleteDoc(transactionRef)
        console.log('Transaction supprimée de Firestore:', depositId)
      }

      // Supprimer de localStorage (données locales)
      const updatedDeposits = deposits.filter(d => d.id !== depositId)
      setDeposits(updatedDeposits)
      localStorage.setItem(`deposits_${userData.numeroTel}`, JSON.stringify(updatedDeposits))
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la transaction')
    }
  }

  const deleteWithdrawal = async (withdrawalId: string) => {
    if (!userData?.numeroTel) return

    try {
      // Supprimer de Firestore si c'est une transaction réelle  
      const transactionToDelete = firestoreTransactions.find(t => t.id === withdrawalId)
      if (transactionToDelete) {
        const transactionRef = doc(db, 'transactions', withdrawalId)
        await deleteDoc(transactionRef)
        console.log('Transaction supprimée de Firestore:', withdrawalId)
      }

      // Supprimer de localStorage (données locales)
      const updatedWithdrawals = withdrawals.filter(w => w.id !== withdrawalId)
      setWithdrawals(updatedWithdrawals)
      localStorage.setItem(`withdrawals_${userData.numeroTel}`, JSON.stringify(updatedWithdrawals))
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la transaction')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'approved': return 'bg-green-50 border-green-200 text-green-800'
      case 'success': return 'bg-green-50 border-green-200 text-green-800'  // Firestore status
      case 'rejected': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-600" />
      case 'approved': return <CheckCircle size={16} className="text-green-600" />
      case 'success': return <CheckCircle size={16} className="text-green-600" />  // Firestore status
      case 'rejected': return <XCircle size={16} className="text-red-600" />
      default: return <Clock size={16} className="text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'approved': return 'Approuvé'
      case 'success': return 'Approuvé'  // Ajouter mapping pour Firestore
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
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <Link href="/compte" className="hover:scale-110 transition-transform duration-200">
            <ArrowLeft className="text-white" size={20} />
          </Link>
          <div className="text-center">
            <h1 className="text-white text-lg font-bold">💼 Mon Portefeuille</h1>
            <div className="text-white/90 text-sm font-medium mt-1">
              Solde: {balance.toLocaleString()} FCFA
            </div>
          </div>
          <div className="w-5"></div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => setActiveTab('deposits')}
            className={`flex-1 py-3 px-4 font-bold text-sm transition-all ${
              activeTab === 'deposits'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📥 Dépôts ({deposits.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex-1 py-3 px-4 font-bold text-sm transition-all ${
              activeTab === 'withdrawals'
                ? 'bg-purple-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            💸 Retraits ({withdrawals.length})
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {activeTab === 'deposits' 
                  ? deposits.filter(d => d.status === 'pending').length
                  : withdrawals.filter(w => w.status === 'pending').length
                }
              </div>
              <div className="text-xs text-gray-600 font-medium">En attente</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activeTab === 'deposits' 
                  ? deposits.filter(d => d.status === 'approved' || d.status === 'success').length
                  : withdrawals.filter(w => w.status === 'approved' || w.status === 'success').length
                }
              </div>
              <div className="text-xs text-gray-600 font-medium">Approuvés</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {activeTab === 'deposits' 
                  ? deposits.filter(d => d.status === 'rejected').length
                  : withdrawals.filter(w => w.status === 'rejected').length
                }
              </div>
              <div className="text-xs text-gray-600 font-medium">Rejetés</div>
            </div>
          </div>
        </div>

        {/* Content Lists */}
        <div className="space-y-4">
          {activeTab === 'deposits' ? (
            deposits.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Aucun dépôt</h3>
                <p className="text-gray-500 text-sm mb-4">Vous n'avez encore effectué aucun dépôt.</p>
                <Link href="/recharge">
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all">
                    Effectuer un dépôt
                  </button>
                </Link>
              </div>
            ) : (
              deposits.map((deposit) => (
                <div key={deposit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${getPaymentMethodColor(deposit.paymentMethod)} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">
                            {deposit.paymentMethod === 'orange' ? 'O' : deposit.paymentMethod === 'mtn' ? 'M' : '₿'}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{(typeof deposit.amount === 'string' ? parseInt(deposit.amount) : deposit.amount).toLocaleString()} FCFA</div>
                          <div className="text-sm text-gray-600">{getPaymentMethodName(deposit.paymentMethod)}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center space-x-1 ${getStatusColor(deposit.status)}`}>
                        {getStatusIcon(deposit.status)}
                        <span>{getStatusText(deposit.status)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-3">
                      <div>
                        <div className="font-medium text-gray-700">Date de soumission</div>
                        <div>{new Date(deposit.submittedAt).toLocaleDateString('fr-FR')} à {new Date(deposit.submittedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-700">ID de transaction</div>
                        <div className="font-mono">#{deposit.id.slice(-8).toUpperCase()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        <div className="font-medium text-gray-700">Bénéficiaire</div>
                        <div className="truncate max-w-32">{deposit.beneficiaryName}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedDeposit(deposit)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          <Eye size={14} />
                          <span>Détails</span>
                        </button>
                        {deposit.status === 'pending' && (
                          <button
                            onClick={() => setShowDeleteConfirm(deposit.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-xs font-medium"
                          >
                            <Trash2 size={14} />
                            <span>Annuler</span>
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
              <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Aucun retrait</h3>
                <p className="text-gray-500 text-sm mb-4">Vous n'avez encore effectué aucune demande de retrait.</p>
                <Link href="/retrait">
                  <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all">
                    Demander un retrait
                  </button>
                </Link>
              </div>
            ) : (
              withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${getPaymentMethodColor(withdrawal.paymentMethod)} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">
                            {withdrawal.paymentMethod === 'orange' ? 'O' : withdrawal.paymentMethod === 'mtn' ? 'M' : '₿'}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{(typeof withdrawal.amount === 'string' ? parseInt(withdrawal.amount) : withdrawal.amount).toLocaleString()} {withdrawal.paymentMethod === 'crypto' ? 'USDT' : 'FCFA'}</div>
                          <div className="text-sm text-gray-600">{getPaymentMethodName(withdrawal.paymentMethod)}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center space-x-1 ${getStatusColor(withdrawal.status)}`}>
                        {getStatusIcon(withdrawal.status)}
                        <span>{getStatusText(withdrawal.status)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-3">
                      <div>
                        <div className="font-medium text-gray-700">Date de soumission</div>
                        <div>{new Date(withdrawal.submittedAt).toLocaleDateString('fr-FR')} à {new Date(withdrawal.submittedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-700">ID de transaction</div>
                        <div className="font-mono">#{withdrawal.id.slice(-8).toUpperCase()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        <div className="font-medium text-gray-700">Destination</div>
                        <div className="truncate max-w-32">
                          {withdrawal.paymentMethod === 'crypto' ? withdrawal.cryptoAddress : withdrawal.phoneNumber}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedWithdrawal(withdrawal)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          <Eye size={14} />
                          <span>Détails</span>
                        </button>
                        {withdrawal.status === 'pending' && (
                          <button
                            onClick={() => setShowDeleteConfirm(withdrawal.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-xs font-medium"
                          >
                            <Trash2 size={14} />
                            <span>Annuler</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Modal for withdrawal details */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Détails du retrait</h3>
                <button
                  onClick={() => setSelectedWithdrawal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${getPaymentMethodColor(selectedWithdrawal.paymentMethod)} rounded-lg flex items-center justify-center`}>
                  <span className="text-white font-bold">
                    {selectedWithdrawal.paymentMethod === 'orange' ? 'O' : selectedWithdrawal.paymentMethod === 'mtn' ? 'M' : '₿'}
                  </span>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800">{(typeof selectedWithdrawal.amount === 'string' ? parseInt(selectedWithdrawal.amount) : selectedWithdrawal.amount).toLocaleString()} {selectedWithdrawal.paymentMethod === 'crypto' ? 'USDT' : 'FCFA'}</div>
                  <div className="text-sm text-gray-600">{getPaymentMethodName(selectedWithdrawal.paymentMethod)}</div>
                </div>
              </div>

              <div className={`px-4 py-3 rounded-lg border ${getStatusColor(selectedWithdrawal.status)}`}>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedWithdrawal.status)}
                  <span className="font-bold">{getStatusText(selectedWithdrawal.status)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Date de soumission</div>
                  <div className="text-gray-600">{new Date(selectedWithdrawal.submittedAt).toLocaleDateString('fr-FR')} à {new Date(selectedWithdrawal.submittedAt).toLocaleTimeString('fr-FR')}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">ID de transaction</div>
                  <div className="font-mono text-gray-600">#{selectedWithdrawal.id.slice(-8).toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Destination</div>
                  <div className="text-gray-600 break-all">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Détails du dépôt</h3>
                <button
                  onClick={() => setSelectedDeposit(null)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                >
                  <XCircle size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {(typeof selectedDeposit.amount === 'string' ? parseInt(selectedDeposit.amount) : selectedDeposit.amount).toLocaleString()} FCFA
                </div>
                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-bold ${getStatusColor(selectedDeposit.status)}`}>
                  {getStatusIcon(selectedDeposit.status)}
                  <span>{getStatusText(selectedDeposit.status)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Méthode de paiement</div>
                  <div className="text-gray-600">{getPaymentMethodName(selectedDeposit.paymentMethod)}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Code bénéficiaire</div>
                  <div className="text-gray-600 font-mono text-sm">{selectedDeposit.beneficiaryCode}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Nom du bénéficiaire</div>
                  <div className="text-gray-600">{selectedDeposit.beneficiaryName}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Date de soumission</div>
                  <div className="text-gray-600">
                    {new Date(selectedDeposit.submittedAt).toLocaleDateString('fr-FR')} à {new Date(selectedDeposit.submittedAt).toLocaleTimeString('fr-FR')}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Capture de transaction</div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={selectedDeposit.transactionImage || selectedDeposit.proofImage || ''}
                      alt="Transaction capture"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmer la suppression</h3>
              <p className="text-gray-600 text-sm mb-6">
                Êtes-vous sûr de vouloir annuler cette {activeTab === 'deposits' ? 'demande de dépôt' : 'demande de retrait'} ? Cette action est irréversible.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
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
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
