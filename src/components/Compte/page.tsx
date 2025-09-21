'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Minus, Smartphone, Wallet, ArrowLeft, TrendingUp, Users, FileText, Shield, LogOut, Bell, Home, BarChart3, UserCheck, User, CreditCard } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'
import { useAuth } from '@/contexts/AuthContext'
import { getReferralCount } from '@/lib/firebaseAuth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { subscribeToUserBalance } from '@/lib/transactions'

export default function ComptePage() {
  const { userData, currentUser } = useAuth()
  const [balance, setBalance] = useState(0)
  const [funds, setFunds] = useState(0)
  const [referralRewards, setReferralRewards] = useState(0)
  const [checkInRewards, setCheckInRewards] = useState(0)
  const [hasInvested, setHasInvested] = useState(false)

  // Synchroniser le solde en temps réel
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserBalance(currentUser.uid, (newBalance) => {
        setBalance(newBalance)
        setFunds(newBalance) // Le solde Atout = solde principal
      })
      return unsubscribe
    }
  }, [currentUser])

  useEffect(() => {
    const loadUserData = async () => {
      if (!userData?.numeroTel || !userData?.uid) return
      
      const userKey = userData.numeroTel
      
      // Vérifier si l'utilisateur a investi
      try {
        const userDoc = await getDoc(doc(db, 'users', userData.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          const invested = data.hasInvested || false
          setHasInvested(invested)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification d\'investissement:', error)
      }

      // Calculer les récompenses de parrainage UNIQUEMENT pour les investisseurs
      const storedCode = localStorage.getItem(`userReferralCode_${userKey}`)
      let referralRewards = 0
      
      if (storedCode && hasInvested) {
        try {
          const referralCount = await getReferralCount(storedCode)
          referralRewards = referralCount * 25 // 25 FCFA par parrainage
          setReferralRewards(referralRewards)
        } catch (error) {
          console.log('Erreur calcul récompenses parrainage:', error)
        }
      } else {
        setReferralRewards(0) // Pas de récompenses pour les non-investisseurs
      }

      // Calculer les récompenses de check-in quotidien spécifiques à l'utilisateur
      const rewardHistory = JSON.parse(localStorage.getItem(`rewardHistory_${userKey}`) || '[]')
      const checkInRewardsTotal = rewardHistory.reduce((total: number, reward: any) => total + reward.amount, 0)
      setCheckInRewards(checkInRewardsTotal)

      // Le solde principal (Atout) est maintenant synchronisé via useEffect
      // Les fonds sont mis à jour automatiquement avec le solde

      // Générer un ID utilisateur unique si pas encore fait
      if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9))
      }
    }
    
    loadUserData()
  }, [userData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-xl border-2 border-white/20 flex items-center justify-center">
                <span className="text-white text-lg">👤</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">{userData?.numeroTel || 'Utilisateur'}</h1>
                <p className="text-white/60 text-xs">Mon Compte</p>
              </div>
            </div>
            <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
              <Bell size={18} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Mes atouts</h3>
            </div>
            <div className="text-center">
              <div className="text-white text-4xl font-bold mb-2">
                {funds.toLocaleString('fr-FR')} XOF
              </div>
              <div className="text-white/70 text-sm">Solde disponible</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/recharge">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl w-full">
              <div className="flex items-center justify-center space-x-2">
                <Plus size={18} />
                <span>Recharge</span>
              </div>
            </button>
          </Link>
          <Link href="/retrait">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl w-full">
              <div className="flex items-center justify-center space-x-2">
                <Minus size={18} />
                <span>Retrait</span>
              </div>
            </button>
          </Link>
          <Link href="/mes-gains">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl w-full">
              <div className="flex items-center justify-center space-x-2">
                <Smartphone size={18} />
                <span>Appareil</span>
              </div>
            </button>
          </Link>
          <Link href="/portefeuille">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl w-full">
              <div className="flex items-center justify-center space-x-2">
                <CreditCard size={18} />
                <span>Portefeuille</span>
              </div>
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
            <div className="text-center">
              <div className="text-white/70 text-xs mb-1">Gains aujourd'hui</div>
              <div className="text-green-400 text-lg font-bold">0 XOF</div>
              <div className="text-white/60 text-xs mt-1">📈 +0%</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
            <div className="text-center">
              <div className="text-white/70 text-xs mb-1">Gains totaux</div>
              <div className="text-yellow-400 text-lg font-bold">{(referralRewards + checkInRewards).toLocaleString('fr-FR')} XOF</div>
              <div className="text-white/60 text-xs mt-1">
                {hasInvested ? '💰 Parrainage + Check-in' : '💰 Check-in uniquement'}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-4">
          <Link href="/equipe" className="block w-full">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <Users size={20} className="text-white" />
                  </div>
                  <span className="text-white text-base font-medium">Liste des Parrainés</span>
                </div>
                <div className="text-white/60">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/mes-recus" className="block w-full">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <FileText size={20} className="text-white" />
                  </div>
                  <span className="text-white text-base font-medium">Mes Reçus</span>
                </div>
                <div className="text-white/60">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/centre-membre" className="block w-full">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <Shield size={20} className="text-white" />
                  </div>
                  <span className="text-white text-base font-medium">Centre membre</span>
                </div>
                <div className="text-white/60">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/register-auth" className="block w-full">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <LogOut size={20} className="text-white" />
                  </div>
                  <span className="text-white text-base font-medium">Déconnexion</span>
                </div>
                <div className="text-white/60">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/20 px-4 py-2">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 border border-white/30">
              <Home size={16} className="text-white" />
            </div>
            <span className="text-white/70 text-xs">Accueil</span>
          </Link>
          <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 border border-white/30">
              <BarChart3 size={16} className="text-white" />
            </div>
            <span className="text-white/70 text-xs">Produits</span>
          </Link>
          <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 border border-white/30">
              <UserCheck size={16} className="text-white" />
            </div>
            <span className="text-white/70 text-xs">Équipe</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-1 shadow-lg">
              <User size={16} className="text-white" />
            </div>
            <span className="text-purple-400 text-xs font-semibold">Mon Compte</span>
          </Link>
        </div>
      </div>

      <SupportFloat />
    </div>
  )
}
