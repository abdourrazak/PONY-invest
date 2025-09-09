'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Gift } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { addCheckInReward, subscribeToUserBalance } from '@/lib/transactions'

interface DailyReward {
  day: number
  amount: number
  claimed: boolean
  available: boolean
}

export default function CheckQuotidien() {
  const { userData, currentUser } = useAuth()
  const [rewards, setRewards] = useState<DailyReward[]>([
    { day: 1, amount: 75, claimed: false, available: true },
    { day: 2, amount: 100, claimed: false, available: false },
    { day: 3, amount: 25, claimed: false, available: false },
    { day: 4, amount: 40, claimed: false, available: false },
    { day: 5, amount: 120, claimed: false, available: false },
    { day: 6, amount: 30, claimed: false, available: false },
    { day: 7, amount: 150, claimed: false, available: false }
  ])

  const [currentDay, setCurrentDay] = useState(1)
  const [balance, setBalance] = useState(0) // Solde Firestore temps réel
  const [nextCheckIn, setNextCheckIn] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  // Initialiser les données depuis localStorage spécifiques à l'utilisateur
  useEffect(() => {
    if (!userData?.numeroTel || !currentUser) return
    
    const userKey = userData.numeroTel
    setUserId(userKey)
    
    const savedRewards = localStorage.getItem(`dailyRewards_${userKey}`)
    const savedCurrentDay = localStorage.getItem(`currentDay_${userKey}`)
    const savedNextCheckIn = localStorage.getItem(`nextCheckIn_${userKey}`)

    if (savedRewards) {
      setRewards(JSON.parse(savedRewards))
    }
    if (savedCurrentDay) {
      setCurrentDay(parseInt(savedCurrentDay))
    }
    if (savedNextCheckIn) {
      setNextCheckIn(new Date(savedNextCheckIn))
    }
    
    // S'abonner au solde Firestore temps réel
    const unsubscribe = subscribeToUserBalance(currentUser.uid, (newBalance) => {
      setBalance(newBalance)
    })
    
    return () => unsubscribe()
  }, [userData, currentUser])

  // Timer pour le prochain check-in
  useEffect(() => {
    if (!nextCheckIn) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = nextCheckIn.getTime() - now.getTime()

      if (diff <= 0) {
        // Temps écoulé - débloquer le prochain jour
        const newRewards = rewards.map((reward, index) => {
          if (index === currentDay && currentDay < 7) {
            return { ...reward, available: true }
          }
          return reward
        })
        setRewards(newRewards)
        if (userId) {
          localStorage.setItem(`dailyRewards_${userId}`, JSON.stringify(newRewards))
          localStorage.removeItem(`nextCheckIn_${userId}`)
        }
        setNextCheckIn(null)
        setTimeRemaining('')
      } else {
        // Calculer le temps restant
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeRemaining(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [nextCheckIn, rewards, currentDay])

  const claimReward = async (day: number) => {
    if (!userId || !currentUser) return
    
    const reward = rewards.find(r => r.day === day)
    if (!reward || reward.claimed || !reward.available) return

    try {
      // Ajouter la récompense au solde Firestore
      await addCheckInReward(currentUser.uid, reward.amount)
      
      // Le solde sera mis à jour automatiquement via subscribeToUserBalance
      
      // Sauvegarder l'historique des récompenses pour synchronisation future
      const rewardHistory = JSON.parse(localStorage.getItem(`rewardHistory_${userId}`) || '[]')
      rewardHistory.push({
        day,
        amount: reward.amount,
        timestamp: new Date().toISOString(),
        userId: userId
      })
      localStorage.setItem(`rewardHistory_${userId}`, JSON.stringify(rewardHistory))

      // Marquer comme récupérée
      const newRewards = rewards.map(r => 
        r.day === day ? { ...r, claimed: true, available: false } : r
      )

      // Débloquer le prochain jour après 24h
      if (day < 7) {
        const nextDay = new Date()
        nextDay.setHours(nextDay.getHours() + 24)
        setNextCheckIn(nextDay)
        localStorage.setItem(`nextCheckIn_${userId}`, nextDay.toISOString())
        
        setCurrentDay(day + 1)
        localStorage.setItem(`currentDay_${userId}`, (day + 1).toString())
      }

      setRewards(newRewards)
      localStorage.setItem(`dailyRewards_${userId}`, JSON.stringify(newRewards))
    } catch (error) {
      console.error('Erreur lors de la récupération de la récompense:', error)
      alert('Erreur lors de la récupération de la récompense')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 transform hover:scale-110">
              <ArrowLeft size={24} className="drop-shadow-sm" />
            </Link>
            <h1 className="text-white text-xl font-bold tracking-wide drop-shadow-md flex items-center">
              <Gift className="mr-2" size={24} />
              Check-in Quotidien
            </h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Balance Display */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center shadow-xl">
          <div className="text-white/70 text-sm font-medium mb-1">Solde Actuel</div>
          <div className="text-green-400 text-2xl font-black">{balance} XOF</div>
        </div>

        {/* Reward Container */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
          {/* Title */}
          <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 mb-6 text-center shadow-xl">
            <h2 className="text-blue-300 text-2xl font-black tracking-wide">
              RÉCOMPENSE
            </h2>
            <h3 className="text-pink-300 text-2xl font-black tracking-wide">
              QUOTIDIENNE
            </h3>
          </div>

          {/* Next Check-in Timer */}
          {timeRemaining && (
            <div className="text-center mb-6">
              <div className="text-blue-400 text-lg font-bold mb-2 flex items-center justify-center">
                <Clock className="mr-2" size={20} />
                Prochain check-in dans:
              </div>
              <div className="text-white text-xl font-black">{timeRemaining}</div>
            </div>
          )}

          {/* Rewards Grid */}
          <div className="space-y-3">
            {rewards.map((reward) => (
              <button
                key={reward.day}
                onClick={() => claimReward(reward.day)}
                disabled={!reward.available || reward.claimed}
                className={`w-full p-4 rounded-2xl border transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  reward.claimed
                    ? 'bg-green-500/20 border-green-400/30 cursor-not-allowed'
                    : reward.available
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 hover:from-purple-500/30 hover:to-pink-500/30 cursor-pointer shadow-lg hover:shadow-xl'
                    : 'bg-gray-500/20 border-gray-400/30 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                    <div className="text-blue-400 text-lg font-bold">
                      Jour {reward.day}
                    </div>
                  </div>
                  <div className="bg-purple-400/20 backdrop-blur-sm border border-purple-400/30 rounded-lg px-4 py-2">
                    <div className="text-white text-xl font-black">
                      {reward.amount} FCFA
                    </div>
                  </div>
                  {reward.claimed && (
                    <div className="bg-green-500/30 backdrop-blur-sm border border-green-400/30 rounded-full px-3 py-2">
                      <div className="text-green-400 text-sm font-bold">✓ Récupéré</div>
                    </div>
                  )}
                  {reward.available && !reward.claimed && (
                    <div className="bg-purple-500/30 backdrop-blur-sm border border-purple-400/30 rounded-full px-3 py-2">
                      <div className="text-white text-sm font-bold">👆 Récupérer</div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-purple-400 text-sm font-medium">
              Récupérez votre récompense quotidienne !
            </p>
            <p className="text-white/70 text-xs mt-1">
              Revenez chaque jour pour débloquer la prochaine récompense
            </p>
          </div>
        </div>
      </main>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link href="/" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 border border-white/30">
              <span className="text-white text-xs">🏠</span>
            </div>
            <span className="text-white/70 text-xs">Accueil</span>
          </Link>
          <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 border border-white/30">
              <span className="text-white text-xs">📊</span>
            </div>
            <span className="text-white/70 text-xs">Produits</span>
          </Link>
          <Link href="/check-Quotidien" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-1 shadow-lg">
              <span className="text-white text-xs">🎁</span>
            </div>
            <span className="text-purple-400 text-xs font-semibold">Check-in</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 border border-white/30">
              <span className="text-white text-xs">👤</span>
            </div>
            <span className="text-white/70 text-xs">Compte</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
