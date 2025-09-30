'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Filter, Search, Receipt, CreditCard, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'card_payment' | 'investment'
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'active'
  createdAt: Timestamp
  updatedAt?: Timestamp
  method?: string
  reference?: string
  productName?: string
  cardType?: string
  description?: string
  level?: string
  quantity?: number
}

export default function MesRecus() {
  const { currentUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'card_payment' | 'investment'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (currentUser) {
      loadTransactions()
    }
  }, [currentUser])

  const loadTransactions = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      
      // Charger les transactions
      const transactionsRef = collection(db, 'transactions')
      const q = query(
        transactionsRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const transactionsList: Transaction[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        transactionsList.push({
          id: doc.id,
          ...data
        } as Transaction)
      })

      // Charger les achats de cartes produits (si la collection existe)
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
            type: 'card_payment',
            ...data
          } as Transaction)
        })
      } catch (error) {
        console.log('Collection cardPurchases non trouvée, ignorée')
      }

      // Charger les investissements (rentals)
      try {
        const rentalsRef = collection(db, 'rentals')
        const rentalsQuery = query(
          rentalsRef,
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        )
        
        const rentalsSnapshot = await getDocs(rentalsQuery)
        rentalsSnapshot.forEach((doc) => {
          const data = doc.data()
          transactionsList.push({
            id: doc.id,
            type: 'investment',
            amount: (data.price || 0) * (data.quantity || 1),
            status: 'active',
            createdAt: data.createdAt,
            productName: data.productName,
            level: data.level,
            quantity: data.quantity
          } as Transaction)
        })
      } catch (error) {
        console.log('Erreur chargement investissements:', error)
      }
      
      // Trier toutes les transactions par date
      transactionsList.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      
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
      case 'card_payment':
        return <CreditCard className="text-blue-400" size={24} />
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
      case 'card_payment':
        return transaction.productName || 'Paiement Carte Produit'
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
AXML GLOBAL - REÇU DE TRANSACTION
================================

Référence: ${transaction.reference || transaction.id}
Type: ${getTransactionTitle(transaction)}
Montant: ${transaction.amount.toLocaleString()} XAF
Statut: ${getStatusText(transaction.status)}
Date: ${formatDate(transaction.createdAt)}
${transaction.method ? `Méthode: ${transaction.method}` : ''}
${transaction.description ? `Description: ${transaction.description}` : ''}

Merci de votre confiance !
AXML Global - Plateforme d'investissement
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
                onClick={() => setFilter('card_payment')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'card_payment' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Cartes
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
