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
      console.log('🎉 WelcomePopup: Opening popup')
      setIsVisible(true)
    } else {
      console.log('❌ WelcomePopup: Popup closed')
    }
  }, [isOpen])

  useEffect(() => {
    console.log('🔍 WelcomePopup mounted, isOpen:', isOpen)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleTelegramJoin = () => {
    if (onTelegramJoin) {
      onTelegramJoin()
    }
    // Ne plus rediriger vers Telegram, juste fermer le popup
    handleClose()
  }

  if (!isOpen) {
    console.log('❌ WelcomePopup: Not rendering, isOpen =', isOpen)
    return null
  }

  console.log('✅ WelcomePopup: Rendering popup, isVisible =', isVisible)

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-lg transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div 
        className={`
          relative bg-black/20 backdrop-blur-sm border border-white/10
          rounded-3xl max-w-xs sm:max-w-sm w-full max-h-[85vh] overflow-y-auto
          transform transition-all duration-300 ease-out
          ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
        `}
        style={{ 
          position: 'relative',
          zIndex: 10000,
          display: 'block',
          visibility: 'visible'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 text-white/70 hover:text-red-400 hover:bg-white/10 
                     rounded-full transition-all duration-200 z-10"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 rounded-t-3xl p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
            <span className="text-2xl">🎉</span>
          </div>
          <h2 className="text-white/90 font-black text-lg">Bienvenue !</h2>
          <p className="text-white/70 text-sm font-bold">Découvrez vos avantages</p>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Welcome Items */}
          <div className="space-y-3 mb-5">
            {/* Bonus d'inscription */}
            <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="w-8 h-8 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 border border-green-400/30">
                <span className="text-base">🎁</span>
              </div>
              <div>
                <p className="text-white/90 text-xs font-bold">
                  <span className="font-black text-green-400">1000 FCFA</span> bonus d'inscription
                </p>
                <p className="text-white/70 text-xs">Utilisable pour retrait</p>
              </div>
            </div>

            {/* Parrainage */}
            <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="w-8 h-8 bg-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 border border-blue-400/30">
                <span className="text-base">👥</span>
              </div>
              <div>
                <p className="text-white/90 text-xs font-bold">Parrainage</p>
                <p className="text-white/70 text-xs">
                  <span className="font-black text-blue-400">25%</span> du dépôt de l'ami
                </p>
              </div>
            </div>

            {/* Retrait quotidien */}
            <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="w-8 h-8 bg-purple-500/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 border border-purple-400/30">
                <span className="text-base">💰</span>
              </div>
              <div>
                <p className="text-white/90 text-xs font-bold">Retraits quotidiens</p>
                <p className="text-white/70 text-xs">7j/7 à toute heure</p>
              </div>
            </div>

            {/* PONY */}
            <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="w-8 h-8 bg-orange-500/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 border border-orange-400/30">
                <span className="text-base">🌟</span>
              </div>
              <div>
                <p className="text-white/90 text-xs font-bold">Investissement PONY</p>
                <p className="text-white/70 text-xs">Revenus en 90 jours</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* Confirmer Button */}
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                         text-white font-black py-2.5 px-4 rounded-xl transition-all duration-200 
                         transform hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              ✅ Confirmer
            </button>

            {/* Telegram Button */}
            <button
              onClick={handleTelegramJoin}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
                         text-white font-black py-2.5 px-4 rounded-xl transition-all duration-200 
                         transform hover:scale-[1.02] active:scale-[0.98]
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
