'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Crown, Clock, TrendingUp, CreditCard, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { calculateUserEarnings } from '@/lib/earningsCalculator'

interface UserGains {
  montantCredite: number
  forfaitsVipActifs: number
  gainsHoraire: number
  revenusQuotidiens: number
  totalDepense: number
  commissionsParrainage: number
  gainsInvestissements: number
  recompensesCheckIn: number
}

export default function MesGains() {
  const router = useRouter()
  const { currentUser, userData } = useAuth()
  const [userGains, setUserGains] = useState<UserGains>({
    montantCredite: 0,
    forfaitsVipActifs: 0,
    gainsHoraire: 0,
    revenusQuotidiens: 0,
    totalDepense: 0,
    commissionsParrainage: 0,
    gainsInvestissements: 0,
    recompensesCheckIn: 0
  })
  const [loading, setLoading] = useState(true)

  // Fonction pour rafraîchir les données depuis Firestore
  const refreshUserGains = async () => {
    if (!currentUser) return

    try {
      // Calculer les gains depuis Firestore
      const earnings = await calculateUserEarnings(currentUser.uid)
      
      // Récupérer les données utilisateur
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      const userData = userDoc.data()
      
      // Compter les investissements actifs
      const rentalsQuery = query(
        collection(db, 'rentals'),
        where('userId', '==', currentUser.uid)
      )
      const rentalsSnapshot = await getDocs(rentalsQuery)
      const forfaitsVipActifs = rentalsSnapshot.size
      
      // Calculer gains horaire (estimé)
      let gainsHoraire = 0
      rentalsSnapshot.forEach((doc) => {
        const data = doc.data()
        gainsHoraire += (data.dailyRevenue || 0) * (data.quantity || 1) / 24
      })

      setUserGains({
        montantCredite: userData?.balance || 0,
        forfaitsVipActifs,
        gainsHoraire: Math.round(gainsHoraire),
        revenusQuotidiens: earnings.todayEarnings,
        totalDepense: userData?.totalInvested || 0,
        commissionsParrainage: earnings.breakdown.referralCommissions,
        gainsInvestissements: earnings.breakdown.productRevenue,
        recompensesCheckIn: earnings.breakdown.checkInRewards
      })

      console.log('🔄 Gains rafraîchis depuis Firestore:', earnings)
    } catch (error) {
      console.error('Erreur rafraîchissement gains:', error)
    }
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
      if (!currentUser) return

      try {
        // Charger les données depuis Firestore
        await refreshUserGains()
        console.log('Gains utilisateur chargés depuis Firestore')
      } catch (error) {
        console.error('Erreur lors du chargement des gains:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserGains()
  }, [currentUser])

  const formatCurrency = (amount: number) => {
    return `XOF${amount.toFixed(2).replace('.', ',')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" style={{ 
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      position: 'relative',
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'none'
    }}>
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 text-white/90 hover:bg-white/10 rounded-full transition-all duration-200 transform hover:scale-110"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center flex-1">
            <span className="text-white/90 text-lg sm:text-xl font-black tracking-wide">Mes Gains</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="px-3 sm:px-4 py-3 sm:py-4" style={{ touchAction: 'pan-y' }}>
        {/* Montant Crédité */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 mb-4 hover:bg-black/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-white/90 text-sm font-black tracking-wide">Montant Crédité</span>
              <Info size={16} className="text-green-400 ml-2" />
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <CreditCard size={18} className="text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-green-400">
            {loading ? 'Chargement...' : formatCurrency(userGains.montantCredite)}
          </div>
        </div>

        {/* Grille des statistiques */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          {/* Forfaits VIP Actifs */}
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-black/25 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/90 text-xs sm:text-sm font-black tracking-wide">Forfaits VIP Actifs</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Crown size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-400">
              {loading ? '...' : userGains.forfaitsVipActifs}
            </div>
          </div>

          {/* Gains Horaire */}
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-black/25 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/90 text-xs sm:text-sm font-black tracking-wide">Gains Horaire</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <Clock size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-green-400">
              {loading ? '...' : formatCurrency(userGains.gainsHoraire)}
            </div>
          </div>

          {/* Revenus Quotidiens */}
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-black/25 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/90 text-xs sm:text-sm font-black tracking-wide">Revenus Quotidiens</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                <TrendingUp size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-400">
              {loading ? '...' : formatCurrency(userGains.revenusQuotidiens)}
            </div>
          </div>

          {/* Total Dépensé */}
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-black/25 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/90 text-xs sm:text-sm font-black tracking-wide">Total Dépensé</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                <CreditCard size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-400">
              {loading ? '...' : formatCurrency(userGains.totalDepense)}
            </div>
          </div>
        </div>

        {/* Section Forfaits et Revenus */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 mb-4">
          <h2 className="text-center text-lg sm:text-xl font-black text-white/90 mb-6 tracking-wide">
            Mes Forfaits Et Revenus Actifs
          </h2>
          
          {/* État vide */}
          <div className="text-center py-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-12 sm:h-12">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" 
                      fill="#8B5CF6" stroke="#A855F7" strokeWidth="1"/>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white/90 mb-2 tracking-wide">
              Aucun Forfait VIP Actif
            </h3>
            <p className="text-white/70 text-sm sm:text-base font-bold">
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
