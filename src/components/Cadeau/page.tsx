'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Gift, Users, Clock, Share2, ArrowLeft, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { 
  getUserGiftData, 
  performSpin, 
  canUserSpin, 
  getTimeUntilNextSpin,
  validateReferrals,
  UserGiftData 
} from '@/lib/giftSystem'

export default function Cadeau() {
  const { currentUser, userData } = useAuth()
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<number | null>(null)
  const [giftData, setGiftData] = useState<UserGiftData | null>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const [loading, setLoading] = useState(true)
  const [eventTimeLeft, setEventTimeLeft] = useState('2d 00:00:00')

  // Charger les données de cadeau depuis Firestore
  useEffect(() => {
    loadGiftData()
  }, [currentUser, userData])

  const loadGiftData = async () => {
    if (!currentUser || !userData?.referralCode) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Récupérer les données de cadeau depuis Firestore
      const data = await getUserGiftData(currentUser.uid)
      setGiftData(data)
      
      // Vérifier les filleuls valides
      const validReferrals = await validateReferrals(currentUser.uid, userData.referralCode)
      
      // Mettre à jour les données si nécessaire
      if (validReferrals !== data.validReferrals) {
        const updatedData = { ...data, validReferrals }
        setGiftData(updatedData)
      }
      
      // Gérer le cooldown
      if (!canUserSpin(data)) {
        const timeRemaining = getTimeUntilNextSpin(data)
        if (timeRemaining > 0) {
          updateTimeLeft(timeRemaining)
        }
      }
      
    } catch (error) {
      console.error('Erreur chargement données cadeau:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour forcer la vérification des nouveaux filleuls
  const forceCheckReferrals = async () => {
    await loadGiftData()
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
      setTimeLeft('')
      // Recharger les données pour vérifier si l'utilisateur peut maintenant tourner
      loadGiftData()
    }
  }

  // Fonction de spin avec le nouveau système
  const handleSpin = async () => {
    if (!currentUser || !userData?.referralCode || !giftData || spinning) return
    
    // Vérifier si l'utilisateur peut tourner
    if (!canUserSpin(giftData)) {
      const timeRemaining = getTimeUntilNextSpin(giftData)
      if (timeRemaining > 0) {
        updateTimeLeft(timeRemaining)
        return
      }
    }

    setSpinning(true)
    
    try {
      // Animation de 3 secondes
      setTimeout(async () => {
        try {
          const result = await performSpin(currentUser.uid, userData.referralCode)
          
          if (result.success) {
            setSpinResult(result.amount)
            
            // Recharger les données pour avoir les dernières informations
            await loadGiftData()
            
            // Si pas de cooldown (60+ filleuls), permettre un nouveau spin
            if (giftData.validReferrals < 60) {
              const timeRemaining = getTimeUntilNextSpin(giftData)
              if (timeRemaining > 0) {
                updateTimeLeft(timeRemaining)
              }
            }
          } else {
            alert(result.message)
          }
        } catch (error) {
          console.error('Erreur lors du spin:', error)
          alert('Erreur lors du spin. Veuillez réessayer.')
        } finally {
          setSpinning(false)
        }
      }, 3000)
    } catch (error) {
      console.error('Erreur lors du spin:', error)
      setSpinning(false)
    }
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


  // Calculer le progrès vers 5000 XAF
  const totalBonus = giftData?.totalBonus || 0
  const invitedFriends = giftData?.validReferrals || 0
  const canSpin = giftData ? canUserSpin(giftData) : false
  
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
        {loading ? (
          <div className="text-center py-12">
            <div className="text-white/70 text-lg mb-2">Chargement...</div>
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <>
        
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

        {/* Roue de la Fortune Premium */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Effet de brillance en arrière-plan */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-purple-500/10 rounded-2xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-black text-white mb-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              🎰 ROUE DE LA FORTUNE
            </h3>
            
            <div className="relative mx-auto w-72 h-72 mb-8">
              {/* Cercle extérieur avec effet glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-2 shadow-2xl animate-pulse">
                <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-sm"></div>
              </div>
              
              {/* Roue principale */}
              <div className={`absolute inset-2 rounded-full border-4 border-white/30 bg-gradient-conic from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-red-500 relative overflow-hidden shadow-2xl ${
                spinning ? 'animate-spin' : ''
              }`} style={{ 
                animationDuration: spinning ? '3s' : '0s',
                animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}>
                
                {/* Segments de la roue avec effet premium */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600 rounded-full flex items-center justify-center text-black font-black text-2xl shadow-2xl border-4 border-white relative overflow-hidden">
                    {/* Effet de brillance */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-full"></div>
                    <div className="relative z-10">
                      {spinning ? (
                        <div className="animate-bounce text-3xl">💫</div>
                      ) : (
                        <div className="text-2xl">💰</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Indicateurs premium sur la roue */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white font-black text-xs bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30 shadow-lg">
                  JACKPOT
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-black text-xs bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30 shadow-lg">
                  BONUS
                </div>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white font-black text-xs bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30 shadow-lg">
                  MEGA
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white font-black text-xs bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30 shadow-lg">
                  WIN
                </div>
                
                {/* Lignes de séparation des segments */}
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-full bg-white/20 origin-bottom"
                      style={{
                        left: '50%',
                        transform: `translateX(-50%) rotate(${i * 45}deg)`,
                        transformOrigin: 'center bottom'
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Flèche premium avec effet glow */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                <div className="relative">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-transparent border-b-yellow-400 drop-shadow-2xl filter blur-sm absolute"></div>
                  <div className="w-0 h-0 border-l-6 border-r-6 border-b-10 border-transparent border-b-white relative z-10"></div>
                </div>
              </div>
              
              {/* Particules d'effet autour de la roue */}
              {spinning && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1s'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Résultat du spin premium */}
          {spinResult && (
            <div className="mb-6 p-6 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl border-2 border-green-400/50 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse"></div>
              <div className="relative z-10 text-center">
                <div className="text-4xl mb-2">🎊</div>
                <div className="text-green-400 font-black text-xl mb-2">
                  FÉLICITATIONS !
                </div>
                <div className="text-white font-black text-2xl mb-1">
                  +{spinResult.toLocaleString()} XAF
                </div>
                <div className="text-green-300 text-sm font-medium">
                  Ajouté à votre solde cadeau
                </div>
              </div>
            </div>
          )}

          {/* Bouton Spin Premium */}
          <div className="relative">
            <button
              onClick={handleSpin}
              disabled={!canSpin || spinning}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all duration-300 transform shadow-2xl relative overflow-hidden ${
                canSpin && !spinning
                  ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 text-white hover:from-yellow-600 hover:via-orange-600 hover:to-yellow-700 hover:scale-105 active:scale-95 shadow-2xl border-2 border-yellow-400/50'
                  : 'bg-black/40 backdrop-blur-sm text-white/50 cursor-not-allowed border-2 border-white/20'
              }`}
            >
              {/* Effet de brillance sur le bouton actif */}
              {canSpin && !spinning && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              )}
              
              <div className="relative z-10 flex items-center justify-center">
                {spinning ? (
                  <>
                    <div className="flex items-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      <span>TOURNAGE EN COURS...</span>
                      <div className="ml-2 text-2xl animate-bounce">🎰</div>
                    </div>
                  </>
                ) : canSpin ? (
                  <>
                    <div className="text-2xl mr-2 animate-pulse">🎰</div>
                    <span>TOURNER LA ROUE</span>
                    <div className="text-2xl ml-2 animate-pulse">💫</div>
                  </>
                ) : (
                  <>
                    <div className="text-xl mr-2">⏰</div>
                    <span>Prochain tour dans {timeLeft}</span>
                  </>
                )}
              </div>
            </button>
            
            {/* Effet glow autour du bouton quand actif */}
            {canSpin && !spinning && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-2xl blur-lg opacity-30 animate-pulse -z-10"></div>
            )}
          </div>
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
          </>
        )}
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
