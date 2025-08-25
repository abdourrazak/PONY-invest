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

  useEffect(() => {
    const fetchUserGains = async () => {
      if (!currentUser && !userData) return

      try {
        const userId = currentUser?.uid || userData?.uid
        if (userId) {
          const userDoc = await getDoc(doc(db, 'users', userId))
          if (userDoc.exists()) {
            const userDocData = userDoc.data()
            setUserGains({
              montantCredite: userDocData.montantCredite || 0,
              forfaitsVipActifs: userDocData.forfaitsVipActifs || 0,
              gainsHoraire: userDocData.gainsHoraire || 0,
              revenusQuotidiens: userDocData.revenusQuotidiens || 0,
              totalDepense: userDocData.totalDepense || 0
            })
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des gains:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserGains()
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
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-3 sm:px-4 py-3 sm:py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 transform hover:scale-110"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center flex-1">
            <span className="text-white text-lg sm:text-xl font-bold tracking-wide drop-shadow-md">Mes Gains</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="px-3 sm:px-4 py-3 sm:py-4" style={{ touchAction: 'pan-y' }}>
        {/* Montant Crédité */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-gray-600 text-sm font-medium">Montant Crédité</span>
              <Info size={16} className="text-gray-400 ml-2" />
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <CreditCard size={16} className="text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {loading ? 'Chargement...' : formatCurrency(userGains.montantCredite)}
          </div>
        </div>

        {/* Grille des statistiques */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Forfaits VIP Actifs */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Forfaits VIP Actifs</span>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Crown size={16} className="text-blue-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700">
              {loading ? '...' : userGains.forfaitsVipActifs}
            </div>
          </div>

          {/* Gains Horaire */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Gains Horaire</span>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock size={16} className="text-green-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700">
              {loading ? '...' : formatCurrency(userGains.gainsHoraire)}
            </div>
          </div>

          {/* Revenus Quotidiens */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Revenus Quotidiens</span>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-purple-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700">
              {loading ? '...' : formatCurrency(userGains.revenusQuotidiens)}
            </div>
          </div>

          {/* Total Dépensé */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Dépensé</span>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <CreditCard size={16} className="text-red-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700">
              {loading ? '...' : formatCurrency(userGains.totalDepense)}
            </div>
          </div>
        </div>

        {/* Section Forfaits et Revenus */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-200">
          <h2 className="text-center text-lg font-bold text-gray-800 mb-6">
            Mes Forfaits Et Revenus Actifs
          </h2>
          
          {/* État vide */}
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" 
                      fill="#9CA3AF" stroke="#9CA3AF" strokeWidth="1"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              Aucun Forfait VIP Actif
            </h3>
            <p className="text-gray-500 text-sm">
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
