'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Gift, Users, Clock, Share2, ArrowLeft, RotateCcw } from 'lucide-react'
import Link from 'next/link'

export default function Cadeau() {
  const { currentUser, userData } = useAuth()
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<number | null>(null)
  const [canSpin, setCanSpin] = useState(true)
  const [timeLeft, setTimeLeft] = useState('')
  const [totalBonus, setTotalBonus] = useState(0)
  const [invitedFriends, setInvitedFriends] = useState(0)
  const [eventTimeLeft, setEventTimeLeft] = useState('2d 00:00:00')

  // Charger les données utilisateur et vérifier les nouveaux filleuls
  useEffect(() => {
    if (!userData?.numeroTel || !userData?.referralCode) return

    const userKey = userData.numeroTel
    const savedBonus = localStorage.getItem(`spinBonus_${userKey}`)
    const savedFriends = localStorage.getItem(`invitedFriends_${userKey}`)
    const lastSpin = localStorage.getItem(`lastSpin_${userKey}`)

    if (savedBonus) setTotalBonus(parseInt(savedBonus))
    if (savedFriends) setInvitedFriends(parseInt(savedFriends))

    // Vérifier les nouveaux filleuls depuis Firebase
    checkForNewReferrals()

    // Vérifier si l'utilisateur peut tourner
    if (lastSpin) {
      const lastSpinTime = parseInt(lastSpin)
      const now = Date.now()
      const timeDiff = now - lastSpinTime
      const cooldown = 24 * 60 * 60 * 1000 // 24h en millisecondes

      if (timeDiff < cooldown) {
        setCanSpin(false)
        updateTimeLeft(cooldown - timeDiff)
      }
    }
  }, [userData])

  // Vérifier s'il y a de nouveaux filleuls
  const checkForNewReferrals = async () => {
    if (!userData?.referralCode || !userData?.numeroTel) return

    try {
      // Importer la fonction getReferrals
      const { getReferrals } = await import('@/lib/firebaseAuth')
      const referrals = await getReferrals(userData.referralCode)
      const currentReferralCount = referrals.length

      const userKey = userData.numeroTel
      const savedCount = localStorage.getItem(`referralCount_${userKey}`)
      const lastKnownCount = savedCount ? parseInt(savedCount) : 0

      // Si il y a de nouveaux filleuls, débloquer des tours
      if (currentReferralCount > lastKnownCount) {
        const newReferrals = currentReferralCount - lastKnownCount
        
        // Mettre à jour le compteur d'amis invités
        setInvitedFriends(currentReferralCount)
        localStorage.setItem(`invitedFriends_${userKey}`, currentReferralCount.toString())
        localStorage.setItem(`referralCount_${userKey}`, currentReferralCount.toString())

        // Débloquer un tour pour chaque nouvel ami (jusqu'à 60 max)
        if (currentReferralCount <= 60) {
          setCanSpin(true)
          setTimeLeft('')
          localStorage.removeItem(`lastSpin_${userKey}`)
        }
      }
    } catch (error) {
      console.error('Erreur vérification filleuls:', error)
    }
  }

  // Mettre à jour le compte à rebours
  const updateTimeLeft = (timeRemaining: number) => {
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)
    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)

    if (timeRemaining > 0) {
      setTimeout(() => updateTimeLeft(timeRemaining - 1000), 1000)
    } else {
      setCanSpin(true)
      setTimeLeft('')
    }
  }

  // Fonction de spin
  const handleSpin = () => {
    if (!canSpin || spinning || !userData?.numeroTel) return

    setSpinning(true)
    
    // Animation de 3 secondes
    setTimeout(() => {
      const userKey = userData.numeroTel
      
      // Calculer le bonus basé sur le nombre d'amis invités (max 60 amis = 5000 XAF)
      // Chaque ami donne environ 83.33 XAF (5000/60)
      const bonusPerFriend = Math.floor(5000 / 60) // ~83 XAF par ami
      const randomBonus = Math.floor(Math.random() * 20) - 10 // Variation de ±10 XAF
      const calculatedBonus = Math.min(bonusPerFriend + randomBonus, 5000 - totalBonus)
      
      // S'assurer que le bonus est au moins de 50 XAF et au max ce qui reste pour atteindre 5000
      const bonus = Math.max(50, calculatedBonus)
      const newTotal = Math.min(totalBonus + bonus, 5000)
      
      setSpinResult(bonus)
      setTotalBonus(newTotal)
      setSpinning(false)
      setCanSpin(false)

      // Sauvegarder les données
      localStorage.setItem(`spinBonus_${userKey}`, newTotal.toString())
      localStorage.setItem(`lastSpin_${userKey}`, Date.now().toString())

      // Démarrer le cooldown de 24h seulement si l'utilisateur n'a pas assez d'amis
      if (invitedFriends < 60) {
        updateTimeLeft(24 * 60 * 60 * 1000)
      }
    }, 3000)
  }

  // Fonction d'invitation d'amis
  const handleInviteFriends = () => {
    if (!userData?.referralCode) return

    const referralLink = `https://axml-global.vercel.app/register-auth?ref=${userData.referralCode}`
    
    if (navigator.share) {
      navigator.share({
        title: '🎁 Rejoignez-moi sur AXML Global !',
        text: 'Gagnez des bonus en jouant à la roue de la fortune !',
        url: referralLink
      })
    } else {
      navigator.clipboard.writeText(referralLink)
      alert('Lien copié ! Partagez-le avec vos amis pour obtenir des tours supplémentaires.')
    }
  }

  // Fonction pour forcer la vérification des nouveaux filleuls
  const forceCheckReferrals = async () => {
    await checkForNewReferrals()
  }

  // Calculer le progrès vers 5000 XAF
  const progressPercentage = Math.min((totalBonus / 5000) * 100, 100)
  const remainingAmount = Math.max(5000 - totalBonus, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20">
        <Link href="/" className="flex items-center text-white hover:text-purple-300">
          <ArrowLeft size={24} className="mr-2" />
          <span>Retour</span>
        </Link>
        <h1 className="text-xl font-bold">🎁 Spin Bonus</h1>
        <div className="text-sm">
          <Clock size={16} className="inline mr-1" />
          {eventTimeLeft}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Objectif et Progrès */}
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-yellow-300">🎯 Défi des 5000 XAF</h2>
            <div className="text-right">
              <div className="text-2xl font-black text-yellow-300">{totalBonus.toLocaleString()} XAF</div>
              <div className="text-sm text-yellow-400">/ 5000 XAF</div>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-yellow-200">
            {remainingAmount > 0 ? (
              <>Il vous reste <span className="font-bold">{remainingAmount.toLocaleString()} XAF</span> à gagner !</>
            ) : (
              <span className="text-green-300 font-bold">🎉 Objectif atteint ! Vous pouvez retirer vos gains.</span>
            )}
          </div>
        </div>

        {/* Roue de la Fortune */}
        <div className="bg-black/30 rounded-xl p-6 text-center">
          <div className="relative mx-auto w-64 h-64 mb-6">
            {/* Roue */}
            <div className={`w-full h-full rounded-full border-8 border-yellow-400 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 relative overflow-hidden ${
              spinning ? 'animate-spin' : ''
            }`} style={{ animationDuration: spinning ? '3s' : '0s' }}>
              {/* Segments de la roue */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xl">
                  {spinning ? '?' : '1'}
                </div>
              </div>
              
              {/* Indicateurs sur la roue */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">SACAR</div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">100</div>
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white font-bold text-sm">25K</div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white font-bold text-sm">100</div>
            </div>
            
            {/* Flèche */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-yellow-400"></div>
          </div>

          {/* Résultat du spin */}
          {spinResult && (
            <div className="mb-4 p-4 bg-green-600/20 rounded-lg border border-green-500/30">
              <div className="text-green-300 font-bold text-lg">
                🎉 Vous avez gagné {spinResult.toLocaleString()} XAF !
              </div>
            </div>
          )}

          {/* Bouton Spin */}
          <button
            onClick={handleSpin}
            disabled={!canSpin || spinning}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              canSpin && !spinning
                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 transform hover:scale-105'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
          >
            {spinning ? (
              <div className="flex items-center justify-center">
                <RotateCcw className="animate-spin mr-2" size={20} />
                Tournage en cours...
              </div>
            ) : canSpin ? (
              '🎰 TOURNER LA ROUE'
            ) : (
              `⏰ Prochain tour dans ${timeLeft}`
            )}
          </button>
        </div>

        {/* Section Invitations */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-300">👥 Invitez vos amis</h3>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-300">{invitedFriends}</div>
              <div className="text-sm text-blue-400">amis invités</div>
            </div>
          </div>
          
          <p className="text-sm text-blue-200 mb-4">
            Chaque ami invité vous donne un tour supplémentaire gratuit !
            <br />
            <span className="text-yellow-300 font-bold">Il faut 60 amis pour atteindre 5000 XAF.</span>
          </p>
          
          <div className="space-y-2">
            <button
              onClick={handleInviteFriends}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <Share2 className="inline mr-2" size={18} />
              Partager mon lien d'invitation
            </button>
            
            <button
              onClick={forceCheckReferrals}
              className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all text-sm"
            >
              🔄 Vérifier nouveaux amis
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
