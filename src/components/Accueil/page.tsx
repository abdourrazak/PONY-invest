'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavigationLink from '../NavigationLink/NavigationLink'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Bell, CreditCard, Info, Users, LogOut, Gift, Smartphone, CheckCircle, Headphones, ChevronLeft, ChevronRight } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'
import WelcomePopup from '../WelcomePopup/WelcomePopup'
import { useAuth } from '@/contexts/AuthContext'

const banners = [
  '/banner1.jpeg',
  '/banner2.jpeg', 
  '/banner3.jpeg'
]

const notifications = [
  "🎯 Utilisateur 67***823 vient de gagner 48000 Fcfa",
  "💼 Nouveau plan promo maintenant actif",
  "🏆 Bonus disponible dans le canal telegram"
]

const services = [
  { icon: CreditCard, title: 'Recharge', color: 'bg-orange-500', href: '/recharge' },
  { icon: Info, title: 'À propos', color: 'bg-green-500', href: '/propos' },
  { icon: Users, title: 'Équipe', color: 'bg-blue-500', href: '/equipe' },
  { icon: LogOut, title: 'Retrait', color: 'bg-yellow-500', href: '/retrait' },
  { icon: Gift, title: 'Cadeau', color: 'bg-gradient-to-r from-pink-500 to-purple-600', special: 'gift', href: '/cadeau' },
  { icon: Smartphone, title: 'Mon Adoption', color: 'bg-green-600', href: '/adoption' },
  { icon: CheckCircle, title: 'Check-in Quotidien', color: 'bg-cyan-500', href: '/check-Quotidien' },
  { icon: Headphones, title: 'Support', color: 'bg-red-500', href: '/support' }
]

