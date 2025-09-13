'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavigationLink from '../NavigationLink/NavigationLink'
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
  { icon: CreditCard, title: 'Recharge', color: 'bg-gradient-to-br from-green-500 to-emerald-600', href: '/recharge' },
  { icon: Info, title: 'À propos', color: 'bg-gradient-to-br from-blue-500 to-indigo-600', href: '/propos' },
  { icon: Users, title: 'Équipe', color: 'bg-gradient-to-br from-purple-500 to-violet-600', href: '/equipe' },
  { icon: LogOut, title: 'Retrait', color: 'bg-gradient-to-br from-orange-500 to-red-600', href: '/retrait' },
  { icon: Gift, title: 'Cadeau', color: 'bg-gradient-to-r from-pink-500 to-purple-600', special: 'gift', href: '/cadeau' },
  { icon: Smartphone, title: 'Mon Adoption', color: 'bg-gradient-to-br from-cyan-500 to-teal-600', href: '/adoption' },
  { icon: CheckCircle, title: 'Check-in Quotidien', color: 'bg-gradient-to-br from-yellow-500 to-amber-600', href: '/check-Quotidien' },
  { icon: Headphones, title: 'Support', color: 'bg-gradient-to-br from-rose-500 to-pink-600', href: '/support' }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative" style={{
      overscrollBehavior: 'none'
    }}>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full shadow-xl border-2 border-white/20 flex items-center justify-center relative animate-pulse">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-95 animate-spin" style={{animationDuration: '10s'}}></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-white text-xs mb-0.5">🌍</div>
                  <span className="text-white font-bold text-[8px] leading-none">Global</span>
                </div>
              </div>
              
              <div>
                <h1 className="text-white font-bold text-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  GLOBAL
                </h1>
                <p className="text-white/60 text-xs">Plateforme d'investissement</p>
              </div>
            </div>

            <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
              <Bell size={18} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Banner Slider */}
        <div className="relative w-full h-52 overflow-hidden rounded-2xl shadow-2xl border border-white/20">
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
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          ))}
          
          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scrolling Text */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-yellow-400 text-sm font-medium px-4">
              ✨ Utilisateur 67***823 vient de gagner 48,000 FCFA | 🚀 Nouveau plan promo maintenant actif | 🎁 Bonus disponible dans le canal telegram | 💰 +15% de rendement ce mois
            </span>
          </div>
        </div>

        {/* Service Grid - 4 colonnes sur mobile */}
        <div className="grid grid-cols-4 gap-2">
          {services.map((service, index) => {
            const IconComponent = service.icon
            const ServiceContent = (
              <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-2 flex flex-col items-center justify-center min-h-[95px] cursor-pointer border border-white/20 ${
                service.special === 'gift' 
                  ? 'hover:shadow-xl transition-all duration-300 transform hover:scale-[1.08] active:scale-[0.95] hover:bg-white/20' 
                  : 'transition-colors duration-200'
              }`}>
                <div className={`${service.color} p-3 rounded-2xl mb-1 shadow-lg ${
                  service.special === 'gift' 
                    ? 'animate-pulse shadow-pink-300 ring-2 ring-pink-300 ring-opacity-50 transition-all duration-200 hover:rotate-6 hover:shadow-xl' 
                    : ''
                }`}>
                  <IconComponent size={24} className={`text-white drop-shadow-sm ${
                    service.special === 'gift' ? 'animate-bounce filter drop-shadow-lg' : ''
                  }`} />
                </div>
                <span className={`text-xs text-center font-bold leading-tight ${
                  service.special === 'gift' ? 'text-pink-300 animate-pulse' : 'text-white/70'
                }`}>
                  {service.title}
                </span>
              </div>
            )

            return service.href ? (
              <Link key={index} href={service.href}>
                {ServiceContent}
              </Link>
            ) : (
              <div key={index}>{ServiceContent}</div>
            )
          })}
        </div>

        {/* Section Produits d'investissement */}
        <div className="mt-8 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">Produits d'investissement</h2>
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm text-yellow-300 px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-yellow-500/30">
              7 Offres
            </div>
          </div>
          
          <div className="space-y-4">
          {/* LV1 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV1</span>
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p1.png" alt="LV1" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">6 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Par jour :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">+500 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Durée :</span>
                    <span className="text-pink-400 text-xs sm:text-sm font-black">120 jours</span>
                  </div>
                </div>
                
                <div className="bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Revenu estimé :</span>
                    <span className="text-green-400 text-xs sm:text-sm font-black">60 000 FCFA</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">6 000 FCFA</span>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV2 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV2</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p2.png" alt="LV2" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">15 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Par jour :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">+1 400 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Durée :</span>
                    <span className="text-pink-400 text-xs sm:text-sm font-black">120 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">15 000 FCFA</span>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV3 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV3</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p3.png" alt="LV3" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">35 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Par jour :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">+3 400 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Durée :</span>
                    <span className="text-pink-400 text-xs sm:text-sm font-black">120 jours</span>
                  </div>
                </div>
                
                <div className="bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Revenu estimé :</span>
                    <span className="text-green-400 text-xs sm:text-sm font-black">408 000 FCFA</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">35 000 FCFA</span>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV4 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV4</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p4.png" alt="LV4" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">80 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Par jour :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">+7 900 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Durée :</span>
                    <span className="text-pink-400 text-xs sm:text-sm font-black">120 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">80 000 FCFA</span>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV5 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV5</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p5.png" alt="LV5" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">110 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Par jour :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">+10 800 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Durée :</span>
                    <span className="text-pink-400 text-xs sm:text-sm font-black">120 jours</span>
                  </div>
                </div>
                
                <div className="bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Revenu estimé :</span>
                    <span className="text-green-400 text-xs sm:text-sm font-black">1 296 000 FCFA</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">110 000 FCFA</span>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV6 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV6</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p6.png" alt="LV6" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">250 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Par jour :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">+24 900 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Durée :</span>
                    <span className="text-pink-400 text-xs sm:text-sm font-black">120 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">250 000 FCFA</span>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV7 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV7</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
                <Image src="/p7.png" alt="LV7" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Prix :</span>
                    <span className="text-blue-400 text-xs sm:text-sm font-black">400 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Par jour :</span>
                    <span className="text-purple-400 text-xs sm:text-sm font-black">+38 500 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Durée :</span>
                    <span className="text-pink-400 text-xs sm:text-sm font-black">120 jours</span>
                  </div>
                </div>
                
                <div className="bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/90 text-xs sm:text-sm font-black">Revenu estimé :</span>
                    <span className="text-green-400 text-xs sm:text-sm font-black">4 620 000 FCFA</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-lg">400 000 FCFA</span>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>
          </div>
        </div>

        {/* Navigation Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/20 px-4 py-2">
          <div className="flex justify-around items-center">
            <Link href="/" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-1 shadow-lg">
                <span className="text-white text-xs">🏠</span>
              </div>
              <span className="text-purple-400 text-xs font-semibold">Accueil</span>
            </Link>
            <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 border border-white/30">
                <span className="text-white text-xs">📊</span>
              </div>
              <span className="text-white/70 text-xs">Produits</span>
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
              <span className="text-white/70 text-xs">Mon Compte</span>
            </Link>
          </div>
        </div>
      </main>

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
