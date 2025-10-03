'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Home, BarChart3, UserCheck, User } from 'lucide-react'
import Image from 'next/image'
import SupportFloat from '../SupportFloat/SupportFloat'
import ProductModal from '../ProductModal/ProductModal'
import { useAuth } from '@/contexts/AuthContext'
import { checkLV1Discount } from '@/lib/firebaseAuth'
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

  // Gérer l'onglet depuis l'URL
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
  const [hasLV1Discount, setHasLV1Discount] = useState(false)

  // S'abonner au solde en temps réel
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserBalance(currentUser.uid, (newBalance) => {
        setBalance(newBalance)
      })
      return () => unsubscribe()
    }
  }, [currentUser])

  // Charger les locations de l'utilisateur et vérifier la réduction LV1
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          console.log('🔍 Chargement des locations pour utilisateur:', currentUser.uid)
          
          // Charger les locations
          const rentals = await getUserRentals(currentUser.uid)
          console.log('📊 Locations récupérées:', rentals)
          console.log('📊 Nombre de locations:', rentals.length)
          
          setUserRentals(rentals)
          
          // Vérifier la réduction LV1
          const discount = await checkLV1Discount(currentUser.uid)
          setHasLV1Discount(discount)
        } catch (error) {
          console.error('❌ Erreur lors du chargement des données utilisateur:', error)
        }
      }
    }
    loadUserData()
  }, [currentUser])

  // Définir les produits par catégorie
  const currentProducts = activeTab === 'Fixe' ? ['LV1', 'LV2', 'LV3', 'LV4', 'LV5', 'LV6', 'LV7'] : []
  
  // Filtrer les locations actives pour l'onglet Activité
  const activeRentals = userRentals.filter(rental => {
    const now = new Date()
    const startDate = new Date(rental.startDate)
    const endDate = new Date(rental.endDate)
    return now >= startDate && now <= endDate && rental.status === 'active'
  })

  // Calculer les jours restants pour une location
  const getDaysRemaining = (rental: RentalData): number => {
    const now = new Date()
    const startDate = new Date(rental.startDate)
    const endDate = new Date(startDate.getTime() + (rental.duration * 24 * 60 * 60 * 1000))
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    return Math.max(0, daysRemaining)
  }

  // Fonction pour calculer les revenus accumulés depuis la dernière collecte
  const getAccumulatedRevenue = (rental: RentalData) => {
    const now = new Date()
    
    // Utiliser la dernière date de collecte ou la date de début si jamais collecté
    const lastCollectionDate = (rental as any).lastCollectionDate || rental.startDate
    
    // Convertir en Date si c'est un Timestamp Firestore
    let referenceDate: Date
    if (lastCollectionDate?.toDate) {
      referenceDate = lastCollectionDate.toDate()
    } else if (lastCollectionDate instanceof Date) {
      referenceDate = lastCollectionDate
    } else {
      referenceDate = new Date(lastCollectionDate)
    }
    
    // Convertir startDate en Date
    let startDate: Date
    if ((rental.startDate as any)?.toDate) {
      startDate = (rental.startDate as any).toDate()
    } else if (rental.startDate instanceof Date) {
      startDate = rental.startDate
    } else {
      startDate = new Date(rental.startDate)
    }
    
    const daysElapsed = Math.floor((now.getTime() - referenceDate.getTime()) / (24 * 60 * 60 * 1000))
    const effectiveDays = Math.max(0, daysElapsed)
    
    // Vérifier que l'investissement n'est pas expiré
    const endDate = new Date(startDate.getTime() + (rental.duration * 24 * 60 * 60 * 1000))
    if (now > endDate) {
      return 0 // Investissement terminé
    }
    
    const accumulated = effectiveDays * rental.dailyRevenue * rental.quantity
    console.log('💰 Revenus accumulés calculés:', {
      daysElapsed,
      effectiveDays,
      dailyRevenue: rental.dailyRevenue,
      quantity: rental.quantity,
      accumulated
    })
    
    return accumulated
  }

  // Calculer le pourcentage de progression
  const getProgressPercentage = (rental: RentalData): number => {
    const now = new Date()
    const startDate = new Date(rental.startDate)
    const totalDuration = rental.duration * 24 * 60 * 60 * 1000 // en millisecondes
    const elapsed = now.getTime() - startDate.getTime()
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
  }

  // Fonction pour obtenir l'image du produit
  const getProductImage = (productId: string): string => {
    const productImages: { [key: string]: string } = {
      'lv1': '💎',
      'lv2': '🏆', 
      'lv3': '👑',
      'lv4': '🌟',
      'lv5': '💰',
      'lv6': '🔥',
      'lv7': '⚡'
    }
    return productImages[productId.toLowerCase()] || '💰'
  }

  // Fonction pour obtenir la couleur du produit
  const getProductColor = (productId: string): string => {
    const productColors: { [key: string]: string } = {
      'lv1': 'from-blue-500 to-cyan-500',
      'lv2': 'from-green-500 to-emerald-500', 
      'lv3': 'from-purple-500 to-violet-500',
      'lv4': 'from-yellow-500 to-orange-500',
      'lv5': 'from-pink-500 to-rose-500',
      'lv6': 'from-red-500 to-orange-600',
      'lv7': 'from-indigo-500 to-purple-600'
    }
    return productColors[productId.toLowerCase()] || 'from-gray-500 to-gray-600'
  }

  // Fonction pour collecter les gains journaliers
  const handleCollectEarnings = async (rental: RentalData) => {
    if (!currentUser) return
    
    try {
      const accumulatedRevenue = getAccumulatedRevenue(rental)
      if (accumulatedRevenue <= 0) {
        alert('Aucun gain à collecter pour le moment')
        return
      }

      console.log('🎯 Début de la collecte des gains:', {
        productName: rental.productName,
        accumulatedRevenue,
        rentalId: rental.id
      })

      // Collecter les gains via la fonction Firestore
      await collectRentalEarnings(currentUser.uid, rental.id, accumulatedRevenue)
      
      // Attendre un peu pour que Firestore se mette à jour
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Recharger les données utilisateur pour voir la mise à jour
      const updatedRentals = await getUserRentals(currentUser.uid)
      setUserRentals(updatedRentals)
      
      // Forcer le rafraîchissement de l'affichage
      console.log('🔄 Rentals mis à jour:', updatedRentals.length)
      
      // Le solde sera automatiquement mis à jour via subscribeToUserBalance
      
      alert(`✅ Collecte réussie ! ${accumulatedRevenue.toLocaleString()} FCFA ajoutés à votre solde.`)
      console.log('✅ Collecte terminée avec succès')
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la collecte:', error)
      alert(`Erreur lors de la collecte: ${error.message}`)
    }
  }

  // Product data avec logique de réduction LV1
  const products: ProductData[] = [
    {
      id: 'lv1',
      name: 'Titres à revenu fixe 1',
      level: 'LV1',
      price: hasLV1Discount ? 3000 : 6000, // Prix réduit si 20+ amis inscrits
      originalPrice: hasLV1Discount ? 6000 : 3000, // Prix original inversé
      dailyRevenue: 500,
      duration: 120,
      totalRevenue: 60000,
      image: '/p1.jpg',
      type: 'Fixé',
      vipLevel: 0,
      maxInvestment: 100,
      controls: 20,
      badge: hasLV1Discount ? 'Réduction Parrain' : 'Promo'
    },
    {
      id: 'lv2',
      name: 'Titres à revenu fixe 2',
      level: 'LV2',
      price: 15000,
      dailyRevenue: 1400,
      duration: 120,
      totalRevenue: 168000,
      image: '/p2.jpg',
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
      image: '/p3.JPG',
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
      image: '/p4.JPG',
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
      image: '/p5.JPG',
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
      image: '/p6.JPG',
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
      image: '/p7.jpg',
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
      throw new Error('Vous devez être connecté pour effectuer un investissement')
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
      
      console.log('✅ Investissement créé avec succès, ID:', rentalId)
      
      // Recharger les locations de l'utilisateur
      console.log('🔄 Rechargement des locations après investissement...')
      const updatedRentals = await getUserRentals(currentUser.uid)
      console.log('📊 Locations après investissement:', updatedRentals)
      console.log('📊 Nouveau nombre de locations:', updatedRentals.length)
      
      setUserRentals(updatedRentals)
      
      // Rediriger vers l'onglet Activité après un court délai
      setTimeout(() => {
        setActiveTab('activity')
      }, 500)
      
      // Le solde sera automatiquement mis à jour via subscribeToUserBalance
    } catch (error: any) {
      console.error('Erreur lors de l\'investissement:', error)
      throw error // Re-lancer l'erreur pour que le modal puisse l'afficher
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
            <span className={`text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
              hasLV1Discount 
                ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-500' 
                : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700'
            }`}>
              {hasLV1Discount ? 'Réduction Obtenue ✅' : 'Promo'}
            </span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p1.jpg" alt="LV1" width={64} height={64} className="object-cover w-full h-full" unoptimized />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-0 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/90 text-xs sm:text-sm font-black">Prix :</span>
                  <span className="text-blue-400 text-xs sm:text-sm font-black">
                    {hasLV1Discount ? '3 000 FCFA' : '6 000 FCFA'}
                  </span>
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
              {hasLV1Discount ? (
                <>
                  <span className="text-green-400 font-bold text-lg">3 000 FCFA</span>
                  <span className="text-red-400 font-medium text-sm line-through decoration-2 decoration-red-400">6 000 FCFA</span>
                </>
              ) : (
                <>
                  <span className="text-green-400 font-bold text-lg">3 000 FCFA</span>
                  <span className="text-red-400 font-medium text-sm line-through decoration-2 decoration-red-400">6 000 FCFA</span>
                </>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              {!hasLV1Discount && (
                <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-3 text-center">
                  <p className="text-orange-300 text-xs font-medium">
                    💡 Invitez 20 amis pour débloquer ce prix !
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    Prix actuel : 6,000 FCFA
                  </p>
                </div>
              )}
              <button 
                onClick={() => handleRentClick('lv1')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent font-bold">Louer Maintenant</span>
              </button>
            </div>
          </div>
        </div>
        )}

        {currentProducts.includes('LV2') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV2</span>
            <span className="bg-gradient-to-r from-green-400 to-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p2.jpg" alt="LV2" width={64} height={64} className="object-cover w-full h-full" unoptimized />
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
            <span className="bg-gradient-to-r from-green-400 to-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p3.JPG" alt="LV3" width={64} height={64} className="object-cover w-full h-full" />
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
            <span className="bg-gradient-to-r from-green-400 to-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p4.JPG" alt="LV4" width={64} height={64} className="object-cover w-full h-full" />
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
            <span className="bg-gradient-to-r from-green-400 to-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p5.JPG" alt="LV5" width={64} height={64} className="object-cover w-full h-full" />
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
            <span className="bg-gradient-to-r from-green-400 to-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p6.JPG" alt="LV6" width={64} height={64} className="object-cover w-full h-full" />
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
            <span className="bg-gradient-to-r from-green-400 to-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p7.jpg" alt="LV7" width={64} height={64} className="object-cover w-full h-full" />
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



        {/* Section Activité - Locations actives */}
        {activeTab === 'Activité' && (
          <>
            {userRentals.length > 0 ? (
              <div className="space-y-4">
                {userRentals.map((rental, index) => (
                  <div key={`${rental.productId}-${index}`} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative shadow-md">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`bg-gradient-to-r ${getProductColor(rental.productId)} text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg`}>
                        {rental.productId.toUpperCase()}
                      </span>
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                        🔵 Actif
                      </span>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className={`w-16 h-16 bg-gradient-to-br ${getProductColor(rental.productId)} rounded-2xl flex-shrink-0 overflow-hidden shadow-lg border-2 border-white/20`}>
                        <div className="w-full h-full flex items-center justify-center text-white text-2xl">
                          {getProductImage(rental.productId)}
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <h3 className="text-white font-bold text-sm">{rental.productName}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                          <div className="flex justify-between sm:flex-col sm:items-center">
                            <span className="text-white/90 text-xs sm:text-sm font-black">Revenus/jour :</span>
                            <span className="text-green-400 text-xs sm:text-sm font-black">+{rental.dailyRevenue.toLocaleString()} FCFA</span>
                          </div>
                          <div className="flex justify-between sm:flex-col sm:items-center">
                            <span className="text-white/90 text-xs sm:text-sm font-black">Jours restants :</span>
                            <span className="text-purple-400 text-xs sm:text-sm font-black">{getDaysRemaining(rental)} jours</span>
                          </div>
                          <div className="flex justify-between sm:flex-col sm:items-center">
                            <span className="text-white/90 text-xs sm:text-sm font-black">Revenus accumulés :</span>
                            <span className="text-blue-400 text-xs sm:text-sm font-black">{getAccumulatedRevenue(rental).toLocaleString()} FCFA</span>
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
                              className="h-full bg-gradient-to-r from-green-400 to-purple-600 rounded-full"
                              style={{ width: `${getProgressPercentage(rental)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex flex-col">
                        <span className="text-yellow-400 font-bold text-lg">
                          {(rental.quantity * rental.dailyRevenue).toLocaleString()} FCFA/jour
                        </span>
                        <span className="text-white/60 text-sm">
                          Quantité: {rental.quantity}x
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCollectEarnings(rental)}
                        className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                      >
                        🎯 Collecter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-white/70 text-lg mb-2">Aucun investissement actif</div>
                <div className="text-white/50 text-sm">Vos produits loués apparaîtront ici</div>
              </div>
            )}
          </>
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
