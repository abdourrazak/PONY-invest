'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Crown, Clock, TrendingUp, CreditCard, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

interface UserGains {
  montantCredite: number
  forfaitsVipActifs: number
  gainsHoraire: number
  revenusQuotidiens: number
  totalDepense: number
}

export default function MesGains() {
  const router = useRouter()
  const { currentUser, userData } = useAuth()
  const [userGains, setUserGains] = useState<UserGains>({
    montantCredite: 0,
    forfaitsVipActifs: 0,
    gainsHoraire: 0,
    revenusQuotidiens: 0,
    totalDepense: 0
  })
  const [loading, setLoading] = useState(true)

  // Fonction pour rafraîchir les données
  const refreshUserGains = () => {
    if (!userData?.numeroTel) return

    const userKey = userData.numeroTel
    
    // Montant crédité depuis localStorage
    const savedFunds = localStorage.getItem(`userFunds_${userKey}`)
    const montantCredite = savedFunds ? parseInt(savedFunds) : 1000
    
    // Historique des récompenses quotidiennes
    const rewardHistory = JSON.parse(localStorage.getItem(`rewardHistory_${userKey}`) || '[]')
    const revenusQuotidiens = rewardHistory.reduce((total: number, reward: any) => total + reward.amount, 0)
    
    // Récompenses de parrainage
    const referralRewards = parseInt(localStorage.getItem(`referralRewards_${userKey}`) || '0')
    
    // Forfaits VIP actifs
    const forfaitsVipActifs = parseInt(localStorage.getItem(`forfaitsVipActifs_${userKey}`) || '0')
    
    // Gains horaire basé sur les forfaits actifs
    const gainsHoraire = forfaitsVipActifs * 50
    
    // Total dépensé
    const totalDepense = parseInt(localStorage.getItem(`totalDepense_${userKey}`) || '0')

    setUserGains({
      montantCredite,
      forfaitsVipActifs,
      gainsHoraire,
      revenusQuotidiens,
      totalDepense
    })

    console.log('🔄 Gains rafraîchis:', {
      montantCredite,
      revenusQuotidiens,
      userKey,
      rewardHistoryLength: rewardHistory.length
    })
  }

  // Écouter les événements de focus pour rafraîchir
  useEffect(() => {
    const handleFocus = () => {
      console.log('📱 Page focus - Rafraîchissement des gains')
      refreshUserGains()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible - Rafraîchissement des gains')
        refreshUserGains()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [userData])

  useEffect(() => {
    const fetchUserGains = async () => {
      if (!currentUser && !userData) return

      try {
        const userId = currentUser?.uid || userData?.uid
        const userPhone = userData?.numeroTel
        
        if (userId && userPhone) {
          // Récupérer les données depuis localStorage (données locales utilisateur)
          const userKey = userPhone
          
          // Montant crédité depuis localStorage
          const savedFunds = localStorage.getItem(`userFunds_${userKey}`)
          const montantCredite = savedFunds ? parseInt(savedFunds) : 1000
          
          // Historique des récompenses quotidiennes
          const rewardHistory = JSON.parse(localStorage.getItem(`rewardHistory_${userKey}`) || '[]')
          const revenusQuotidiens = rewardHistory.reduce((total: number, reward: any) => total + reward.amount, 0)
          
          // Récompenses de parrainage
          const referralRewards = parseInt(localStorage.getItem(`referralRewards_${userKey}`) || '0')
          
          // Forfaits VIP actifs (depuis localStorage ou Firebase)
          const forfaitsVipActifs = parseInt(localStorage.getItem(`forfaitsVipActifs_${userKey}`) || '0')
          
          // Gains horaire basé sur les forfaits actifs
          const gainsHoraire = forfaitsVipActifs * 50 // 50 XOF par forfait par heure
          
          // Total dépensé (achats de forfaits, etc.)
          const totalDepense = parseInt(localStorage.getItem(`totalDepense_${userKey}`) || '0')

          setUserGains({
            montantCredite,
            forfaitsVipActifs,
            gainsHoraire,
            revenusQuotidiens,
            totalDepense
          })

          console.log('Gains utilisateur chargés:', {
            montantCredite,
            forfaitsVipActifs,
            gainsHoraire,
            revenusQuotidiens,
            totalDepense,
            userKey
          })
        }
      } catch (error) {
        console.error('Erreur lors du chargement des gains:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserGains()
    
    // Écouter les changements dans localStorage pour mise à jour en temps réel
    const handleStorageChange = () => {
      fetchUserGains()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [currentUser, userData])

  const formatCurrency = (amount: number) => {
    return `XOF${amount.toFixed(2).replace('.', ',')}`
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ 
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      position: 'relative',
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'none'
    }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 px-3 sm:px-4 py-3 sm:py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
          >
            <ArrowLeft size={20} className="drop-shadow-sm" />
          </button>
          <div className="text-center flex-1">
            <span className="text-white text-lg sm:text-xl font-black tracking-wide drop-shadow-lg">Mes Gains</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="px-3 sm:px-4 py-3 sm:py-4" style={{ touchAction: 'pan-y' }}>
        {/* Montant Crédité */}
        <div className="bg-gradient-to-br from-white via-green-50/30 to-white rounded-xl shadow-2xl p-4 sm:p-5 mb-4 border border-green-200/50 hover:shadow-3xl transition-all duration-300 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-gray-700 text-sm font-black tracking-wide">Montant Crédité</span>
              <Info size={16} className="text-green-500 ml-2 drop-shadow-sm" />
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard size={18} className="text-white drop-shadow-sm" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-transparent bg-gradient-to-r from-green-600 via-green-700 to-blue-600 bg-clip-text drop-shadow-sm">
            {loading ? 'Chargement...' : formatCurrency(userGains.montantCredite)}
          </div>
        </div>

        {/* Grille des statistiques */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          {/* Forfaits VIP Actifs */}
          <div className="bg-gradient-to-br from-white via-blue-50/40 to-white rounded-xl shadow-2xl p-4 border border-blue-200/50 hover:shadow-3xl hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 text-xs sm:text-sm font-black tracking-wide">Forfaits VIP Actifs</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Crown size={16} className="text-white drop-shadow-sm sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
              {loading ? '...' : userGains.forfaitsVipActifs}
            </div>
          </div>

          {/* Gains Horaire */}
          <div className="bg-gradient-to-br from-white via-green-50/40 to-white rounded-xl shadow-2xl p-4 border border-green-200/50 hover:shadow-3xl hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 text-xs sm:text-sm font-black tracking-wide">Gains Horaire</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <Clock size={16} className="text-white drop-shadow-sm sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-transparent bg-gradient-to-r from-green-600 to-green-800 bg-clip-text">
              {loading ? '...' : formatCurrency(userGains.gainsHoraire)}
            </div>
          </div>

          {/* Revenus Quotidiens */}
          <div className="bg-gradient-to-br from-white via-purple-50/40 to-white rounded-xl shadow-2xl p-4 border border-purple-200/50 hover:shadow-3xl hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 text-xs sm:text-sm font-black tracking-wide">Revenus Quotidiens</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp size={16} className="text-white drop-shadow-sm sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-transparent bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text">
              {loading ? '...' : formatCurrency(userGains.revenusQuotidiens)}
            </div>
          </div>

          {/* Total Dépensé */}
          <div className="bg-gradient-to-br from-white via-red-50/40 to-white rounded-xl shadow-2xl p-4 border border-red-200/50 hover:shadow-3xl hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 text-xs sm:text-sm font-black tracking-wide">Total Dépensé</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard size={16} className="text-white drop-shadow-sm sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-transparent bg-gradient-to-r from-red-600 to-red-800 bg-clip-text">
              {loading ? '...' : formatCurrency(userGains.totalDepense)}
            </div>
          </div>
        </div>

        {/* Section Forfaits et Revenus */}
        <div className="bg-gradient-to-br from-white via-violet-50/30 to-white rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 border border-violet-200/50 backdrop-blur-sm">
          <h2 className="text-center text-lg sm:text-xl font-black text-transparent bg-gradient-to-r from-violet-600 via-purple-700 to-violet-800 bg-clip-text mb-6 tracking-wide drop-shadow-sm">
            Mes Forfaits Et Revenus Actifs
          </h2>
          
          {/* État vide */}
          <div className="text-center py-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 via-violet-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border border-violet-200/30">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-12 sm:h-12">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" 
                      fill="url(#gradient1)" stroke="url(#gradient2)" strokeWidth="1"/>
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#9333EA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-transparent bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text mb-2 tracking-wide">
              Aucun Forfait VIP Actif
            </h3>
            <p className="text-gray-600 text-sm sm:text-base font-bold">
              Activez un forfait VIP pour commencer à générer des revenus
            </p>
          </div>
        </div>

        {/* Espace pour la navigation bottom */}
        <div className="h-20"></div>
      </main>
    </div>
  )
}
