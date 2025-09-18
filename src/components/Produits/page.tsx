'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell } from 'lucide-react'
import Image from 'next/image'
import SupportFloat from '../SupportFloat/SupportFloat'
import ProductModal from '../ProductModal/ProductModal'
import { useAuth } from '@/contexts/AuthContext'
import { createRental, getUserRentals, RentalData } from '@/lib/rentals'
import { subscribeToUserBalance } from '@/lib/transactions'

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null)
  const [balance, setBalance] = useState(1000)
  const [userRentals, setUserRentals] = useState<RentalData[]>([])

  // S'abonner au solde en temps réel
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserBalance(currentUser.uid, (newBalance) => {
        setBalance(newBalance)
      })
      return () => unsubscribe()
    }
  }, [currentUser])

  // Charger les locations de l'utilisateur
  useEffect(() => {
    const loadUserRentals = async () => {
      if (currentUser) {
        try {
          const rentals = await getUserRentals(currentUser.uid)
          setUserRentals(rentals)
        } catch (error) {
          console.error('Erreur lors du chargement des locations:', error)
        }
      }
    }
    
    loadUserRentals()
  }, [currentUser])

  // Définir les produits par catégorie
  const currentProducts = activeTab === 'Fixe' ? ['LV1', 'LV2', 'LV3', 'LV4', 'LV5', 'LV6', 'LV7'] : []

  // Product data
  const products: ProductData[] = [
    {
      id: 'lv1',
      name: 'Titres à revenu fixe 1',
      level: 'LV1',
      price: 6000,
      originalPrice: 3000,
      dailyRevenue: 500,
      duration: 120,
      totalRevenue: 60000,
      image: '/p1.png',
      type: 'Fixé',
      vipLevel: 0,
      maxInvestment: 100,
      controls: 20,
      badge: 'Promo'
    },
    {
      id: 'lv2',
      name: 'Titres à revenu fixe 2',
      level: 'LV2',
      price: 15000,
      dailyRevenue: 1400,
      duration: 120,
      totalRevenue: 168000,
      image: '/p2.png',
      type: 'Fixé',
      vipLevel: 2,
      maxInvestment: 100,
      controls: 20,
      badge: 'Standard'
    },
    {
      id: 'lv3',
      name: 'Titres à revenu fixe 3',
      level: 'LV3',
      price: 35000,
      dailyRevenue: 3500,
      duration: 120,
      totalRevenue: 420000,
      image: '/p3.png',
      type: 'Fixé',
      vipLevel: 3,
      maxInvestment: 100,
      controls: 20,
      badge: 'Premium'
    },
    {
      id: 'lv4',
      name: 'Titres à revenu fixe 4',
      level: 'LV4',
      price: 80000,
      dailyRevenue: 8500,
      duration: 120,
      totalRevenue: 1020000,
      image: '/p4.png',
      type: 'Fixé',
      vipLevel: 4,
      maxInvestment: 100,
      controls: 20,
      badge: 'Gold'
    },
    {
      id: 'lv5',
      name: 'Titres à revenu fixe 5',
      level: 'LV5',
      price: 110000,
      dailyRevenue: 12000,
      duration: 120,
      totalRevenue: 1440000,
      image: '/p5.png',
      type: 'Fixé',
      vipLevel: 5,
      maxInvestment: 100,
      controls: 20,
      badge: 'Platinum'
    },
    {
      id: 'lv6',
      name: 'Titres à revenu fixe 6',
      level: 'LV6',
      price: 250000,
      dailyRevenue: 28500,
      duration: 120,
      totalRevenue: 3420000,
      image: '/p6.png',
      type: 'Fixé',
      vipLevel: 6,
      maxInvestment: 100,
      controls: 20,
      badge: 'Diamond'
    },
    {
      id: 'lv7',
      name: 'Titres à revenu fixe 7',
      level: 'LV7',
      price: 400000,
      dailyRevenue: 47000,
      duration: 120,
      totalRevenue: 5640000,
      image: '/p7.png',
      type: 'Fixé',
      vipLevel: 7,
      maxInvestment: 100,
      controls: 20,
      badge: 'Elite'
    }
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
      alert('Vous devez être connecté pour effectuer un investissement')
      return
    }

    const totalCost = product.price * quantity
    
    if (balance < totalCost) {
      alert(`Solde insuffisant. Vous avez ${balance.toLocaleString()} FCFA mais il faut ${totalCost.toLocaleString()} FCFA.`)
      return
    }
    
    try {
      const rentalId = await createRental(
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
      
      alert(`Investissement réussi ! ${quantity} x ${product.name} pour ${totalCost.toLocaleString()} FCFA. ID: ${rentalId.slice(-6)}`)
      
      // Recharger les locations de l'utilisateur
      const updatedRentals = await getUserRentals(currentUser.uid)
      setUserRentals(updatedRentals)
      
      // Le solde sera automatiquement mis à jour via subscribeToUserBalance
    } catch (error: any) {
      console.error('Erreur lors de l\'investissement:', error)
      alert(`Erreur: ${error.message || 'Impossible de traiter l\'investissement'}`)
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full shadow-xl border-2 border-white/20 flex items-center justify-center relative animate-pulse">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-95 animate-spin" style={{animationDuration: '10s'}}></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-white text-xs mb-0.5">🌍</div>
                  <span className="text-white font-bold text-[8px] leading-none">Global</span>
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">GLOBAL</h1>
                <p className="text-white/60 text-xs">Forfaits d'investissement</p>
              </div>
            </div>
            <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
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
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl'
                    : 'bg-black/30 backdrop-blur-sm text-white/70 hover:bg-black/40 border border-white/20'
                }`}
              >
                {tab === 'Fixe' ? '💰 Fixe' : '⚡ Activité'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products List */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-4 pb-20">
        {currentProducts.includes('LV1') && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV1</span>
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p1.png" alt="LV1" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-0 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
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
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/90 text-xs sm:text-sm font-black">Revenu estimé :</span>
                  <span className="text-green-400 text-xs sm:text-sm font-black">60 000 FCFA</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex flex-col">
              <span className="text-yellow-400 font-bold text-lg">6 000 FCFA</span>
              <span className="text-red-400 font-medium text-sm line-through decoration-2 decoration-red-400">3 000 FCFA</span>
            </div>
            <button 
              onClick={() => handleRentClick('lv1')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV2') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV2</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
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
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/90 text-xs sm:text-sm font-black">Revenu estimé :</span>
                  <span className="text-green-400 text-xs sm:text-sm font-black">168 000 FCFA</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">15 000 FCFA</span>
            <button 
              onClick={() => handleRentClick('lv2')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV3') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV3</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p3.png" alt="LV3" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Prix :</span>
                  <span className="text-blue-400 text-xs sm:text-sm font-black">35 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Par jour :</span>
                  <span className="text-purple-400 text-xs sm:text-sm font-black">+3 400 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Durée :</span>
                  <span className="text-pink-400 text-xs sm:text-sm font-black">120 jours</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/90 text-xs sm:text-sm font-black">Revenu estimé :</span>
                  <span className="text-green-400 text-xs sm:text-sm font-black">408 000 FCFA</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">35 000 FCFA</span>
            <button 
              onClick={() => handleRentClick('lv3')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV4') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV4</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
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
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/90 text-xs sm:text-sm font-black">Revenu estimé :</span>
                  <span className="text-green-400 text-xs sm:text-sm font-black">948 000 FCFA</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">80 000 FCFA</span>
            <button 
              onClick={() => handleRentClick('lv4')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV5') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV5</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p5.png" alt="LV5" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Prix :</span>
                  <span className="text-blue-400 text-xs sm:text-sm font-black">110 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Par jour :</span>
                  <span className="text-purple-400 text-xs sm:text-sm font-black">+10 800 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Durée :</span>
                  <span className="text-pink-400 text-xs sm:text-sm font-black">120 jours</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/90 text-xs sm:text-sm font-black">Revenu estimé :</span>
                  <span className="text-green-400 text-xs sm:text-sm font-black">1 296 000 FCFA</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">110 000 FCFA</span>
            <button 
              onClick={() => handleRentClick('lv5')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV6') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV6</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p6.png" alt="LV6" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-0 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
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
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/90 text-xs sm:text-sm font-black">Revenu estimé :</span>
                  <span className="text-green-400 text-xs sm:text-sm font-black">2 998 000 FCFA</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">250 000 FCFA</span>
            <button 
              onClick={() => handleRentClick('lv6')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV7') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV7</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p7.png" alt="LV7" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Prix :</span>
                  <span className="text-blue-400 text-xs sm:text-sm font-black">400 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Par jour :</span>
                  <span className="text-purple-400 text-xs sm:text-sm font-black">+38 500 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Durée :</span>
                  <span className="text-pink-400 text-xs sm:text-sm font-black">120 jours</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/90 text-xs sm:text-sm font-black">Revenu estimé :</span>
                  <span className="text-green-400 text-xs sm:text-sm font-black">4 620 000 FCFA</span>
                </div>
              </div>
              
              
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">400 000 FCFA</span>
            <button 
              onClick={() => handleRentClick('lv7')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Louer Maintenant
            </button>
          </div>
        </div>
        )}


        {/* Section Activité - Afficher les produits loués */}
        {activeTab === 'Activité' && userRentals.map((rental) => (
          <div key={rental.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative shadow-md">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">{rental.productName}</span>
              <span className="text-white/60 text-xs">
                {rental.status === 'active' ? '🟢 Actif' : '🔴 Terminé'}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Quantité:</span>
                <span className="text-white font-medium">{rental.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Coût total:</span>
                <span className="text-green-400 font-bold">FCFA{rental.totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Revenus quotidiens:</span>
                <span className="text-blue-400 font-medium">FCFA{rental.dailyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Date de début:</span>
                <span className="text-white/80">{rental.startDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Date de fin:</span>
                <span className="text-white/80">{rental.endDate.toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">Revenus attendus:</span>
                <span className="text-yellow-400 font-bold">FCFA{rental.totalExpectedRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state pour Activité */}
        {activeTab === 'Activité' && userRentals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/70 text-lg mb-2">Aucun investissement actif</div>
            <div className="text-white/50 text-sm">Vos produits loués apparaîtront ici</div>
          </div>
        )}

        {/* Empty state pour Fixe */}
        {activeTab === 'Fixe' && currentProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/70 text-lg mb-2">Aucun produit disponible</div>
            <div className="text-white/50 text-sm">dans la catégorie {activeTab}</div>
          </div>
        )}
      </main>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-t border-white/10 px-4 py-2">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">🏠</span>
            </div>
            <span className="text-white/70 text-xs">Accueil</span>
          </Link>
          <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">📊</span>
            </div>
            <span className="text-purple-400 text-xs font-medium">Produits</span>
          </Link>
          <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👥</span>
            </div>
            <span className="text-white/70 text-xs">Équipe</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👤</span>
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
        />
      )}

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
