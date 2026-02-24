'use client'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { RefreshCw, Users, Activity, Clock } from 'lucide-react'

interface UserConnection {
  uid: string
  numeroTel: string
  lastLoginAt: Timestamp | null
  loginCount: number
  lastLoginIP: string
  createdAt: Timestamp
  balance: number
  role?: string
  totalDeposits: number
  totalWithdrawals: number
  pendingDeposits: number
  pendingWithdrawals: number
}

export default function AdminConnexionsPage() {
  const [users, setUsers] = useState<UserConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'new'>('all')

  const loadConnections = async () => {
    setLoading(true)
    try {
      console.log('🔄 Chargement des connexions utilisateurs...')
      const usersRef = collection(db, 'users')
      
      // Récupérer TOUS les utilisateurs sans tri (pour éviter erreur d'index)
      const snapshot = await getDocs(usersRef)
      console.log(`📊 ${snapshot.size} utilisateurs trouvés`)
      
      // Récupérer toutes les transactions
      const transactionsRef = collection(db, 'transactions')
      const transactionsSnapshot = await getDocs(transactionsRef)
      console.log(`💰 ${transactionsSnapshot.size} transactions trouvées`)
      
      // Créer un map des transactions par userId
      const transactionsByUser = new Map<string, { deposits: number, withdrawals: number, pendingDeposits: number, pendingWithdrawals: number }>()
      
      transactionsSnapshot.forEach((doc) => {
        const transaction = doc.data()
        const userId = transaction.userId
        
        if (!transactionsByUser.has(userId)) {
          transactionsByUser.set(userId, { 
            deposits: 0, 
            withdrawals: 0,
            pendingDeposits: 0,
            pendingWithdrawals: 0
          })
        }
        
        const userTransactions = transactionsByUser.get(userId)!
        const amount = transaction.amount || 0
        
        if (transaction.type === 'deposit') {
          if (transaction.status === 'approved') {
            userTransactions.deposits += amount
          } else if (transaction.status === 'pending') {
            userTransactions.pendingDeposits += amount
          }
        } else if (transaction.type === 'withdrawal') {
          if (transaction.status === 'approved') {
            userTransactions.withdrawals += amount
          } else if (transaction.status === 'pending') {
            userTransactions.pendingWithdrawals += amount
          }
        }
      })
      
      const usersList: UserConnection[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        const userTransactions = transactionsByUser.get(doc.id) || { 
          deposits: 0, 
          withdrawals: 0,
          pendingDeposits: 0,
          pendingWithdrawals: 0
        }
        
        console.log(`👤 Utilisateur ${data.numeroTel}:`, {
          lastLoginAt: data.lastLoginAt ? 'OUI' : 'NON',
          loginCount: data.loginCount || 0,
          lastLoginIP: data.lastLoginIP || 'N/A',
          deposits: userTransactions.deposits,
          withdrawals: userTransactions.withdrawals
        })
        
        usersList.push({
          uid: doc.id,
          numeroTel: data.numeroTel || 'N/A',
          lastLoginAt: data.lastLoginAt || null,
          loginCount: data.loginCount || 0,
          lastLoginIP: data.lastLoginIP || 'unknown',
          createdAt: data.createdAt || Timestamp.now(),
          balance: data.balance || 0,
          role: data.role || 'user',
          totalDeposits: userTransactions.deposits,
          totalWithdrawals: userTransactions.withdrawals,
          pendingDeposits: userTransactions.pendingDeposits,
          pendingWithdrawals: userTransactions.pendingWithdrawals
        })
      })
      
      // Trier côté client par lastLoginAt (les plus récents en premier)
      usersList.sort((a, b) => {
        if (!a.lastLoginAt && !b.lastLoginAt) return 0
        if (!a.lastLoginAt) return 1
        if (!b.lastLoginAt) return -1
        return b.lastLoginAt.toMillis() - a.lastLoginAt.toMillis()
      })
      
      console.log('✅ Utilisateurs triés:', usersList.length)
      setUsers(usersList)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('❌ Erreur chargement connexions:', error)
      alert(`Erreur: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConnections()
  }, [])

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Jamais connecté'
    
    try {
      const date = timestamp.toDate()
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      // Format détaillé avec heure
      const dateStr = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      const timeStr = date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      // Temps relatif
      let relative = ''
      if (diffMins < 1) {
        relative = 'À l\'instant'
      } else if (diffMins < 60) {
        relative = `Il y a ${diffMins} min`
      } else if (diffHours < 24) {
        relative = `Il y a ${diffHours}h`
      } else if (diffDays < 7) {
        relative = `Il y a ${diffDays}j`
      } else {
        relative = dateStr
      }

      return { full: `${dateStr} à ${timeStr}`, relative }
    } catch (error) {
      return { full: 'Date invalide', relative: 'N/A' }
    }
  }

  const filterUsers = (usersList: UserConnection[]) => {
    const now = new Date()
    
    switch (filter) {
      case 'today':
        return usersList.filter(user => {
          if (!user.lastLoginAt) return false
          const loginDate = user.lastLoginAt.toDate()
          return loginDate.toDateString() === now.toDateString()
        })
      case 'week':
        return usersList.filter(user => {
          if (!user.lastLoginAt) return false
          const loginDate = user.lastLoginAt.toDate()
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return loginDate >= weekAgo
        })
      case 'new':
        return usersList.filter(user => {
          if (!user.createdAt) return false
          const createdDate = user.createdAt.toDate()
          const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          return createdDate >= oneDayAgo
        })
      default:
        return usersList
    }
  }

  const filteredUsers = filterUsers(users)
  const connectedToday = users.filter(user => {
    if (!user.lastLoginAt) return false
    const loginDate = user.lastLoginAt.toDate()
    return loginDate.toDateString() === new Date().toDateString()
  }).length
  
  const newUsersToday = users.filter(user => {
    if (!user.createdAt) return false
    const createdDate = user.createdAt.toDate()
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return createdDate >= oneDayAgo
  }).length
  
  const totalDeposits = users.reduce((sum, u) => sum + u.totalDeposits, 0)
  const totalWithdrawals = users.reduce((sum, u) => sum + u.totalWithdrawals, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
                Connexions Utilisateurs
              </h1>
              <p className="text-white/60 text-xs md:text-sm truncate">
                MAJ: {lastUpdate.toLocaleTimeString('fr-FR')}
              </p>
            </div>
            <button
              onClick={loadConnections}
              disabled={loading}
              className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex-shrink-0"
            >
              <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''} md:w-4 md:h-4`} />
              <span className="text-xs md:text-sm font-medium hidden sm:inline">Actualiser</span>
              <span className="text-xs md:text-sm font-medium sm:hidden">↻</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-white/70 text-xs md:text-sm mb-1">Total Utilisateurs</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{users.length}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users size={20} className="text-blue-400 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-white/70 text-xs md:text-sm mb-1">Connectés Aujourd'hui</p>
                <p className="text-2xl md:text-3xl font-bold text-green-400">{connectedToday}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Activity size={20} className="text-green-400 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-white/70 text-xs md:text-sm mb-1">Nouveaux Inscrits</p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-400">{newUsersToday}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <span className="text-yellow-400 text-lg md:text-xl">✨</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-white/70 text-xs md:text-sm mb-1">Connexions Totales</p>
                <p className="text-2xl md:text-3xl font-bold text-purple-400">
                  {users.reduce((sum, u) => sum + u.loginCount, 0)}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Clock size={20} className="text-purple-400 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-white/70 text-xs md:text-sm mb-1">Dépôts Totaux</p>
                <p className="text-xl md:text-2xl font-bold text-green-400">
                  {totalDeposits.toLocaleString()} F
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-lg md:text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-white/70 text-xs md:text-sm mb-1">Retraits Totaux</p>
                <p className="text-xl md:text-2xl font-bold text-red-400">
                  {totalWithdrawals.toLocaleString()} F
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-red-400 text-lg md:text-xl">💸</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="text-blue-400 text-xl">ℹ️</div>
            <div>
              <h3 className="text-blue-400 font-medium text-sm mb-1">Information importante</h3>
              <p className="text-white/70 text-xs">
                Les données de connexion (heure, compteur) s'afficheront automatiquement dès que les utilisateurs se connecteront à l'application. 
                Les utilisateurs qui ne se sont pas encore reconnectés depuis la mise à jour afficheront "Jamais connecté".
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 md:space-x-3 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Tous ({users.length})
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              filter === 'today'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Aujourd'hui ({connectedToday})
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              filter === 'week'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Cette semaine
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              filter === 'new'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            ✨ Nouveaux ({newUsersToday})
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
          {/* Mobile: Afficher un message pour faire défiler */}
          <div className="md:hidden bg-yellow-500/10 border-b border-yellow-400/30 px-4 py-2">
            <p className="text-yellow-400 text-xs text-center">
              ← Faites défiler horizontalement pour voir toutes les colonnes →
            </p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw size={40} className="animate-spin text-purple-400 mx-auto mb-4" />
                <p className="text-white/70">Chargement des connexions...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/70">Aucune connexion trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-black/30 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Date Inscription
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Dernière Connexion
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Heure Exacte
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Provenance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Nb Connexions
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Dépôts
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Retraits
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Solde
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Rôle
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredUsers.map((user) => {
                    const dateInfo = formatDate(user.lastLoginAt)
                    const isRecent = user.lastLoginAt && 
                      (new Date().getTime() - user.lastLoginAt.toDate().getTime()) < 3600000 // 1 heure
                    
                    return (
                      <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-3 ${
                              isRecent ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                            }`}></div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {user.numeroTel}
                              </div>
                              <div className="text-xs text-white/50">
                                {user.uid.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-yellow-400">
                              {user.createdAt ? user.createdAt.toDate().toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              }) : 'N/A'}
                            </div>
                            <div className="text-xs text-white/50">
                              {user.createdAt ? user.createdAt.toDate().toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {typeof dateInfo === 'object' ? dateInfo.relative : dateInfo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-blue-400 font-mono">
                            {typeof dateInfo === 'object' ? dateInfo.full : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/70">
                            {user.lastLoginIP}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-500/20 text-purple-400">
                            {user.loginCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-green-400 font-medium">
                              +{user.totalDeposits.toLocaleString()} $
                            </div>
                            {user.pendingDeposits > 0 && (
                              <div className="text-xs text-yellow-400">
                                ({user.pendingDeposits.toLocaleString()} en attente)
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-red-400 font-medium">
                              -{user.totalWithdrawals.toLocaleString()} $
                            </div>
                            {user.pendingWithdrawals > 0 && (
                              <div className="text-xs text-yellow-400">
                                ({user.pendingWithdrawals.toLocaleString()} en attente)
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-green-400 font-medium">
                            {user.balance.toLocaleString()} $
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
