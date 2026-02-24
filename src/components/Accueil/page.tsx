'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Minus, Smartphone, Gift, Wallet, TrendingUp, Users, Bell, Shield, Home, BarChart3, UserCheck, User } from 'lucide-react'
import Image from 'next/image'
import CryptoTicker from '../CryptoTicker/CryptoTicker'
import SupportFloat from '../SupportFloat/SupportFloat'
import ProductModal from '@/components/ProductModal/ProductModal'
import WelcomePopup from '../WelcomePopup/WelcomePopup'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToUserBalance } from '@/lib/transactions'
import { createRental } from '@/lib/rentals'
import { useRouter } from 'next/navigation'

const banners = [
  '/banner1.jpeg',
  '/banner2.jpeg',
  '/banner3.jpeg'
]

interface ProductData {
  id: string
  name: string
  level: string
  price: number
  originalPrice?: number
  dailyRevenue: number
  duration: number
  totalRevenue: number
  image: string
  type: 'Fixé' | 'Activité'
  vipLevel: number
  maxInvestment: number
  controls: number
  badge?: string
}

export default function AccueilPage() {
  const { userData, currentUser, loading } = useAuth()
  const [balance, setBalance] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null)
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [scrollText, setScrollText] = useState(0)
  const router = useRouter()

  // Services array for the grid
  const services = [
    { title: 'Recharge', icon: Plus, color: 'bg-gradient-to-r from-green-500 to-emerald-500', href: '/recharge' },
    { title: 'Retrait', icon: Minus, color: 'bg-gradient-to-r from-red-500 to-pink-500', href: '/retrait' },
    { title: 'À propos', icon: Smartphone, color: 'bg-gradient-to-r from-blue-500 to-cyan-500', href: '/propos' },
    { title: 'Cadeau', icon: Gift, color: 'bg-gradient-to-r from-pink-500 to-rose-500', href: '/cadeau', special: 'gift' },
    { title: 'Compte', icon: Wallet, color: 'bg-gradient-to-r from-purple-500 to-indigo-500', href: '/compte' },
    { title: 'Check-in Quotidien', icon: TrendingUp, color: 'bg-gradient-to-r from-yellow-500 to-orange-500', href: '/check-Quotidien' },
    { title: 'Parrainage', icon: Users, color: 'bg-gradient-to-r from-teal-500 to-cyan-500', href: '/equipe' },
    { title: 'Support', icon: Shield, color: 'bg-gradient-to-r from-gray-500 to-slate-500', href: '/support' }
  ]

  // Force viewport reset and fix scroll issues
  useEffect(() => {
    const resetViewport = () => {
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      }
    }

    const fixScrollBehavior = () => {
      document.body.style.position = 'relative'
      document.body.style.overflowX = 'hidden'
      document.body.style.height = 'auto'
      document.body.style.minHeight = '100vh'

      document.addEventListener('touchmove', (e) => {
        if (e.target === document.body) {
          e.preventDefault()
        }
      }, { passive: false })
    }

    resetViewport()
    fixScrollBehavior()

    window.addEventListener('orientationchange', resetViewport)
    window.addEventListener('resize', resetViewport)

    return () => {
      window.removeEventListener('orientationchange', resetViewport)
      window.removeEventListener('resize', resetViewport)
    }
  }, [])

  // Synchroniser le solde en temps réel
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserBalance(currentUser.uid, (newBalance) => {
        setBalance(newBalance)
      })
      return unsubscribe
    }
  }, [currentUser])

  // Rediriger vers register si pas d'utilisateur
  useEffect(() => {
    if (!currentUser) {
      router.push('/register')
    }
  }, [currentUser, router])

  // Product data — Packs crypto en $ avec revenu en 2 heures
  const products: ProductData[] = [
    { id: 'lv1', name: 'BTC', level: 'Bitcoin', price: 30, dailyRevenue: 195, duration: 2, totalRevenue: 195, image: '/p1.jpg', type: 'Fixé', vipLevel: 0, maxInvestment: 1, controls: 1 },
    { id: 'lv2', name: 'ETH', level: 'Ethereum', price: 45, dailyRevenue: 243, duration: 2, totalRevenue: 243, image: '/p2.jpg', type: 'Fixé', vipLevel: 1, maxInvestment: 1, controls: 1 },
    { id: 'lv3', name: 'BNB', level: 'Binance Coin', price: 150, dailyRevenue: 528, duration: 2, totalRevenue: 528, image: '/p3.JPG', type: 'Fixé', vipLevel: 2, maxInvestment: 1, controls: 1 },
    { id: 'lv4', name: 'SOL', level: 'Solana', price: 500, dailyRevenue: 2400, duration: 2, totalRevenue: 2400, image: '/p4.JPG', type: 'Fixé', vipLevel: 3, maxInvestment: 1, controls: 1 },
    { id: 'lv5', name: 'XRP', level: 'Ripple', price: 1250, dailyRevenue: 5000, duration: 2, totalRevenue: 5000, image: '/p5.JPG', type: 'Fixé', vipLevel: 4, maxInvestment: 1, controls: 1 },
    { id: 'lv6', name: 'DOGE', level: 'Dogecoin', price: 3000, dailyRevenue: 9000, duration: 2, totalRevenue: 9000, image: '/p6.JPG', type: 'Fixé', vipLevel: 5, maxInvestment: 1, controls: 1 },
    { id: 'lv7', name: 'USDT', level: 'Tether', price: 10000, dailyRevenue: 25000, duration: 2, totalRevenue: 25000, image: '/p7.jpg', type: 'Fixé', vipLevel: 6, maxInvestment: 1, controls: 1 },
  ]

  const handleRentClick = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setSelectedProduct(product)
      setIsModalOpen(true)
    }
  }

  const handleRent = async (product: ProductData, quantity: number) => {
    if (!currentUser || !userData) {
      throw new Error('Vous devez être connecté pour effectuer un investissement')
    }

    try {
      await createRental(
        currentUser.uid,
        userData.numeroTel,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          dailyRevenue: product.dailyRevenue,
          duration: product.duration,
          totalRevenue: product.totalRevenue
        },
        quantity
      )
    } catch (error: any) {
      console.error('Erreur lors de l\'investissement:', error)
      throw error
    }
  }

  const handleWelcomeClose = () => {
    setShowWelcomePopup(false)
  }

  const handleTelegramJoin = () => {
    console.log('User joined Telegram group')
  }

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
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
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
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center relative overflow-hidden">
                <Image src="/ponyAI.png" alt="PONY AI" width={40} height={40} className="object-cover w-full h-full" unoptimized />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 bg-clip-text text-transparent">PONY</h1>
                <p className="text-white/60 text-xs">Plateforme d&apos;investissement</p>
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
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image src={banner} alt={`Banner ${index + 1}`} fill className="object-cover" priority={index === 0} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          ))}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>

        {/* Scrolling Text */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-yellow-400 text-sm font-medium px-4">
              ✨ Utilisateur 67***823 vient de gagner $195 | 🚀 Nouveaux packs maintenant actifs | 🎁 Bonus disponible dans le canal telegram | 💰 Gains en 2 heures !
            </span>
          </div>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-4 gap-2">
          {services.map((service, index) => {
            const IconComponent = service.icon
            const ServiceContent = (
              <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-2 flex flex-col items-center justify-center min-h-[95px] cursor-pointer border border-white/20 ${service.special === 'gift'
                ? 'hover:shadow-xl transition-all duration-300 transform hover:scale-[1.08] active:scale-[0.95] hover:bg-white/20'
                : 'transition-colors duration-200'
                }`}>
                <div className={`${service.color} p-3 rounded-2xl mb-1 shadow-lg ${service.special === 'gift'
                  ? 'animate-pulse shadow-pink-300 ring-2 ring-pink-300 ring-opacity-50'
                  : ''
                  }`}>
                  <IconComponent size={24} className={`text-white drop-shadow-sm ${service.special === 'gift' ? 'animate-bounce filter drop-shadow-lg' : ''
                    }`} />
                </div>
                <span className={`text-xs text-center font-bold leading-tight ${service.special === 'gift' ? 'text-pink-300 animate-pulse' : 'text-white/70'
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

        {/* Section Marché Crypto - Temps réel */}
        <CryptoTicker />

        {/* Section Packs d'investissement */}
        <div className="mt-8 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">Packs d&apos;investissement</h2>
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm text-yellow-300 px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-yellow-500/30">
              {products.length} Packs
            </div>
          </div>

          <div className="space-y-4">
            {products.map((product) => {
              const profit = product.totalRevenue - product.price

              return (
                <div key={product.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">{product.name}</span>
                    <span className="text-white/40 text-xs font-medium">{product.level}</span>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden shadow-lg">
                      <Image src={product.image} alt={product.level} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                    </div>

                    <div className="flex-1 space-y-2">
                      <h3 className="text-white font-bold text-base">{product.name}</h3>
                      <div className="grid grid-cols-2 gap-2 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                        <div className="flex flex-col">
                          <span className="text-white/60 text-xs">Prix :</span>
                          <span className="text-blue-400 text-sm font-black">${product.price.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white/60 text-xs">Revenu :</span>
                          <span className="text-green-400 text-sm font-black">${product.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white/60 text-xs">Profit :</span>
                          <span className="text-yellow-400 text-sm font-black">+${profit.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white/60 text-xs">Durée :</span>
                          <span className="text-pink-400 text-sm font-black">⏱️ 2 heures</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex flex-col">
                      <span className="text-green-400 font-bold text-lg">${product.price.toLocaleString()}</span>
                      <span className="text-white/40 text-xs">{'\u2192'} ${product.totalRevenue.toLocaleString()} en 2h</span>
                    </div>
                    <button
                      onClick={() => handleRentClick(product.id)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                    >
                      <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent font-bold">Investir</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Navigation Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/20 px-4 py-2">
          <div className="flex justify-around items-center">
            <Link href="/" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-1 shadow-lg">
                <Home size={16} className="text-white" />
              </div>
              <span className="text-purple-400 text-xs font-semibold">Accueil</span>
            </Link>
            <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 border border-white/30">
                <BarChart3 size={16} className="text-white" />
              </div>
              <span className="text-white/70 text-xs">Produits</span>
            </Link>
            <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 border border-white/30">
                <UserCheck size={16} className="text-white" />
              </div>
              <span className="text-white/70 text-xs">Équipe</span>
            </Link>
            <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 border border-white/30">
                <User size={16} className="text-white" />
              </div>
              <span className="text-white/70 text-xs">Mon Compte</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Support Float */}
      <SupportFloat />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onRent={handleRent}
        userBalance={balance}
      />

      {/* Welcome Popup */}
      <WelcomePopup
        isOpen={showWelcomePopup}
        onClose={handleWelcomeClose}
        onTelegramJoin={handleTelegramJoin}
      />
    </div>
  )
}
