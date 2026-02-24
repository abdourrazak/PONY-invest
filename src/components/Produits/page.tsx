'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Home, BarChart3, UserCheck, User } from 'lucide-react'
import Image from 'next/image'
import SupportFloat from '../SupportFloat/SupportFloat'
import ProductModal from '../ProductModal/ProductModal'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToUserBalance } from '@/lib/transactions'
import { createRental, collectRentalEarnings, getUserRentals, RentalData } from '@/lib/rentals'

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

export default function ProduitsPage() {
  const { userData, currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('Fixe')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab === 'Activité') {
      setActiveTab('Activité')
    }
  }, [])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null)
  const [balance, setBalance] = useState(1000)
  const [userRentals, setUserRentals] = useState<RentalData[]>([])

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserBalance(currentUser.uid, (newBalance) => {
        setBalance(newBalance)
      })
      return () => unsubscribe()
    }
  }, [currentUser])

  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          const rentals = await getUserRentals(currentUser.uid)
          setUserRentals(rentals)
        } catch (error) {
          console.error('❌ Erreur lors du chargement des données utilisateur:', error)
        }
      }
    }
    loadUserData()
  }, [currentUser])

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

  // Calculer le temps restant en heures/minutes
  const getTimeRemaining = (rental: RentalData) => {
    const now = new Date()
    const startDate = new Date(rental.startDate)
    const endDate = new Date(startDate.getTime() + (rental.duration * 60 * 60 * 1000))
    const remaining = endDate.getTime() - now.getTime()
    if (remaining <= 0) return { hours: 0, minutes: 0, expired: true }
    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
    return { hours, minutes, expired: false }
  }

  // Calculer les revenus accumulés
  const getAccumulatedRevenue = (rental: RentalData) => {
    const now = new Date()
    const lastCollectionDate = (rental as any).lastCollectionDate || rental.startDate
    let referenceDate: Date
    if (lastCollectionDate?.toDate) {
      referenceDate = lastCollectionDate.toDate()
    } else if (lastCollectionDate instanceof Date) {
      referenceDate = lastCollectionDate
    } else {
      referenceDate = new Date(lastCollectionDate)
    }

    let startDate: Date
    if ((rental.startDate as any)?.toDate) {
      startDate = (rental.startDate as any).toDate()
    } else if (rental.startDate instanceof Date) {
      startDate = rental.startDate
    } else {
      startDate = new Date(rental.startDate)
    }

    // Durée en heures
    const endDate = new Date(startDate.getTime() + (rental.duration * 60 * 60 * 1000))
    if (now > endDate) {
      // Investissement terminé, calculer le revenu total restant à collecter
      const hoursTotal = rental.duration
      const revenuePerHour = rental.dailyRevenue / rental.duration
      const hoursFromLastCollection = Math.min(
        hoursTotal,
        (endDate.getTime() - referenceDate.getTime()) / (60 * 60 * 1000)
      )
      return Math.max(0, Math.floor(hoursFromLastCollection * revenuePerHour * rental.quantity))
    }

    // En cours - calculer le revenu proportionnel
    const elapsed = (now.getTime() - referenceDate.getTime()) / (60 * 60 * 1000) // heures écoulées
    const revenuePerHour = rental.dailyRevenue / rental.duration
    return Math.max(0, Math.floor(elapsed * revenuePerHour * rental.quantity))
  }

  // Calculer le pourcentage de progression
  const getProgressPercentage = (rental: RentalData): number => {
    const now = new Date()
    const startDate = new Date(rental.startDate)
    const totalDuration = rental.duration * 60 * 60 * 1000
    const elapsed = now.getTime() - startDate.getTime()
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
  }

  // Obtenir le nom crypto du produit
  const getProductName = (productId: string): string => {
    const product = products.find(p => p.id === productId.toLowerCase())
    return product?.name || productId.toUpperCase()
  }

  // Couleur par produit
  const getProductColor = (productId: string): string => {
    const colors: { [key: string]: string } = {
      'lv1': 'from-orange-500 to-yellow-500',
      'lv2': 'from-blue-500 to-cyan-500',
      'lv3': 'from-yellow-500 to-orange-500',
      'lv4': 'from-purple-500 to-violet-500',
      'lv5': 'from-gray-500 to-slate-500',
      'lv6': 'from-amber-500 to-yellow-500',
      'lv7': 'from-green-500 to-emerald-500'
    }
    return colors[productId.toLowerCase()] || 'from-gray-500 to-gray-600'
  }

  // Collecter les gains
  const handleCollectEarnings = async (rental: RentalData) => {
    if (!currentUser) return
    try {
      const accumulatedRevenue = getAccumulatedRevenue(rental)
      if (accumulatedRevenue <= 0) {
        alert('Aucun gain à collecter pour le moment')
        return
      }
      await collectRentalEarnings(currentUser.uid, rental.id, accumulatedRevenue)
      await new Promise(resolve => setTimeout(resolve, 500))
      const updatedRentals = await getUserRentals(currentUser.uid)
      setUserRentals(updatedRentals)
      alert(`✅ Collecte réussie ! $${accumulatedRevenue.toLocaleString()} ajoutés à votre solde.`)
    } catch (error: any) {
      console.error('❌ Erreur lors de la collecte:', error)
      alert(`Erreur lors de la collecte: ${error.message}`)
    }
  }

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
      const updatedRentals = await getUserRentals(currentUser.uid)
      setUserRentals(updatedRentals)
      setTimeout(() => { setActiveTab('Activité') }, 500)
    } catch (error: any) {
      console.error('Erreur lors de l\'investissement:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-white/10">
                <ArrowLeft size={20} />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full shadow-xl border-2 border-white/20 flex items-center justify-center relative overflow-hidden">
                <Image src="/ponyAI.png" alt="PONY AI" width={40} height={40} className="object-cover w-full h-full rounded-full" unoptimized />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">PONY</h1>
                <p className="text-white/60 text-xs">Packs d&apos;investissement</p>
              </div>
            </div>
            <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200">
              <Bell size={18} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-sm px-4 py-3 sticky top-0 z-10 border-b border-white/10">
        <div className="max-w-md mx-auto">
          <div className="flex space-x-3 mb-4">
            {['Fixe', 'Activité'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg ${activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl'
                    : 'bg-black/30 backdrop-blur-sm text-white/70 hover:bg-black/40 border border-white/20'
                  }`}
              >
                {tab === 'Fixe' ? '💰 Packs' : '⚡ Activité'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products List */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-4 pb-20">

        {/* Onglet Fixe — Cartes Produits dynamiques */}
        {activeTab === 'Fixe' && products.map((product) => {
          const profit = product.totalRevenue - product.price
          return (
            <div key={product.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">{product.name}</span>
                <span className="text-white/40 text-xs font-medium">{product.level}</span>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden shadow-lg">
                  <Image src={product.image} alt={product.name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                </div>

                <div className="flex-1 space-y-2">
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

        {/* Section Activité - Investissements actifs */}
        {activeTab === 'Activité' && (
          <>
            {userRentals.length > 0 ? (
              <div className="space-y-4">
                {userRentals.map((rental, index) => {
                  const timeLeft = getTimeRemaining(rental)
                  return (
                    <div key={`${rental.productId}-${index}`} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative shadow-md">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`bg-gradient-to-r ${getProductColor(rental.productId)} text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg`}>
                          {getProductName(rental.productId)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${timeLeft.expired
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                          }`}>
                          {timeLeft.expired ? '✅ Terminé' : '🔵 Actif'}
                        </span>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className={`w-14 h-14 bg-gradient-to-br ${getProductColor(rental.productId)} rounded-2xl flex-shrink-0 shadow-lg border-2 border-white/20 flex items-center justify-center`}>
                          <span className="text-white text-lg font-black">{getProductName(rental.productId)}</span>
                        </div>

                        <div className="flex-1 space-y-2">
                          <h3 className="text-white font-bold text-sm">{rental.productName}</h3>
                          <div className="grid grid-cols-2 gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                            <div className="flex flex-col">
                              <span className="text-white/60 text-xs">Revenu total :</span>
                              <span className="text-green-400 text-xs font-black">${rental.dailyRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white/60 text-xs">Temps restant :</span>
                              <span className="text-purple-400 text-xs font-black">
                                {timeLeft.expired ? 'Terminé' : `${timeLeft.hours}h ${timeLeft.minutes}min`}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white/60 text-xs">Accumulés :</span>
                              <span className="text-blue-400 text-xs font-black">${getAccumulatedRevenue(rental).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white/60 text-xs">Investissement :</span>
                              <span className="text-yellow-400 text-xs font-black">${rental.unitPrice.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Barre de progression */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-white/70">Progression</span>
                              <span className="text-purple-400 font-bold">{getProgressPercentage(rental).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-black/30 rounded-full h-2">
                              <div
                                className="h-full bg-gradient-to-r from-green-400 to-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${getProgressPercentage(rental)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleCollectEarnings(rental)}
                          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                        >
                          🎯 Collecter ${getAccumulatedRevenue(rental).toLocaleString()}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-white/70 text-lg mb-2">Aucun investissement actif</div>
                <div className="text-white/50 text-sm">Vos investissements apparaîtront ici</div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-t border-white/10 px-4 py-2">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1 border border-white/30">
              <Home size={16} className="text-white" />
            </div>
            <span className="text-white/70 text-xs">Accueil</span>
          </Link>
          <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-all duration-200 transform hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-1 shadow-lg">
              <BarChart3 size={16} className="text-white" />
            </div>
            <span className="text-purple-400 text-xs font-semibold">Produits</span>
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

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRent={handleRent}
          userBalance={balance}
        />
      )}

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
