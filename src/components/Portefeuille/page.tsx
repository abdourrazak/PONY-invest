'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Clock, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface DepositRequest {
  id: string
  amount: string
  paymentMethod: 'orange' | 'mtn' | 'crypto'
  transactionImage: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  beneficiaryCode: string
  beneficiaryName: string
}

export default function Portefeuille() {
  const { userData } = useAuth()
  const [deposits, setDeposits] = useState<DepositRequest[]>([])
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!userData?.numeroTel) return

    // Charger les dépôts depuis localStorage
    const savedDeposits = localStorage.getItem(`deposits_${userData.numeroTel}`)
    if (savedDeposits) {
      setDeposits(JSON.parse(savedDeposits))
    }
  }, [userData])

  const deleteDeposit = (depositId: string) => {
    if (!userData?.numeroTel) return

    const updatedDeposits = deposits.filter(d => d.id !== depositId)
    setDeposits(updatedDeposits)
    localStorage.setItem(`deposits_${userData.numeroTel}`, JSON.stringify(updatedDeposits))
    setShowDeleteConfirm(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'approved': return 'bg-green-100 text-green-800 border-green-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-600" />
      case 'approved': return <CheckCircle size={16} className="text-green-600" />
      case 'rejected': return <XCircle size={16} className="text-red-600" />
      default: return <Clock size={16} className="text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'approved': return 'Approuvé'
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
          <h1 className="text-white text-lg font-bold">💼 Mon Portefeuille</h1>
          <div className="w-5"></div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{deposits.filter(d => d.status === 'pending').length}</div>
              <div className="text-xs text-gray-600 font-medium">En attente</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{deposits.filter(d => d.status === 'approved').length}</div>
              <div className="text-xs text-gray-600 font-medium">Approuvés</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{deposits.filter(d => d.status === 'rejected').length}</div>
              <div className="text-xs text-gray-600 font-medium">Rejetés</div>
            </div>
          </div>
        </div>

        {/* Deposits List */}
        <div className="space-y-4">
          {deposits.length === 0 ? (
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
                        <div className="font-bold text-gray-800">{parseInt(deposit.amount).toLocaleString()} FCFA</div>
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
          )}
        </div>
      </div>

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
                  {parseInt(selectedDeposit.amount).toLocaleString()} FCFA
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
                      src={selectedDeposit.transactionImage}
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

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Annuler le dépôt</h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir annuler cette demande de dépôt ? Cette action est irréversible.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300"
                >
                  Garder
                </button>
                <button
                  onClick={() => deleteDeposit(showDeleteConfirm)}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
