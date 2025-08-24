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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className={`
        relative bg-gradient-to-br from-white via-gray-50 to-blue-50 
        rounded-3xl shadow-2xl border border-gray-200/50
        max-w-xs sm:max-w-sm w-full max-h-[85vh] overflow-y-auto
        transform transition-all duration-300 ease-out
        ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
      `}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 
                     rounded-full transition-all duration-200 z-10"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-t-3xl p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎉</span>
          </div>
          <h2 className="text-white font-bold text-lg">Bienvenue !</h2>
          <p className="text-white/90 text-sm">Découvrez vos avantages</p>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Welcome Items */}
          <div className="space-y-3 mb-5">
            {/* Bonus d'inscription */}
            <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-xl border-l-4 border-green-500">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-base">🎁</span>
              </div>
              <div>
                <p className="text-gray-800 text-xs font-medium">
                  <span className="font-bold text-green-600">1000 FCFA</span> bonus d'inscription
                </p>
                <p className="text-gray-600 text-xs">Utilisable pour retrait</p>
              </div>
            </div>

            {/* Parrainage */}
            <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-xl border-l-4 border-blue-500">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-base">👥</span>
              </div>
              <div>
                <p className="text-gray-800 text-xs font-medium">Parrainage</p>
                <p className="text-gray-600 text-xs">
                  <span className="font-bold text-blue-600">25%</span> du dépôt de l'ami
                </p>
              </div>
            </div>

            {/* Retrait quotidien */}
            <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-xl border-l-4 border-purple-500">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-base">💰</span>
              </div>
              <div>
                <p className="text-gray-800 text-xs font-medium">Retraits quotidiens</p>
                <p className="text-gray-600 text-xs">7j/7 à toute heure</p>
              </div>
            </div>

            {/* Waffarm */}
            <div className="flex items-center space-x-3 bg-orange-50 p-3 rounded-xl border-l-4 border-orange-500">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-base">🌟</span>
              </div>
              <div>
                <p className="text-gray-800 text-xs font-medium">Investissement Waffarm</p>
                <p className="text-gray-600 text-xs">Revenus en 90 jours</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* Confirmer Button */}
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                         text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 
                         transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-sm"
            >
              ✅ Confirmer
            </button>

            {/* Telegram Button */}
            <button
              onClick={handleTelegramJoin}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                         text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 
                         transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl
                         flex items-center justify-center space-x-2 text-sm"
            >
              <span>📱</span>
              <span>Rejoindre Telegram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
