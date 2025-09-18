'use client'
import { useState } from 'react'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

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

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: ProductData | null
  onRent: (product: ProductData, quantity: number) => void
}

export default function ProductModal({ isOpen, onClose, product, onRent }: ProductModalProps) {
  const { userData } = useAuth()
  const [quantity, setQuantity] = useState(1)

  if (!isOpen || !product) return null

  const totalPrice = product.price * quantity
  const totalDailyRevenue = product.dailyRevenue * quantity
  const totalExpectedRevenue = product.totalRevenue * quantity

  const handleRent = () => {
    onRent(product, quantity)
    onClose()
  }

  const incrementQuantity = () => {
    if (quantity < product.maxInvestment) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold text-center">Liste des Investissements</h2>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-4">
          {/* Product Header */}
          <div className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center overflow-hidden">
              <Image src={product.image} alt={product.name} width={48} height={48} className="object-cover w-full h-full" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{product.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="bg-orange-400 text-white px-2 py-1 rounded text-xs font-medium">
                  {product.vipLevel} VIP{product.vipLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Prix Unitaire</span>
              <span className="font-bold text-blue-600">FCFA{product.price.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenu</span>
              <span className="font-bold text-gray-800">{product.duration}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenu Quotidien</span>
              <span className="font-bold text-blue-600">FCFA{product.dailyRevenue.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenu Total</span>
              <span className="font-bold text-blue-600">FCFA{product.totalRevenue.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nombre de contrôles</span>
              <span className="font-bold text-gray-800">{product.controls}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Investissement Maximum</span>
              <span className="font-bold text-gray-800">{product.maxInvestment}</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Part à Acheter</span>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={16} />
                </button>
                <span className="font-bold text-lg min-w-[2rem] text-center">{quantity}</span>
                <button 
                  onClick={incrementQuantity}
                  disabled={quantity >= product.maxInvestment}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Montant à Payer</span>
              <span className="font-bold text-blue-600">FCFA{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Expected Returns */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenu Total Attendu</span>
              <span className="font-bold text-green-600">FCFA{totalExpectedRevenue.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleRent}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Investir Maintenant
          </button>
        </div>
      </div>
    </div>
  )
}
