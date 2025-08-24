'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface WelcomePopupProps {
  isOpen: boolean
  onClose: () => void
  onTelegramJoin?: () => void
}

export default function WelcomePopup({ isOpen, onClose, onTelegramJoin }: WelcomePopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleTelegramJoin = () => {
    if (onTelegramJoin) {
      onTelegramJoin()
    }
    // Open Telegram link
    window.open('https://t.me/your_telegram_group', '_blank')
    handleClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className={`
        relative bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto
        transform transition-all duration-300 ease-out
        ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
      `}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 z-10"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-6 pt-12">
          {/* Welcome Items */}
          <div className="space-y-4 mb-6">
            {/* Bonus d'inscription */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                <span className="text-lg">🎁</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                <span className="font-bold text-green-600">1000 FCFA</span> bonus d'inscription a été envoyé à votre compte 
                et vous pouvez l'utiliser pour un retrait
              </p>
            </div>

            {/* Cycle d'investissement */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                <span className="text-lg">💎</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Le cycle d'investissement représente le temps de cycle, 
                mais vous pouvez demander un retrait chaque jour
              </p>
            </div>

            {/* Investissement Waffarm */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                <span className="text-lg">🎁</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                L'investissement dans les dispositifs waffarm rapporte en 90 jours, 
                représentant le temps pour un revenu continu, et vous recevez un revenu chaque jour, 
                vous pouvez retirer de l'argent chaque jour.
              </p>
            </div>

            {/* À propos de Waffarm */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                <span className="text-lg">🌟</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Waffarm est l'une des plus grandes entreprises d'élevage et 
                d'agriculture propre au monde
              </p>
            </div>

            {/* Parrainage */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                <span className="text-lg">🎁</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Invitez des amis pour obtenir une récompense en argent de 
                <span className="font-bold text-blue-600"> 25% du montant du dépôt de l'ami</span>
              </p>
            </div>

            {/* Retrait quotidien */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                <span className="text-lg">🏆</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Le revenu d'investissement peut être retiré quotidiennement
              </p>
            </div>

            {/* Horaires de retrait */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Retrait de lundi à dimanche à toute heure
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Confirmer Button */}
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                         text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 
                         transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Confirmer
            </button>

            {/* Telegram Button */}
            <button
              onClick={handleTelegramJoin}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                         text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 
                         transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl
                         flex items-center justify-center space-x-2"
            >
              <span>📱</span>
              <span>Rejoindre le groupe Telegram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
