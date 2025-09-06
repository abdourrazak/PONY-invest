'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Minus, Smartphone, Wallet, ArrowLeft, TrendingUp, Users, FileText, Shield, LogOut } from 'lucide-react'
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
      
      // Utiliser le solde Firestore comme source de vérité
      const firestoreBalance = userData.balance || 1000
      setBalance(firestoreBalance)

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

      // Le solde affiché = seulement le solde Firestore (cohérent avec toutes les pages)
      setFunds(firestoreBalance)

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
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 px-4 py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-white tracking-wide">Mon Compte</h1>
            <p className="text-green-100 text-sm font-medium">{userData?.numeroTel || 'Utilisateur'}</p>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="px-4 py-6 pb-20">
        {/* Balance Card */}
        <div className="mx-2 mb-6">
          <div className="bg-gradient-to-br from-green-600 via-green-700 to-blue-600 rounded-2xl p-5 shadow-2xl border border-white/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-xl font-black tracking-wide">Mes atouts</h3>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-xl shadow-xl border border-white/20 backdrop-blur-sm">
                  <span className="text-yellow-900 text-lg font-black">💎</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-white text-4xl font-black mb-2 tracking-wide">
                  {funds.toLocaleString('fr-FR')} XOF
                </div>
                <div className="text-green-100 text-sm font-black">Solde disponible</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-2 py-5">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/recharge">
              <button className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-bold shadow-xl hover:from-green-600 hover:to-green-700 transition-colors duration-300 border border-green-400/30 w-full">
                <div className="flex items-center justify-center space-x-2">
                  <Plus size={18} />
                  <span>Recharge</span>
                </div>
              </button>
            </Link>
            <Link href="/retrait">
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-bold shadow-xl hover:from-blue-600 hover:to-blue-700 transition-colors duration-300 border border-blue-400/30 w-full">
                <div className="flex items-center justify-center space-x-2">
                  <Minus size={18} />
                  <span>Retrait</span>
                </div>
              </button>
            </Link>
            <Link href="/mes-gains">
              <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-xl font-bold shadow-xl hover:from-purple-600 hover:to-purple-700 transition-colors duration-300 border border-purple-400/30 w-full">
                <div className="flex items-center justify-center space-x-2">
                  <Smartphone size={18} />
                  <span>Appareil</span>
                </div>
              </button>
            </Link>
            <Link href="/portefeuille">
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition-colors shadow-lg">
                💼 Portefeuille
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-2 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 shadow-lg border border-green-400/30 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="text-green-100 text-xs font-medium mb-1">Gains aujourd'hui</div>
                <div className="text-white text-lg font-black">0 XOF</div>
                <div className="text-green-200 text-xs mt-1">📈 +0%</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 shadow-lg border border-blue-400/30 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="text-blue-100 text-xs font-medium mb-1">Gains totaux</div>
                <div className="text-white text-lg font-black">{(referralRewards + checkInRewards).toLocaleString('fr-FR')} XOF</div>
                <div className="text-blue-200 text-xs mt-1">💰 Parrainage + Check-in</div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-3 mb-6">
          <Link href="/equipe" className="block w-full bg-gradient-to-r from-white via-purple-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-purple-200/50 hover:border-purple-400 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Users size={20} className="text-white" />
                </div>
                <span className="text-gray-800 text-base font-black tracking-wide">Liste des Parrainés</span>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Link>

          <button className="w-full bg-gradient-to-r from-white via-indigo-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-indigo-200/50 hover:border-indigo-400 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <FileText size={20} className="text-white" />
                </div>
                <span className="text-gray-800 text-base font-black tracking-wide">Mes Reçus</span>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </button>

          <Link href="/centre-membre" className="block w-full">
            <button className="w-full bg-gradient-to-r from-emerald-50/40 via-green-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-emerald-200/50 hover:border-emerald-400 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Shield size={20} className="text-white" />
                </div>
                <span className="text-gray-800 text-base font-black tracking-wide">Centre membre</span>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            </button>
          </Link>

          <Link href="/register-auth" className="block w-full">
            <button className="w-full bg-gradient-to-r from-white via-red-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-red-200/50 hover:border-red-400 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <LogOut size={20} className="text-white" />
                </div>
                <span className="text-gray-800 text-base font-black tracking-wide">Déconnexion</span>
              </div>
              <div className="text-gray-400">
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
          <Link href="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">🏠</span>
            </div>
            <span className="text-gray-500 text-xs">Accueil</span>
          </Link>
          <Link href="/produits" className="flex flex-col items-center hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">📊</span>
            </div>
            <span className="text-gray-500 text-xs">Produits</span>
          </Link>
          <Link href="/equipe" className="flex flex-col items-center hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">👥</span>
            </div>
            <span className="text-gray-500 text-xs">Équipe</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👤</span>
            </div>
            <span className="text-green-600 text-xs font-medium">Mon Compte</span>
          </Link>
        </div>
      </div>

      <SupportFloat />
    </div>
  )
}
