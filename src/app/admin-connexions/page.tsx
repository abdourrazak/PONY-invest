'use client'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Users, Activity, Clock } from 'lucide-react'

interface UserConnection {
  uid: string
  numeroTel: string
  lastLoginAt: Timestamp | null
  loginCount: number
  lastLoginIP: string
  createdAt: Timestamp
  balance: number
  role?: string
}

export default function AdminConnexionsPage() {
  const [users, setUsers] = useState<UserConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all')

  const loadConnections = async () => {
    setLoading(true)
    try {
      const usersRef = collection(db, 'users')
      const usersQuery = query(usersRef, orderBy('lastLoginAt', 'desc'))
      const snapshot = await getDocs(usersQuery)
      
      const usersList: UserConnection[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        usersList.push({
          uid: doc.id,
          numeroTel: data.numeroTel || 'N/A',
          lastLoginAt: data.lastLoginAt || null,
          loginCount: data.loginCount || 0,
          lastLoginIP: data.lastLoginIP || 'unknown',
          createdAt: data.createdAt || Timestamp.now(),
          balance: data.balance || 0,
          role: data.role || 'user'
        })
      })
      
      setUsers(usersList)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erreur chargement connexions:', error)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard-admin" className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all">
                <ArrowLeft size={20} className="text-white" />
              </Link>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Connexions Utilisateurs
                </h1>
                <p className="text-white/60 text-sm">
                  Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                </p>
              </div>
            </div>
            <button
              onClick={loadConnections}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="text-sm font-medium">Actualiser</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Total Utilisateurs</p>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users size={24} className="text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Connectés Aujourd'hui</p>
                <p className="text-3xl font-bold text-green-400">{connectedToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Activity size={24} className="text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Connexions Totales</p>
                <p className="text-3xl font-bold text-purple-400">
                  {users.reduce((sum, u) => sum + u.loginCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Clock size={24} className="text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Tous ({users.length})
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'today'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Aujourd'hui ({connectedToday})
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'week'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Cette semaine
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Utilisateur
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
                          <div className="text-sm text-green-400 font-medium">
                            {user.balance.toLocaleString()} FCFA
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