export default function Accueil() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [scrollText, setScrollText] = useState(0)
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const { currentUser, userData, loading } = useAuth()
  const router = useRouter()

  // Force viewport reset and fix scroll issues
  useEffect(() => {
    const resetViewport = () => {
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      }
    }
    
    // Fix scroll behavior
    const fixScrollBehavior = () => {
      document.body.style.position = 'relative'
      document.body.style.overflowX = 'hidden'
      document.body.style.height = 'auto'
      document.body.style.minHeight = '100vh'
      
      // Prevent scroll bounce
      document.addEventListener('touchmove', (e) => {
        if (e.target === document.body) {
          e.preventDefault()
        }
      }, { passive: false })
    }
    
    resetViewport()
    fixScrollBehavior()
    
    // Reset on orientation change
    window.addEventListener('orientationchange', resetViewport)
    window.addEventListener('resize', resetViewport)
    
    return () => {
      window.removeEventListener('orientationchange', resetViewport)
      window.removeEventListener('resize', resetViewport)
    }
  }, [])

  // Rediriger vers inscription si pas connecté et gérer popup de bienvenue
  useEffect(() => {
    if (!loading) {
      // Vérifier localStorage pour la session
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      const userPhone = localStorage.getItem('userPhone')
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
      
      console.log('🔍 Accueil useEffect - Debug:', {
        currentUser: !!currentUser,
        isLoggedIn,
        userPhone,
        hasSeenWelcome,
        loading
      })
      
      if (!currentUser && (!isLoggedIn || !userPhone)) {
        // Rediriger vers register si pas d'utilisateur
        router.push('/register')
      }
      // Ne plus afficher le popup automatiquement sur l'accueil
    }
  }, [currentUser, loading, router])

  // Gérer la fermeture du popup de bienvenue
  const handleWelcomeClose = () => {
    setShowWelcomePopup(false)
    // Ne plus sauvegarder hasSeenWelcome pour permettre l'affichage répétitif
    console.log('🔒 Accueil: Popup closed, no hasSeenWelcome saved')
  }

  const handleTelegramJoin = () => {
    // Analytics ou tracking si nécessaire
    console.log('User joined Telegram group')
  }

  // Afficher un loader pendant la vérification d'auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 4000)

    return () => clearInterval(slideInterval)
  }, [])

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      setScrollText((prev) => prev - 1)
    }, 50)

    return () => clearInterval(scrollInterval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white" style={{ 
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      position: 'relative',
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'none'
    }}>
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-4 py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">AXML</h1>
              <p className="text-white/70 text-xs">Plateforme d'investissement</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
              <span className="text-white/90 text-sm font-medium">0 FCFA</span>
            </div>
            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-colors">
              <span className="text-white text-lg">🔔</span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-4 py-3 sm:py-4" style={{ touchAction: 'pan-y' }}>
        {/* Banner Slider */}
        <div className="relative w-full h-40 sm:h-52 overflow-hidden rounded-2xl shadow-2xl mb-6 border border-white/20">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={banner}
                alt={`Banner ${index + 1}`}
                fill
                className="object-cover rounded-2xl"
                priority={index === 0}
              />
              {/* Overlay gradient pour améliorer la lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl"></div>
            </div>
          ))}
          
          {/* Indicateurs de slide */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scrolling Text */}
        <div className="bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 backdrop-blur-sm border-y border-white/10 py-2 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap">
            <span className="text-white/90 text-sm font-medium px-4">
              ✨ Utilisateur 67***823 vient de gagner 48,000 FCFA | 🚀 Nouveau plan promo maintenant actif | 🎁 Bonus disponible dans le canal telegram | 💰 +15% de rendement ce mois
            </span>
          </div>
        </div>

        {/* Service Grid - 4 colonnes sur mobile */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {services.map((service, index) => {
            const IconComponent = service.icon
            const ServiceContent = (
              <div className={`bg-white/10 backdrop-blur-sm rounded-2xl shadow-md p-1 sm:p-2 flex flex-col items-center justify-center min-h-[95px] sm:h-[85px] cursor-pointer border border-white/20 ${
                service.special === 'gift' 
                  ? 'hover:shadow-xl transition-all duration-300 transform hover:scale-[1.08] active:scale-[0.95] hover:bg-white/20' 
                  : 'transition-colors duration-200'
              }`}>
                <div className={`${service.color} p-2.5 sm:p-3 rounded-2xl mb-0.5 sm:mb-1 shadow-lg ${
                  service.special === 'gift' 
                    ? 'animate-pulse shadow-pink-300 ring-2 ring-pink-300 ring-opacity-50 transition-all duration-200 hover:rotate-6 hover:shadow-xl' 
                    : ''
                }`}>
                  <IconComponent size={24} className={`text-white drop-shadow-sm sm:w-8 sm:h-8 ${
                    service.special === 'gift' ? 'animate-bounce filter drop-shadow-lg' : ''
                  }`} />
                </div>
                <span className={`text-white text-[11px] sm:text-[13px] text-center font-bold leading-tight ${
                  service.special === 'gift' ? 'text-pink-300 animate-pulse' : ''
                }`}>
                  {service.title}
                </span>
              </div>
            )

            return service.href ? (
              <NavigationLink key={index} href={service.href}>
                {ServiceContent}
              </NavigationLink>
            ) : (
              <div key={index}>
                {ServiceContent}
              </div>
            )
          })}
        </div>

        {/* Section Produits d'investissement */}
        <div className="mt-8 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="text-2xl mr-2">💎</span>
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Produits d'Investissement</span>
            </h2>
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm text-yellow-300 px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-yellow-500/30">
              7 Offres
            </div>
          </div>
          
          {/* LV1 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-3 relative shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV1</span>
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p1.png" alt="LV1" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-white/15 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">3 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-400 text-xs sm:text-sm font-black">+600 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">3 000 FCFA</span>
              <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV2 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV2</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p2.png" alt="LV2" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-white/15 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">5 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-400 text-xs sm:text-sm font-black">+1 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">5 000 FCFA</span>
              <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV3 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV3</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p3.png" alt="LV3" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-white/15 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">7 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-400 text-xs sm:text-sm font-black">+2 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">7 000 FCFA</span>
              <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV4 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV4</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p4.png" alt="LV4" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-white/15 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">12 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-400 text-xs sm:text-sm font-black">+2 400 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">12 000 FCFA</span>
              <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV5 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV5</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p5.png" alt="LV5" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-white/15 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">20 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-400 text-xs sm:text-sm font-black">+4 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">20 000 FCFA</span>
              <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV6 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV6</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p6.png" alt="LV6" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-white/15 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">50 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-400 text-xs sm:text-sm font-black">+10 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">50 000 FCFA</span>
              <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV7 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV7</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p7.png" alt="LV7" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-white/15 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">95 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-400 text-xs sm:text-sm font-black">+19 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">95 000 FCFA</span>
              <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10 px-4 py-2">
          <div className="flex justify-around items-center">
            <NavigationLink href="/" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-white text-xs font-medium">Accueil</span>
            </NavigationLink>
            <NavigationLink href="/produits" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                <span className="text-gray-500 text-xs">📊</span>
              </div>
              <span className="text-gray-500 text-xs">Produits</span>
            </NavigationLink>
            <NavigationLink href="/equipe" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                <span className="text-gray-500 text-xs">👥</span>
              </div>
              <span className="text-gray-500 text-xs">Équipe</span>
            </NavigationLink>
            <NavigationLink href="/compte" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                <span className="text-gray-500 text-xs">👤</span>
              </div>
              <span className="text-gray-500 text-xs">Mon Compte</span>
            </NavigationLink>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>

      {/* Support Float */}
      <SupportFloat />

      {/* Welcome Popup */}
      <WelcomePopup 
        isOpen={showWelcomePopup}
        onClose={handleWelcomeClose}
        onTelegramJoin={handleTelegramJoin}
      />
    </div>
  )
}
