'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Filter, Search, Receipt, CreditCard, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'card_payment' | 'investment' | 'rental' | 'commission' | 'checkin' | 'gift'
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed'
  createdAt: Timestamp
  updatedAt?: Timestamp
  method?: string
  reference?: string
  productName?: string
  cardType?: string
  description?: string
  level?: string
  quantity?: number
  paymentMethod?: string
  phoneNumber?: string
  transactionImage?: string
}

export default function MesRecus() {
  const { currentUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'investment' | 'commission' | 'gift'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (currentUser) {
      loadTransactions()
    }
  }, [currentUser])

  // Rafraîchir quand la page devient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser) {
        console.log('Page visible - Rafraîchissement des transactions')
        loadTransactions()
      }
    }

    const handleFocus = () => {
      if (currentUser) {
        console.log('Page focus - Rafraîchissement des transactions')
        loadTransactions()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [currentUser])

  const loadTransactions = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      const transactionsList: Transaction[] = []
      
      // 1. Charger les transactions principales (dépôts/retraits)
      try {
        const transactionsRef = collection(db, 'transactions')
        const q = query(
          transactionsRef,
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          transactionsList.push({
            id: doc.id,
            type: data.type || 'deposit',
            amount: data.amount || 0,
            status: data.status || 'pending',
            createdAt: data.createdAt || Timestamp.now(),
            method: data.paymentMethod || data.method,
            reference: data.reference || doc.id,
            description: data.type === 'deposit' ? 'Dépôt de fonds' : 'Retrait de fonds',
            phoneNumber: data.phoneNumber,
            ...data
          } as Transaction)
        })
      } catch (error) {
        console.log('Erreur chargement transactions:', error)
      }

      // 2. Charger les investissements (rentals)
      try {
        const rentalsRef = collection(db, 'rentals')
        const rentalsQuery = query(
          rentalsRef,
          where('userId', '==', currentUser.uid),
          orderBy('startDate', 'desc')
        )
        
        const rentalsSnapshot = await getDocs(rentalsQuery)
        rentalsSnapshot.forEach((doc) => {
          const data = doc.data()
          transactionsList.push({
            id: doc.id,
            type: 'investment',
            amount: data.totalCost || (data.unitPrice || 0) * (data.quantity || 1),
            status: 'active',
            createdAt: data.startDate || data.createdAt || Timestamp.now(),
            productName: data.productName || `Produit ${data.productId?.toUpperCase()}`,
            level: data.productId?.toUpperCase(),
            quantity: data.quantity || 1,
            description: `Investissement ${data.productName || data.productId?.toUpperCase()}`,
            reference: `INV-${doc.id.slice(-8).toUpperCase()}`
          } as Transaction)
        })
      } catch (error) {
        console.log('Erreur chargement investissements:', error)
      }

      // 3. Charger les commissions de parrainage
      try {
        const commissionsRef = collection(db, 'referralCommissions')
        const commissionsQuery = query(
          commissionsRef,
          where('referrerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        )
        
        const commissionsSnapshot = await getDocs(commissionsQuery)
        commissionsSnapshot.forEach((doc) => {
          const data = doc.data()
          transactionsList.push({
            id: doc.id,
            type: 'commission',
            amount: data.amount || 0,
            status: 'completed',
            createdAt: data.createdAt || Timestamp.now(),
            productName: `Commission ${data.level || 'Parrainage'}`,
            description: `Commission de parrainage - ${data.productName || 'Investissement'}`,
            reference: `COM-${doc.id.slice(-8).toUpperCase()}`,
            level: data.level
          } as Transaction)
        })
      } catch (error) {
        console.log('Erreur chargement commissions:', error)
      }

      // 4. Charger les cadeaux et check-ins
      try {
        const giftsRef = collection(db, 'userGifts')
        const giftsQuery = query(
          giftsRef,
          where('userId', '==', currentUser.uid),
          orderBy('claimedAt', 'desc')
        )
        
        const giftsSnapshot = await getDocs(giftsQuery)
        giftsSnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.claimed) {
            transactionsList.push({
              id: doc.id,
              type: 'gift',
              amount: data.amount || 0,
              status: 'completed',
              createdAt: data.claimedAt || data.createdAt || Timestamp.now(),
              productName: data.type === 'checkin' ? 'Check-in quotidien' : 'Cadeau',
              description: data.type === 'checkin' ? 'Récompense check-in quotidien' : 'Cadeau reçu',
              reference: `GIFT-${doc.id.slice(-8).toUpperCase()}`
            } as Transaction)
          }
        })
      } catch (error) {
        console.log('Erreur chargement cadeaux:', error)
      }

      // 5. Charger les achats de cartes produits (si la collection existe)
      try {
        const cardPurchasesRef = collection(db, 'cardPurchases')
        const cardQuery = query(
          cardPurchasesRef,
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        )
        
        const cardSnapshot = await getDocs(cardQuery)
        cardSnapshot.forEach((doc) => {
          const data = doc.data()
          transactionsList.push({
            id: doc.id,
            type: 'investment',
            amount: data.amount || 0,
            status: data.status || 'completed',
            createdAt: data.createdAt || Timestamp.now(),
            productName: data.productName || 'Carte Produit',
            description: `Achat carte produit - ${data.productName || 'Produit'}`,
            reference: `CARD-${doc.id.slice(-8).toUpperCase()}`,
            cardType: data.cardType
          } as Transaction)
        })
      } catch (error) {
        console.log('Collection cardPurchases non trouvée, ignorée')
      }
      
      // Trier toutes les transactions par date (plus récentes en premier)
      transactionsList.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0
        const timeB = b.createdAt?.toMillis() || 0
        return timeB - timeA
      })
      
      console.log(`✅ ${transactionsList.length} transactions chargées:`, {
        deposits: transactionsList.filter(t => t.type === 'deposit').length,
        withdrawals: transactionsList.filter(t => t.type === 'withdrawal').length,
        investments: transactionsList.filter(t => t.type === 'investment').length,
        commissions: transactionsList.filter(t => t.type === 'commission').length,
        gifts: transactionsList.filter(t => t.type === 'gift').length
      })
      
      setTransactions(transactionsList)
    } catch (error) {
      console.error('Erreur chargement transactions:', error)
    } finally {
      setLoading(false)
    }
  }


  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter
    const matchesSearch = searchTerm === '' || 
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="text-green-400" size={24} />
      case 'withdrawal':
        return <ArrowUpCircle className="text-red-400" size={24} />
      case 'investment':
        return <CreditCard className="text-blue-400" size={24} />
      case 'commission':
        return <div className="text-orange-400 text-xl">💰</div>
      case 'gift':
        return <div className="text-pink-400 text-xl">🎁</div>
      default:
        return <Receipt className="text-gray-400" size={24} />
    }
  }

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return 'Dépôt'
      case 'withdrawal':
        return 'Retrait'
      case 'investment':
        return transaction.productName || 'Investissement'
      case 'commission':
        return transaction.productName || 'Commission de parrainage'
      case 'gift':
        return transaction.productName || 'Cadeau'
      default:
        return 'Transaction'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/30'
      case 'active':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/30'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé'
      case 'pending':
        return 'En attente'
      case 'rejected':
        return 'Rejeté'
      case 'active':
        return 'Actif'
      case 'completed':
        return 'Terminé'
      default:
        return status
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadReceipt = (transaction: Transaction) => {
    // Créer un reçu simple en format texte
    const receiptContent = `
PONY - REÇU DE TRANSACTION
================================

Référence: ${transaction.reference || transaction.id}
Type: ${getTransactionTitle(transaction)}
Montant: ${transaction.amount.toLocaleString()} XAF
Statut: ${getStatusText(transaction.status)}
Date: ${formatDate(transaction.createdAt)}
${transaction.method ? `Méthode: ${transaction.method}` : ''}
${transaction.description ? `Description: ${transaction.description}` : ''}

Merci de votre confiance !
PONY - Plateforme d'investissement
    `

    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recu_${transaction.reference || transaction.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/compte" className="flex items-center text-white hover:text-purple-300 transition-all duration-200 transform hover:scale-105">
              <ArrowLeft size={24} className="mr-2" />
              <span className="font-medium">Retour</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Receipt className="text-purple-400" size={28} />
              <div>
                <h1 className="text-white font-bold text-xl">MES REÇUS</h1>
                <p className="text-white/60 text-sm">Historique des transactions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Filtres et Recherche */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtres */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Tout
              </button>
              <button
                onClick={() => setFilter('deposit')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'deposit' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Dépôts
              </button>
              <button
                onClick={() => setFilter('withdrawal')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'withdrawal' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Retraits
              </button>
              <button
                onClick={() => setFilter('investment')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'investment' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Investissements
              </button>
              <button
                onClick={() => setFilter('commission')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'commission' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Commissions
              </button>
              <button
                onClick={() => setFilter('gift')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'gift' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Cadeaux
              </button>
            </div>

            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
              <input
                type="text"
                placeholder="Rechercher par référence, produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Liste des Transactions */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-white/70 text-lg mb-2">Chargement des reçus...</div>
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="mx-auto text-white/30 mb-4" size={64} />
            <h3 className="text-white/70 text-lg mb-2">Aucun reçu trouvé</h3>
            <p className="text-white/50">
              {searchTerm || filter !== 'all' 
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Vous n\'avez pas encore de transactions'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {getTransactionTitle(transaction)}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {formatDate(transaction.createdAt)}
                      </p>
                      {transaction.reference && (
                        <p className="text-white/50 text-xs">
                          Réf: {transaction.reference}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-white font-bold text-xl mb-2">
                      {transaction.amount.toLocaleString()} XAF
                    </div>
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                    </div>
                  </div>
                </div>

                {(transaction.description || transaction.method) && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    {transaction.method && (
                      <p className="text-white/60 text-sm mb-1">
                        <span className="font-medium">Méthode:</span> {transaction.method}
                      </p>
                    )}
                    {transaction.description && (
                      <p className="text-white/60 text-sm">
                        <span className="font-medium">Description:</span> {transaction.description}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => downloadReceipt(transaction)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg text-purple-300 hover:text-purple-200 transition-all duration-200"
                  >
                    <Download size={16} />
                    <span className="text-sm font-medium">Télécharger</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
