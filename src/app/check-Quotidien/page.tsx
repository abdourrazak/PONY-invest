'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Gift, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { addCheckInReward, subscribeToUserBalance } from '@/lib/transactions'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface DailyReward {
  day: number
  amount: number
  claimed: boolean
  available: boolean
}

export default function CheckQuotidien() {
  const { userData, currentUser } = useAuth()
  const router = useRouter()
  const [rewards, setRewards] = useState<DailyReward[]>([
    { day: 1, amount: 0.15, claimed: false, available: true },
    { day: 2, amount: 0.20, claimed: false, available: false },
    { day: 3, amount: 0.05, claimed: false, available: false },
    { day: 4, amount: 0.10, claimed: false, available: false },
    { day: 5, amount: 0.20, claimed: false, available: false },
    { day: 6, amount: 0.10, claimed: false, available: false },
    { day: 7, amount: 0.20, claimed: false, available: false }
  ])

  const [currentDay, setCurrentDay] = useState(1)
  const [checkInBalance, setCheckInBalance] = useState(0) // Solde Check-in indépendant (max $1)
  const [hasInvested, setHasInvested] = useState(false) // Vérifier si l'utilisateur a investi
  const [isLoading, setIsLoading] = useState(true)
  const [nextCheckIn, setNextCheckIn] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  // Vérifier l'accès et initialiser les données
  useEffect(() => {
    const checkAccessAndInitialize = async () => {
      if (!userData?.numeroTel || !currentUser) return

      try {
        // Vérifier si l'utilisateur a investi
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          const invested = data.hasInvested || false
          setHasInvested(invested)

          if (!invested) {
            setIsLoading(false)
            return // Arrêter ici si l'utilisateur n'a pas investi
          }
        }

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

        // Calculer le solde Check-in indépendant depuis localStorage
        const rewardHistory = JSON.parse(localStorage.getItem(`rewardHistory_${userKey}`) || '[]')
        const checkInTotal = rewardHistory.reduce((total: number, reward: any) => total + reward.amount, 0)
        setCheckInBalance(checkInTotal)

        setIsLoading(false)
      } catch (error) {
        console.error('Erreur lors de la vérification d\'accès:', error)
        setIsLoading(false)
      }
    }

    checkAccessAndInitialize()
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
    if (!userId || !currentUser || !hasInvested) return

    const reward = rewards.find(r => r.day === day)
    if (!reward || reward.claimed || !reward.available) return

    try {
      // Ajouter immédiatement au solde retirable Firestore
      await addCheckInReward(currentUser.uid, reward.amount)

      // Sauvegarder l'historique des récompenses Check-in indépendant
      const rewardHistory = JSON.parse(localStorage.getItem(`rewardHistory_${userId}`) || '[]')
      rewardHistory.push({
        day,
        amount: reward.amount,
        timestamp: new Date().toISOString(),
        userId: userId
      })
      localStorage.setItem(`rewardHistory_${userId}`, JSON.stringify(rewardHistory))

      // Mettre à jour le solde Check-in indépendant (pour affichage local)
      const newCheckInBalance = checkInBalance + reward.amount
      setCheckInBalance(newCheckInBalance)

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

      // Vérifier si toutes les récompenses ont été récupérées ($1 total)
      if (newCheckInBalance >= 1) {
        try {
          // Migrer le solde Check-in vers le solde principal
          await addCheckInReward(currentUser.uid, newCheckInBalance)

          // Réinitialiser le solde Check-in et l'historique
          localStorage.removeItem(`rewardHistory_${userId}`)
          localStorage.removeItem(`dailyRewards_${userId}`)
          localStorage.removeItem(`currentDay_${userId}`)
          localStorage.removeItem(`nextCheckIn_${userId}`)

          alert('Félicitations ! Toutes les récompenses quotidiennes ont été transférées vers votre solde principal (Atout).')

          // Rediriger vers la page compte
          router.push('/compte')
        } catch (error) {
          console.error('Erreur lors de la migration:', error)
          alert('Erreur lors du transfert vers le solde principal')
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la récompense:', error)
      alert('Erreur lors de la récupération de la récompense')
    }
  }

  // Affichage de restriction d'accès pour les non-investisseurs
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Vérification de l'accès...</p>
        </div>
      </div>
    )
  }

  if (!hasInvested) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
        <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 transform hover:scale-110">
                <ArrowLeft size={24} className="drop-shadow-sm" />
              </Link>
              <h1 className="text-white text-xl font-bold tracking-wide drop-shadow-md flex items-center">
                <Lock className="mr-2" size={24} />
                Accès Restreint
              </h1>
              <div className="w-10"></div>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center shadow-xl">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={40} className="text-red-400" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-4">Accès Restreint</h2>
            <p className="text-white/70 text-base mb-6 leading-relaxed">
              Le Check-in Quotidien est réservé aux utilisateurs qui ont effectué un investissement.
            </p>
            <Link href="/produits">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
                Voir les Investissements
              </button>
            </Link>
          </div>
        </main>
      </div>
    )
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
        {/* Check-in Balance Display - Indépendant */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center shadow-xl">
          <div className="text-white/70 text-sm font-medium mb-1">Solde Check-in Quotidien</div>
          <div className="text-purple-400 text-2xl font-black">{checkInBalance} $</div>
          <div className="text-white/60 text-xs mt-1">Maximum: $1</div>
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
                className={`w-full p-4 rounded-2xl border transition-all duration-300 transform hover:scale-105 active:scale-95 ${reward.claimed
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
                      {reward.amount} $
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
