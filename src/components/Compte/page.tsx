'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cloud, Plus, Minus, Smartphone, Wallet, ChevronRight, ArrowLeft } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'
import { useAuth } from '@/contexts/AuthContext'
import { getReferralCount } from '@/lib/firebaseAuth'

export default function ComptePage() {
  const { userData } = useAuth()
  const [balance, setBalance] = useState(1000)
  const [funds, setFunds] = useState(1000)
  const [referralRewards, setReferralRewards] = useState(0)
  const [checkInRewards, setCheckInRewards] = useState(0)

  useEffect(() => {
    const loadUserData = async () => {
      if (!userData?.numeroTel) return
      
      const userKey = userData.numeroTel
      const savedBalance = localStorage.getItem(`userBalance_${userKey}`)
      
      if (savedBalance) {
        setBalance(parseInt(savedBalance))
      } else {
        localStorage.setItem(`userBalance_${userKey}`, '1000')
      }

      // Calculer les récompenses de parrainage spécifiques à l'utilisateur
      const storedCode = localStorage.getItem(`userReferralCode_${userKey}`)
      let referralRewards = 0
      
      if (storedCode) {
        try {
          const referralCount = await getReferralCount(storedCode)
          referralRewards = referralCount * 25 // 25 FCFA par parrainage
          setReferralRewards(referralRewards)
        } catch (error) {
          console.log('Erreur calcul récompenses parrainage:', error)
        }
      }

      // Calculer les récompenses de check-in quotidien spécifiques à l'utilisateur
      const rewardHistory = JSON.parse(localStorage.getItem(`rewardHistory_${userKey}`) || '[]')
      const checkInRewardsTotal = rewardHistory.reduce((total: number, reward: any) => total + reward.amount, 0)
      setCheckInRewards(checkInRewardsTotal)

      // Calculer le solde total (1000 XOF de base + récompenses parrainage + récompenses check-in)
      const totalFunds = 1000 + referralRewards + checkInRewardsTotal
      setFunds(totalFunds)
      localStorage.setItem(`userFunds_${userKey}`, totalFunds.toString())

      // Générer un ID utilisateur unique si pas encore fait
      if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9))
      }
    }
    
    loadUserData()
  }, [userData])
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 px-3 sm:px-4 py-3 sm:py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 transform hover:scale-110">
            <ArrowLeft size={20} className="drop-shadow-sm sm:w-6 sm:h-6" />
          </Link>
          <h1 className="text-white text-lg sm:text-xl font-bold tracking-wide drop-shadow-md flex items-center">
            <Wallet className="mr-1 sm:mr-2" size={20} />
            Mes Atouts
          </h1>
          <div className="w-8 sm:w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-3 sm:px-4 py-4 sm:py-6 pb-20">
        {/* Mes atouts */}
        <div className="mx-2 sm:mx-4 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-green-600 via-green-700 to-blue-600 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-green-400/20 to-blue-500/20 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-white text-lg sm:text-xl font-black tracking-wide drop-shadow-lg">Mes atouts</h3>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-2 sm:p-3 rounded-xl shadow-xl border border-white/20 backdrop-blur-sm">
                  <span className="text-yellow-900 text-base sm:text-lg font-black drop-shadow-sm">💎</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-white text-2xl sm:text-4xl font-black mb-1 sm:mb-2 drop-shadow-xl animate-pulse tracking-wide">
                  {funds.toLocaleString('fr-FR')} XOF
                </div>
                <div className="text-green-100 text-xs sm:text-sm font-black drop-shadow-sm">Solde disponible</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-2 sm:px-4 py-3 sm:py-5">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Link href="/recharge">
              <button className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-green-400/30 w-full">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <Plus size={16} className="drop-shadow-sm sm:w-5 sm:h-5" />
                  <span className="drop-shadow-sm">Recharge</span>
                </div>
              </button>
            </Link>
            <Link href="/retrait">
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-blue-400/30 w-full">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <Minus size={16} className="drop-shadow-sm sm:w-5 sm:h-5" />
                  <span className="drop-shadow-sm">Retrait</span>
                </div>
              </button>
            </Link>
            <Link href="/mes-gains">
              <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-purple-400/30 w-full">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <Smartphone size={16} className="drop-shadow-sm sm:w-5 sm:h-5" />
                  <span className="drop-shadow-sm">Appareil</span>
                </div>
              </button>
            </Link>
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-orange-400/30">
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <Wallet size={16} className="drop-shadow-sm sm:w-5 sm:h-5" />
                <span className="drop-shadow-sm">Portefeuille</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-2 sm:mx-4 mb-3 sm:mb-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-2.5 sm:p-3 shadow-lg border border-green-400/30 hover:scale-105 transition-all duration-300">
              <div className="text-center">
                <div className="text-green-100 text-[10px] sm:text-xs font-medium mb-1">Gains aujourd'hui</div>
                <div className="text-white text-sm sm:text-lg font-black drop-shadow-lg">0 XOF</div>
                <div className="text-green-200 text-[10px] sm:text-xs mt-1">📈 +0%</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-2.5 sm:p-3 shadow-lg border border-blue-400/30 hover:scale-105 transition-all duration-300">
              <div className="text-center">
                <div className="text-blue-100 text-[10px] sm:text-xs font-medium mb-1">Gains totaux</div>
                <div className="text-white text-sm sm:text-lg font-black drop-shadow-lg">{(referralRewards + checkInRewards).toLocaleString('fr-FR')} XOF</div>
                <div className="text-blue-200 text-[10px] sm:text-xs mt-1">💰 Parrainage + Check-in</div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-3 mb-6">
          <Link href="/equipe" className="block w-full bg-gradient-to-r from-white via-purple-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50 hover:border-purple-400 group backdrop-blur-sm transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <span className="text-white text-lg font-bold drop-shadow-lg">👥</span>
                </div>
                <span className="text-gray-800 text-base font-black tracking-wide group-hover:text-purple-700 transition-colors duration-300">Liste des Parrainés</span>
              </div>
              <div className="text-gray-400 group-hover:text-purple-500 transition-colors duration-300 transform group-hover:translate-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Link>

          <button className="w-full bg-gradient-to-r from-white via-indigo-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-200/50 hover:border-indigo-400 group backdrop-blur-sm transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <span className="text-white text-lg font-bold drop-shadow-lg">📋</span>
                </div>
                <span className="text-gray-800 text-base font-black tracking-wide group-hover:text-indigo-700 transition-colors duration-300">Mes Reçus</span>
              </div>
              <div className="text-gray-400 group-hover:text-indigo-500 transition-colors duration-300 transform group-hover:translate-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </button>

          <Link href="/register-auth" className="block w-full">
            <button className="w-full bg-gradient-to-r from-white via-red-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200/50 hover:border-red-400 group backdrop-blur-sm transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z"/>
                  </svg>
                </div>
                <span className="text-gray-800 text-base font-black tracking-wide group-hover:text-red-700 transition-colors duration-300">Déconnexion</span>
              </div>
              <div className="text-gray-400 group-hover:text-red-500 transition-colors duration-300 transform group-hover:translate-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            </button>
          </Link>

        </div>
      </div>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">🏠</span>
            </div>
            <span className="text-gray-500 text-xs">Accueil</span>
          </Link>
          <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">📊</span>
            </div>
            <span className="text-gray-500 text-xs">Produits</span>
          </Link>
          <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">👥</span>
            </div>
            <span className="text-gray-500 text-xs">Équipe</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👤</span>
            </div>
            <span className="text-green-600 text-xs font-medium">Mon Compte</span>
          </Link>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
