'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Gift } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface DailyReward {
  day: number
  amount: number
  claimed: boolean
  available: boolean
}

export default function CheckQuotidien() {
  const { userData } = useAuth()
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
  const [balance, setBalance] = useState(1000) // Solde de base
  const [nextCheckIn, setNextCheckIn] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  // Initialiser les données depuis localStorage spécifiques à l'utilisateur
  useEffect(() => {
    if (!userData?.numeroTel) return
    
    const userKey = userData.numeroTel
    setUserId(userKey)
    
    const savedRewards = localStorage.getItem(`dailyRewards_${userKey}`)
    const savedCurrentDay = localStorage.getItem(`currentDay_${userKey}`)
    const savedBalance = localStorage.getItem(`userBalance_${userKey}`)
    const savedNextCheckIn = localStorage.getItem(`nextCheckIn_${userKey}`)

    if (savedRewards) {
      setRewards(JSON.parse(savedRewards))
    }
    if (savedCurrentDay) {
      setCurrentDay(parseInt(savedCurrentDay))
    }
    if (savedBalance) {
      setBalance(parseInt(savedBalance))
    } else {
      // Premier accès - définir le solde de base pour cet utilisateur
      localStorage.setItem(`userBalance_${userKey}`, '1000')
    }
    if (savedNextCheckIn) {
      setNextCheckIn(new Date(savedNextCheckIn))
    }
  }, [userData])

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

  const claimReward = (day: number) => {
    if (!userId) return
    
    const reward = rewards.find(r => r.day === day)
    if (!reward || reward.claimed || !reward.available) return

    // Récupérer la récompense
    const newBalance = balance + reward.amount
    setBalance(newBalance)
    localStorage.setItem(`userBalance_${userId}`, newBalance.toString())

    // Mettre à jour le solde de fonds (Mes atouts)
    const currentFunds = parseInt(localStorage.getItem(`userFunds_${userId}`) || '1000')
    const newFunds = currentFunds + reward.amount
    localStorage.setItem(`userFunds_${userId}`, newFunds.toString())

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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 px-4 py-4 shadow-xl">
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
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Balance Display */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-4 mb-6 text-center shadow-2xl">
          <div className="text-white text-sm font-medium mb-1">Solde Actuel</div>
          <div className="text-white text-2xl font-black">{balance} XOF</div>
        </div>

        {/* Reward Container */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border-4 border-yellow-400 shadow-2xl">
          {/* Title */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl px-6 py-4 mb-6 text-center shadow-xl">
            <h2 className="text-yellow-300 text-2xl font-black tracking-wide">
              RÉCOMPENSE
            </h2>
            <h3 className="text-yellow-300 text-2xl font-black tracking-wide">
              QUOTIDIENNE
            </h3>
          </div>

          {/* Next Check-in Timer */}
          {timeRemaining && (
            <div className="text-center mb-6">
              <div className="text-yellow-300 text-lg font-bold mb-2 flex items-center justify-center">
                <Clock className="mr-2" size={20} />
                Prochain check-in dans:
              </div>
              <div className="text-yellow-400 text-xl font-black">{timeRemaining}</div>
            </div>
          )}

          {/* Rewards Grid - 3 blocs par ligne en rectangles */}
          <div className="space-y-3 mb-4">
            {/* Ligne 1: Jours 1-3 */}
            <div className="grid grid-cols-3 gap-3">
              {rewards.slice(0, 3).map((reward) => (
                <button
                  key={reward.day}
                  onClick={() => claimReward(reward.day)}
                  disabled={!reward.available || reward.claimed}
                  className={`
                    rounded-xl p-4 border-3 transition-all duration-200 transform min-h-[110px] flex flex-col justify-center items-center
                    ${reward.claimed 
                      ? 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 opacity-60' 
                      : reward.available 
                        ? 'bg-gradient-to-br from-red-500 to-red-600 border-yellow-400 hover:scale-105 hover:shadow-xl cursor-pointer shadow-lg' 
                        : 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 opacity-50'
                    }
                  `}
                >
                  <div className="bg-black bg-opacity-20 rounded-lg px-3 py-1 mb-2">
                    <div className="text-yellow-300 text-sm font-bold">
                      Jour {reward.day}
                    </div>
                  </div>
                  <div className="bg-yellow-400 bg-opacity-20 rounded-lg px-3 py-2 mb-1">
                    <div className="text-yellow-100 text-lg font-black">
                      {reward.amount} FCFA
                    </div>
                  </div>
                  {reward.claimed && (
                    <div className="bg-green-500 bg-opacity-30 rounded-full px-2 py-1">
                      <div className="text-green-300 text-xs font-bold">✓ Récupéré</div>
                    </div>
                  )}
                  {!reward.available && !reward.claimed && (
                    <div className="bg-gray-500 bg-opacity-30 rounded-full px-2 py-1">
                      <div className="text-gray-300 text-xs font-bold">🔒 Verrouillé</div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Ligne 2: Jours 4-6 */}
            <div className="grid grid-cols-3 gap-3">
              {rewards.slice(3, 6).map((reward) => (
                <button
                  key={reward.day}
                  onClick={() => claimReward(reward.day)}
                  disabled={!reward.available || reward.claimed}
                  className={`
                    rounded-xl p-4 border-3 transition-all duration-200 transform min-h-[110px] flex flex-col justify-center items-center
                    ${reward.claimed 
                      ? 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 opacity-60' 
                      : reward.available 
                        ? 'bg-gradient-to-br from-red-500 to-red-600 border-yellow-400 hover:scale-105 hover:shadow-xl cursor-pointer shadow-lg' 
                        : 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 opacity-50'
                    }
                  `}
                >
                  <div className="bg-black bg-opacity-20 rounded-lg px-3 py-1 mb-2">
                    <div className="text-yellow-300 text-sm font-bold">
                      Jour {reward.day}
                    </div>
                  </div>
                  <div className="bg-yellow-400 bg-opacity-20 rounded-lg px-3 py-2 mb-1">
                    <div className="text-yellow-100 text-lg font-black">
                      {reward.amount} FCFA
                    </div>
                  </div>
                  {reward.claimed && (
                    <div className="bg-green-500 bg-opacity-30 rounded-full px-2 py-1">
                      <div className="text-green-300 text-xs font-bold">✓ Récupéré</div>
                    </div>
                  )}
                  {!reward.available && !reward.claimed && (
                    <div className="bg-gray-500 bg-opacity-30 rounded-full px-2 py-1">
                      <div className="text-gray-300 text-xs font-bold">🔒 Verrouillé</div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Ligne 3: Jour 7 centré */}
            <div className="flex justify-center">
              <div className="w-1/3">
                {rewards.slice(6, 7).map((reward) => (
                  <button
                    key={reward.day}
                    onClick={() => claimReward(reward.day)}
                    disabled={!reward.available || reward.claimed}
                    className={`
                      w-full rounded-xl p-4 border-3 transition-all duration-200 transform min-h-[110px] flex flex-col justify-center items-center
                      ${reward.claimed 
                        ? 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 opacity-60' 
                        : reward.available 
                          ? 'bg-gradient-to-br from-red-500 to-red-600 border-yellow-400 hover:scale-105 hover:shadow-xl cursor-pointer shadow-lg' 
                          : 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 opacity-50'
                      }
                    `}
                  >
                    <div className="bg-black bg-opacity-20 rounded-lg px-3 py-1 mb-2">
                      <div className="text-yellow-300 text-sm font-bold">
                        Jour {reward.day}
                      </div>
                    </div>
                    <div className="bg-yellow-400 bg-opacity-20 rounded-lg px-3 py-2 mb-1">
                      <div className="text-yellow-100 text-lg font-black">
                        {reward.amount} FCFA
                      </div>
                    </div>
                    {reward.claimed && (
                      <div className="bg-green-500 bg-opacity-30 rounded-full px-2 py-1">
                        <div className="text-green-300 text-xs font-bold">✓ Récupéré</div>
                      </div>
                    )}
                    {!reward.available && !reward.claimed && (
                      <div className="bg-gray-500 bg-opacity-30 rounded-full px-2 py-1">
                        <div className="text-gray-300 text-xs font-bold">🔒 Verrouillé</div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-yellow-300 text-sm font-medium">
              Récupérez votre récompense quotidienne !
            </p>
            <p className="text-yellow-400 text-xs mt-1">
              Revenez chaque jour pour débloquer la prochaine récompense
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
