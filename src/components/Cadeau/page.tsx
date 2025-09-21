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

  // Gérer le timer quand les données changent
  useEffect(() => {
    console.log('useEffect déclenché, giftData:', giftData)
    
    // Fallback avec localStorage si Firestore ne fonctionne pas
    if (!giftData && userData?.numeroTel) {
      console.log('Fallback localStorage pour:', userData.numeroTel)
      const lastSpin = localStorage.getItem(`lastSpin_${userData.numeroTel}`)
      if (lastSpin) {
        const lastSpinTime = parseInt(lastSpin)
        const now = Date.now()
        const timeDiff = now - lastSpinTime
        const cooldown = 24 * 60 * 60 * 1000 // 24h
        
        if (timeDiff < cooldown) {
          const timeRemaining = cooldown - timeDiff
          console.log('Fallback: temps restant', timeRemaining)
          updateTimeLeft(timeRemaining)
          return
        }
      }
      console.log('Fallback: peut tourner')
      setTimeLeft('')
      return
    }
    
    if (giftData) {
      try {
        const canSpin = canUserSpin(giftData)
        console.log('canUserSpin résultat:', canSpin)
        
        if (canSpin) {
          console.log('Utilisateur peut tourner')
          setTimeLeft('')
        } else {
          const timeRemaining = getTimeUntilNextSpin(giftData)
          console.log('Temps restant calculé:', timeRemaining, 'ms')
          
          if (timeRemaining > 0) {
            console.log('Démarrage du timer')
            updateTimeLeft(timeRemaining)
          } else {
            console.log('Pas de temps restant, peut tourner')
            setTimeLeft('')
          }
        }
      } catch (error) {
        console.error('Erreur dans useEffect timer:', error)
        setTimeLeft('')
      }
    }
  }, [giftData, userData])

  const loadGiftData = async () => {
    if (!currentUser || !userData?.referralCode) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('Début chargement données pour userId:', currentUser.uid)
      
      // Récupérer les données de cadeau depuis Firestore
      const data = await getUserGiftData(currentUser.uid)
      console.log('Données brutes récupérées:', data)
      
      // Vérifier les filleuls valides
      const validReferrals = await validateReferrals(currentUser.uid, userData.referralCode)
      console.log('Filleuls valides:', validReferrals)
      
      // Créer les données finales avec les filleuls mis à jour
      const finalData = { ...data, validReferrals }
      console.log('Données finales avant setGiftData:', finalData)
      
      setGiftData(finalData)
      console.log('setGiftData appelé avec succès')
      
    } catch (error) {
      console.error('Erreur chargement données cadeau:', error)
      // En cas d'erreur, créer des données par défaut pour débloquer l'interface
      const defaultData = {
        userId: currentUser.uid,
        totalBonus: 0,
        validReferrals: 0,
        lastSpin: null,
        canSpin: true,
        spinCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      console.log('Utilisation des données par défaut:', defaultData)
      setGiftData(defaultData as any)
    } finally {
      setLoading(false)
    }
    
    // Si Firestore ne fonctionne pas, essayer localStorage
    if (!giftData && userData?.numeroTel) {
      console.log('Tentative de chargement depuis localStorage')
      const savedBonus = localStorage.getItem(`spinBonus_${userData.numeroTel}`)
      const lastSpin = localStorage.getItem(`lastSpin_${userData.numeroTel}`)
      
      if (savedBonus || lastSpin) {
        const localData = {
          userId: currentUser?.uid || '',
          totalBonus: savedBonus ? parseInt(savedBonus) : 0,
          validReferrals: 0,
          lastSpin: lastSpin ? { toMillis: () => parseInt(lastSpin) } as any : null,
          canSpin: true,
          spinCount: savedBonus ? 1 : 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        console.log('Données localStorage chargées:', localData)
        setGiftData(localData as any)
      }
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
    const timeString = `${hours}h ${minutes}m ${seconds}s`
    console.log('updateTimeLeft appelé, temps:', timeString)
    setTimeLeft(timeString)

    if (timeRemaining > 0) {
      setTimeout(() => updateTimeLeft(timeRemaining - 1000), 1000)
    } else {
      console.log('Timer fini, rechargement des données')
      setTimeLeft('')
      // Recharger les données pour vérifier si l'utilisateur peut maintenant tourner
      loadGiftData()
    }
  }

  // Fonction de spin simplifiée avec localStorage
  const handleSpin = async () => {
    if (!currentUser || !userData?.numeroTel || spinning) return
    
    console.log('handleSpin appelé pour:', userData.numeroTel)
    
    // Vérifier le cooldown avec localStorage (plus fiable)
    const lastSpin = localStorage.getItem(`lastSpin_${userData.numeroTel}`)
    if (lastSpin) {
      const lastSpinTime = parseInt(lastSpin)
      const now = Date.now()
      const timeDiff = now - lastSpinTime
      const cooldown = 24 * 60 * 60 * 1000 // 24h
      
      if (timeDiff < cooldown) {
        const timeRemaining = cooldown - timeDiff
        console.log('Cooldown actif, temps restant:', timeRemaining)
        updateTimeLeft(timeRemaining)
        return
      }
    }

    setSpinning(true)
    console.log('Début du spin')
    
    // Animation de 3 secondes puis spin
    setTimeout(() => {
      try {
        console.log('Exécution du spin')
        const userKey = userData.numeroTel
        const savedBonus = localStorage.getItem(`spinBonus_${userKey}`)
        const currentBonus = savedBonus ? parseInt(savedBonus) : 0
        
        console.log('Bonus actuel:', currentBonus)
        
        let bonus
        if (currentBonus === 0) {
          bonus = Math.floor(Math.random() * 61) + 4850 // 4850-4910 XAF
          console.log('Premier spin, bonus:', bonus)
        } else {
          bonus = Math.floor(Math.random() * 5) + 1 // 1-5 XAF
          console.log('Spin quotidien, bonus:', bonus)
        }
        
        const newTotal = Math.min(currentBonus + bonus, 5000)
        console.log('Nouveau total:', newTotal)
        
        // Sauvegarder dans localStorage
        localStorage.setItem(`spinBonus_${userKey}`, newTotal.toString())
        localStorage.setItem(`lastSpin_${userKey}`, Date.now().toString())
        
        // Afficher le résultat
        setSpinResult(bonus)
        
        // Mettre à jour les données d'affichage
        const tempData = {
          userId: currentUser.uid,
          totalBonus: newTotal,
          validReferrals: 0,
          lastSpin: { toMillis: () => Date.now() } as any,
          canSpin: false,
          spinCount: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setGiftData(tempData as any)
        
        console.log('Spin terminé avec succès')
        
        // Essayer de synchroniser avec Firestore en arrière-plan (optionnel)
        if (userData?.referralCode) {
          performSpin(currentUser.uid, userData.referralCode).catch(error => {
            console.log('Sync Firestore échouée (pas grave):', error)
          })
        }
        
      } catch (error) {
        console.error('Erreur dans le spin localStorage:', error)
        alert('Erreur lors du spin. Veuillez réessayer.')
      } finally {
        setSpinning(false)
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


  // Calculer le progrès vers 5000 XAF avec localStorage en priorité
  const getLocalStorageBonus = () => {
    if (userData?.numeroTel) {
      const savedBonus = localStorage.getItem(`spinBonus_${userData.numeroTel}`)
      return savedBonus ? parseInt(savedBonus) : 0
    }
    return 0
  }
  
  const totalBonus = giftData?.totalBonus || getLocalStorageBonus()
  const invitedFriends = giftData?.validReferrals || 0
  
  // Vérifier si peut tourner avec localStorage
  const canSpinLocalStorage = () => {
    if (!userData?.numeroTel) return true
    const lastSpin = localStorage.getItem(`lastSpin_${userData.numeroTel}`)
    if (!lastSpin) return true
    
    const lastSpinTime = parseInt(lastSpin)
    const now = Date.now()
    const timeDiff = now - lastSpinTime
    const cooldown = 24 * 60 * 60 * 1000 // 24h
    
    return timeDiff >= cooldown
  }
  
  const canSpin = giftData ? canUserSpin(giftData) : canSpinLocalStorage()
  
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
              timeLeft ? `⏰ Prochain tour dans ${timeLeft}` : '⏰ Chargement du timer...'
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
