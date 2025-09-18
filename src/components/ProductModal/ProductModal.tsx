'use client'
import { useState } from 'react'
import { X, ChevronUp, ChevronDown, CheckCircle, XCircle, AlertTriangle, Wallet } from 'lucide-react'
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
  onRent: (product: ProductData, quantity: number) => Promise<void>
  userBalance: number
}

export default function ProductModal({ isOpen, onClose, product, onRent, userBalance }: ProductModalProps) {
  const { userData } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [investmentResult, setInvestmentResult] = useState<'success' | 'error' | 'insufficient_balance' | null>(null)
  const [resultMessage, setResultMessage] = useState('')

  if (!isOpen || !product) return null

  const totalPrice = product.price * quantity

  const handleRent = () => {
    setShowConfirmation(true)
  }

  const confirmInvestment = async () => {
    // Vérifier le solde avant de procéder
    if (userBalance < totalPrice) {
      setInvestmentResult('insufficient_balance')
      setResultMessage(`Vous avez ${userBalance.toLocaleString()} FCFA mais il faut ${totalPrice.toLocaleString()} FCFA pour cet investissement.`)
      setTimeout(() => {
        setInvestmentResult(null)
        setShowConfirmation(false)
      }, 4000)
      return
    }

    try {
      await onRent(product, quantity)
      setInvestmentResult('success')
      setResultMessage(`Investissement réussi ! ${quantity} x ${product.name} pour ${totalPrice.toLocaleString()} FCFA`)
      setTimeout(() => {
        onClose()
        setShowConfirmation(false)
        setInvestmentResult(null)
      }, 3000)
    } catch (error: any) {
      setInvestmentResult('error')
      setResultMessage(error.message || 'Erreur lors de l\'investissement')
      setTimeout(() => {
        setInvestmentResult(null)
        setShowConfirmation(false)
      }, 4000)
    }
  }

  const cancelInvestment = () => {
    setShowConfirmation(false)
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

  // Popup de confirmation/résultat
  if (showConfirmation || investmentResult) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/20 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
          {investmentResult ? (
            <div className="text-center space-y-4">
              {investmentResult === 'success' ? (
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              ) : investmentResult === 'insufficient_balance' ? (
                <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-orange-400" />
                </div>
              ) : (
                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              )}
              <h3 className={`text-xl font-bold ${
                investmentResult === 'success' ? 'text-green-400' : 
                investmentResult === 'insufficient_balance' ? 'text-orange-400' : 'text-red-400'
              }`}>
                {investmentResult === 'success' ? 'Investissement Réussi !' : 
                 investmentResult === 'insufficient_balance' ? 'Solde Insuffisant' : 'Investissement Échoué'}
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">{resultMessage}</p>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Confirmer l'Investissement</h3>
                <p className="text-white/80 text-sm mb-4">
                  Voulez-vous investir {quantity} x {product.name} pour {totalPrice.toLocaleString()} FCFA ?
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={cancelInvestment}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all duration-200 border border-white/20"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmInvestment}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-medium transition-all duration-200 shadow-lg"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white p-6 rounded-t-3xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200 transform hover:scale-110"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold text-center bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
            Détails de l'Investissement
          </h2>
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-6">
          {/* Product Header */}
          <div className="flex items-center space-x-4 bg-gray-50 backdrop-blur-sm p-4 rounded-2xl border border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
              <Image src={product.image} alt={product.name} width={64} height={64} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  {product.level}
                </span>
                {product.badge && (
                  <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {product.badge}
                  </span>
                )}
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
              <span className="text-gray-600">Durée</span>
              <span className="font-bold text-gray-800">{product.duration} jours</span>
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
