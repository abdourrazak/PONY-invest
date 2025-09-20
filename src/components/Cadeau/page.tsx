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
    const savedFriends = localStorage.getItem(`validReferralCount_${userKey}`)
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

  // Vérifier s'il y a de nouveaux filleuls qui ont fait un dépôt
  const checkForNewReferrals = async () => {
    if (!userData?.referralCode || !userData?.numeroTel) return

    try {
      // Importer la fonction getReferrals
      const { getReferrals } = await import('@/lib/firebaseAuth')
      const referrals = await getReferrals(userData.referralCode)
      
      // Compter seulement les filleuls qui ont fait un dépôt de 500 XAF
      let validReferrals = 0
      referrals.forEach(referral => {
        const referralDeposit = localStorage.getItem(`userDeposits_${referral.numeroTel}`)
        const totalDeposited = referralDeposit ? parseInt(referralDeposit) : 0
        if (totalDeposited >= 500) {
          validReferrals++
        }
      })

      const userKey = userData.numeroTel
      const savedCount = localStorage.getItem(`validReferralCount_${userKey}`)
      const lastKnownCount = savedCount ? parseInt(savedCount) : 0

      // Si il y a de nouveaux filleuls valides, débloquer des tours
      if (validReferrals > lastKnownCount) {
        const newValidReferrals = validReferrals - lastKnownCount
        
        // Mettre à jour le compteur d'amis invités (seulement ceux qui ont déposé)
        setInvitedFriends(validReferrals)
        localStorage.setItem(`invitedFriends_${userKey}`, validReferrals.toString())
        localStorage.setItem(`validReferralCount_${userKey}`, validReferrals.toString())

        // Débloquer un tour pour chaque nouvel ami valide (jusqu'à 60 max)
        if (validReferrals <= 60) {
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
      
      // Premier tour : montant de base élevé, puis progression très lente
      let bonus
      
      if (totalBonus === 0) {
        // Premier tour : montant de base entre 4850-4940 XAF
        bonus = Math.floor(Math.random() * 91) + 4850 // 4850-4940 XAF
      } else if (invitedFriends > 0 && totalBonus < 4850 + (invitedFriends * 6)) {
        // Bonus de parrainage (quand un nouvel ami a fait un dépôt)
        bonus = Math.floor(Math.random() * 6) + 1 // 1-6 XAF
      } else {
        // Bonus quotidien normal (extrêmement faible)
        bonus = Math.floor(Math.random() * 5) + 1 // 1-5 XAF
      }
      
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-white hover:text-purple-300 transition-all duration-200 transform hover:scale-105">
              <ArrowLeft size={24} className="mr-2" />
              <span className="font-medium">Retour</span>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 rounded-full shadow-xl border-2 border-white/20 flex items-center justify-center relative animate-pulse">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 opacity-95 animate-spin" style={{animationDuration: '10s'}}></div>
                <div className="relative z-10 text-white text-xl">🎁</div>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">CADEAU</h1>
                <p className="text-white/60 text-xs">Roue de la fortune</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
              <div className="text-xs text-white/90 flex items-center">
                <Clock size={14} className="mr-1" />
                {eventTimeLeft}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Objectif et Progrès */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white/90 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">🎯 Défi des 5000 XAF</h2>
            <div className="text-right">
              <div className="text-2xl font-black text-yellow-400">{totalBonus.toLocaleString()} XAF</div>
              <div className="text-sm text-white/70">/ 5000 XAF</div>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-black/30 backdrop-blur-sm rounded-full h-4 mb-3 border border-white/10">
            <div 
              className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-white/90 font-medium">
            {remainingAmount > 0 ? (
              <>Il vous reste <span className="font-black text-yellow-400">{remainingAmount.toLocaleString()} XAF</span> à gagner !</>
            ) : (
              <span className="text-green-400 font-black">🎉 Objectif atteint ! Vous pouvez retirer vos gains.</span>
            )}
          </div>
        </div>

        {/* Roue de la Fortune */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center shadow-lg">
          <div className="relative mx-auto w-64 h-64 mb-6">
            {/* Roue */}
            <div className={`w-full h-full rounded-full border-8 border-yellow-400 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 relative overflow-hidden shadow-2xl ${
              spinning ? 'animate-spin' : ''
            }`} style={{ animationDuration: spinning ? '3s' : '0s' }}>
              {/* Segments de la roue */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-black text-xl shadow-lg border-2 border-white">
                  {spinning ? '?' : '💰'}
                </div>
              </div>
              
              {/* Indicateurs sur la roue */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white font-black text-sm bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">BONUS</div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white font-black text-sm bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">XAF</div>
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white font-black text-sm bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">5K</div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white font-black text-sm bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">WIN</div>
            </div>
            
            {/* Flèche */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-10 border-transparent border-b-yellow-400 drop-shadow-lg"></div>
          </div>

          {/* Résultat du spin */}
          {spinResult && (
            <div className="mb-4 p-4 bg-green-500/20 backdrop-blur-sm rounded-2xl border border-green-400/30 shadow-lg">
              <div className="text-green-400 font-black text-lg">
                🎉 Vous avez gagné {spinResult.toLocaleString()} XAF !
              </div>
            </div>
          )}

          {/* Bouton Spin */}
          <button
            onClick={handleSpin}
            disabled={!canSpin || spinning}
            className={`w-full py-4 rounded-xl font-black text-lg transition-all duration-200 transform shadow-lg ${
              canSpin && !spinning
                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 hover:scale-105 active:scale-95 shadow-xl'
                : 'bg-black/30 backdrop-blur-sm text-white/50 cursor-not-allowed border border-white/20'
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
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white/90 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">👥 Invitez vos amis</h3>
            <div className="text-right">
              <div className="text-xl font-black text-blue-400">{invitedFriends}</div>
              <div className="text-sm text-white/70">amis invités</div>
            </div>
          </div>
          
          <p className="text-sm text-white/90 mb-4 font-medium">
            Chaque ami invité vous donne un tour supplémentaire gratuit !
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleInviteFriends}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-black hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <Share2 className="inline mr-2" size={18} />
              Partager mon lien d'invitation
            </button>
            
            <button
              onClick={forceCheckReferrals}
              className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-sm"
            >
              🔄 Vérifier nouveaux amis
            </button>
          </div>
        </div>
      </main>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/20 px-4 py-2">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around items-center">
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
            <Link href="/cadeau" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-1 shadow-lg">
                <span className="text-white text-xs">🎁</span>
              </div>
              <span className="text-pink-400 text-xs font-semibold">Cadeau</span>
            </Link>
            <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 border border-white/30">
                <span className="text-white text-xs">👥</span>
              </div>
              <span className="text-white/70 text-xs">Équipe</span>
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
    </div>
  )
}
