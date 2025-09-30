'use client'
import { useState, useEffect } from 'react'
import { X, ChevronUp, ChevronDown, CheckCircle, XCircle, AlertTriangle, Wallet, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { validateInvestment } from '@/lib/investmentRules'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'

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
  const { userData, currentUser } = useAuth()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [investmentResult, setInvestmentResult] = useState<'success' | 'error' | 'insufficient_balance' | 'blocked' | null>(null)
  const [resultMessage, setResultMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [canInvest, setCanInvest] = useState(true)
  const [validationMessage, setValidationMessage] = useState('')
  const [nextAllowedLevel, setNextAllowedLevel] = useState<string | null>(null)

  // Valider l'investissement quand le modal s'ouvre ou le produit change
  useEffect(() => {
    if (isOpen && product && currentUser) {
      validateInvestmentRules()
    }
  }, [isOpen, product, currentUser])

  const validateInvestmentRules = async () => {
    if (!currentUser || !product) return

    try {
      const validation = await validateInvestment(currentUser.uid, product.id, product.price * quantity)
      setCanInvest(validation.canInvest)
      setValidationMessage(validation.message)
      setNextAllowedLevel(validation.nextAllowedLevel || null)
    } catch (error) {
      console.error('Erreur validation:', error)
      setCanInvest(false)
      setValidationMessage('Erreur lors de la validation')
    }
  }

  if (!isOpen || !product) return null

  const totalPrice = product.price * quantity

  const handleRent = () => {
    setShowConfirmation(true)
  }

  const confirmInvestment = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    
    try {
      await onRent(product, quantity)
      setInvestmentResult('success')
      setResultMessage(`Investissement réussi ! ${quantity} x ${product.name} pour ${totalPrice.toLocaleString()} FCFA`)
      
      setTimeout(() => {
        onClose()
        setShowConfirmation(false)
        setInvestmentResult(null)
        setIsProcessing(false)
        // Redirection fluide vers la section Activité
        router.push('/produits?tab=Activité')
      }, 1500)
    } catch (error: any) {
      console.error('Erreur investissement:', error)
      
      if (error.message && error.message.includes('solde insuffisant')) {
        setInvestmentResult('insufficient_balance')
        setResultMessage(`Solde insuffisant. Vous avez ${userBalance.toLocaleString()} FCFA mais il faut ${totalPrice.toLocaleString()} FCFA.`)
      } else {
        setInvestmentResult('error')
        setResultMessage(error.message || 'Erreur lors de l\'investissement')
      }
      
      setTimeout(() => {
        setInvestmentResult(null)
        setShowConfirmation(false)
        setIsProcessing(false)
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

  // Affichage du résultat
  if (investmentResult) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 border border-white/20 rounded-3xl max-w-md w-full p-8 relative shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200 transform hover:scale-110"
          >
            <X size={20} className="text-white" />
          </button>
          
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center">
              {investmentResult === 'success' && (
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              )}
              {investmentResult === 'error' && (
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              )}
              {investmentResult === 'insufficient_balance' && (
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-yellow-400" />
                </div>
              )}
              {investmentResult === 'blocked' && (
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-red-400" />
                </div>
              )}
            </div>
            
            <div>
              <h3 className={`text-xl font-bold mb-2 ${
                investmentResult === 'success' ? 'text-green-400' :
                investmentResult === 'error' || investmentResult === 'blocked' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {investmentResult === 'success' ? 'Investissement Réussi !' :
                 investmentResult === 'error' ? 'Erreur d\'Investissement' :
                 investmentResult === 'blocked' ? 'Investissement Bloqué' : 'Solde Insuffisant'}
              </h3>
              <p className="text-white/80 text-sm">
                {resultMessage}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Affichage de confirmation
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 border border-white/20 rounded-3xl max-w-md w-full p-8 relative shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200 transform hover:scale-110"
          >
            <X size={20} className="text-white" />
          </button>
          
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
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-medium transition-all duration-200 shadow-lg disabled:opacity-50"
              >
                {isProcessing ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
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
              <NextImage src={product.image} alt={product.name} width={64} height={64} className="object-cover w-full h-full" />
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

          {/* User Balance */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-medium">💰 Votre Solde</span>
              <span className="font-bold text-blue-800 text-lg">FCFA{userBalance.toLocaleString()}</span>
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
              <span className={`font-bold text-lg ${userBalance >= totalPrice ? 'text-green-600' : 'text-red-600'}`}>
                FCFA{totalPrice.toLocaleString()}
              </span>
            </div>
            
            {userBalance < totalPrice && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                ⚠️ Solde insuffisant. Il vous manque FCFA{(totalPrice - userBalance).toLocaleString()}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button 
            onClick={handleRent}
            disabled={userBalance < totalPrice || isProcessing || !canInvest}
            className={`w-full py-3 rounded-xl font-medium transition-all duration-200 transform shadow-lg ${
              userBalance >= totalPrice && !isProcessing && canInvest
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 active:scale-95' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing 
              ? 'Traitement...' 
              : !canInvest
                ? 'Investissement Bloqué'
                : userBalance >= totalPrice 
                  ? 'Investir Maintenant' 
                  : 'Solde Insuffisant'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
