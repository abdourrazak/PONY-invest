'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Bell, CreditCard, Info, Users, LogOut, ArrowLeftRight, Smartphone, CheckCircle, Headphones, ChevronLeft, ChevronRight } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'
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
  { icon: ArrowLeftRight, title: 'Échanger', color: 'bg-pink-500' },
  { icon: Smartphone, title: 'Mon Adoption', color: 'bg-green-600', href: '/adoption' },
  { icon: CheckCircle, title: 'Check-in Quotidien', color: 'bg-cyan-500', href: '/check-Quotidien' },
  { icon: Headphones, title: 'Support', color: 'bg-red-500', href: '/support' }
]

export default function Accueil() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [scrollText, setScrollText] = useState(0)
  const { currentUser, userData, loading } = useAuth()
  const router = useRouter()

  // Rediriger vers inscription si pas connecté (pas de localStorage)
  useEffect(() => {
    if (!loading) {
      // Vérifier localStorage pour la session
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      const userPhone = localStorage.getItem('userPhone')
      
      if (!currentUser && (!isLoggedIn || !userPhone)) {
        // Rediriger vers register si pas d'utilisateur
        router.push('/register')
      }
    }
  }, [currentUser, loading, router])

  // Afficher un loader pendant la vérification d'auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
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
    <div className="min-h-screen bg-gray-100">
      {/* Header - Optimisé pour mobile */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 px-3 sm:px-4 py-3 sm:py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-400 via-green-400 to-blue-500 rounded-full shadow-xl border-2 sm:border-3 border-white flex items-center justify-center relative animate-pulse">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-blue-500 opacity-95 animate-spin" style={{animationDuration: '10s'}}></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-white text-xs mb-0.5">🌍</div>
                <span className="text-white font-bold text-[8px] sm:text-xs leading-none">Global</span>
              </div>
            </div>
          </div>
          
          <div className="text-center flex-1">
            <span className="text-white text-lg sm:text-xl font-bold tracking-wide drop-shadow-md">Accueil</span>
          </div>

          <button className="relative p-2 sm:p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg">
            <Bell size={18} className="drop-shadow-sm sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      <main className="px-3 sm:px-4 py-3 sm:py-4">
        {/* Banner Slider */}
        <div className="relative w-full h-40 sm:h-52 overflow-hidden rounded-xl shadow-2xl mb-4 border border-gray-200">
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
            </div>
          ))}
        </div>

        {/* Scrolling Text - Exactement comme sur l'image */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-3 mb-6 overflow-hidden rounded-r-lg shadow-sm">
          <div 
            className="whitespace-nowrap text-green-800 text-sm font-bold animate-pulse"
            style={{
              transform: `translateX(${scrollText}px)`,
              animation: 'scroll-left 15s linear infinite'
            }}
          >
            ✨ Utilisateur 67***823 vient de gagner 48,000 FCFA | 🚀 Nouveau plan promo maintenant actif | 🎁 Bonus disponible dans le canal telegram | 💰 +15% de rendement ce mois
          </div>
        </div>

        {/* Service Grid - 4 colonnes sur mobile */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {services.map((service, index) => {
            const IconComponent = service.icon
            const ServiceContent = (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-5 flex flex-col items-center justify-center hover:shadow-xl transition-all duration-300 cursor-pointer min-h-[85px] sm:h-[75px] transform hover:scale-[1.08] active:scale-[0.95] hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 border border-gray-100">
                <div className={`${service.color} p-1.5 sm:p-2 rounded-lg sm:rounded-xl mb-1.5 sm:mb-2 transition-all duration-200 hover:rotate-6 shadow-lg hover:shadow-xl`}>
                  <IconComponent size={16} className="text-white drop-shadow-sm sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-[11px] text-gray-800 text-center font-bold leading-tight px-0.5 sm:px-1">
                  {service.title}
                </span>
              </div>
            )

            return service.href ? (
              <Link key={index} href={service.href}>
                {ServiceContent}
              </Link>
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
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">💎</span>
              <span className="ml-2">Produits d'Investissement</span>
            </h2>
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              7 Offres
            </div>
          </div>
          
          {/* LV1 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 relative shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV1</span>
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
                <Image src="/p1.png" alt="LV1" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-600 text-xs sm:text-sm font-black">3 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-600 text-xs sm:text-sm font-black">+600 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-600 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-red-600 font-bold text-lg">3 000 FCFA</span>
              <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV2 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV2</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
                <Image src="/p2.png" alt="LV2" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-600 text-xs sm:text-sm font-black">5 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-600 text-xs sm:text-sm font-black">+1 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-600 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-red-600 font-bold text-lg">5 000 FCFA</span>
              <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV3 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV3</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
                <Image src="/p3.png" alt="LV3" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-600 text-xs sm:text-sm font-black">7 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-600 text-xs sm:text-sm font-black">+2 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-600 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-red-600 font-bold text-lg">7 000 FCFA</span>
              <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV4 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV4</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
                <Image src="/p4.png" alt="LV4" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-600 text-xs sm:text-sm font-black">12 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-600 text-xs sm:text-sm font-black">+2 400 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-600 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-red-600 font-bold text-lg">12 000 FCFA</span>
              <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV5 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV5</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
                <Image src="/p5.png" alt="LV5" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-600 text-xs sm:text-sm font-black">20 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-600 text-xs sm:text-sm font-black">+4 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-600 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-red-600 font-bold text-lg">20 000 FCFA</span>
              <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV6 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV6</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
                <Image src="/p6.png" alt="LV6" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-600 text-xs sm:text-sm font-black">50 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-600 text-xs sm:text-sm font-black">+10 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-600 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-red-600 font-bold text-lg">50 000 FCFA</span>
              <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>

          {/* LV7 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV7</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
                <Image src="/p7.png" alt="LV7" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Prix :</span>
                    <span className="text-blue-600 text-xs sm:text-sm font-black">95 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Par jour :</span>
                    <span className="text-green-600 text-xs sm:text-sm font-black">+19 000 FCFA</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-center">
                    <span className="text-gray-800 text-xs sm:text-sm font-bold">Durée :</span>
                    <span className="text-purple-600 text-xs sm:text-sm font-black">30 jours</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-red-600 font-bold text-lg">95 000 FCFA</span>
              <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
                Louer Maintenant
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around items-center">
            <Link href="/" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-green-600 text-xs font-medium">Accueil</span>
            </Link>
            <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                <span className="text-gray-500 text-xs">📊</span>
              </div>
              <span className="text-gray-500 text-xs">Produits</span>
            </Link>
            <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                <span className="text-gray-500 text-xs">👥</span>
              </div>
              <span className="text-gray-500 text-xs">Équipe</span>
            </Link>
            <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                <span className="text-gray-500 text-xs">👤</span>
              </div>
              <span className="text-gray-500 text-xs">Mon Compte</span>
            </Link>
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
    </div>
  )
}
