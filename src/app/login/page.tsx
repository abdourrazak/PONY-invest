'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import WelcomePopup from '@/components/WelcomePopup/WelcomePopup'
import { Eye, EyeOff, Smartphone, Lock, ArrowRight } from 'lucide-react'
import { loginUser } from '@/lib/firebaseAuth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)

  // Debug state changes
  useEffect(() => {
    console.log('🔍 Login: showWelcomePopup state changed to:', showWelcomePopup)
  }, [showWelcomePopup])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.phone) {
      newErrors.phone = 'Le numéro de téléphone est requis'
    } else if (!/^6[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'Format: 6XXXXXXXX'
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Connexion avec Firebase Auth + Firestore
      const result = await loginUser(formData.phone, formData.password)
      
      if (result.success && result.user) {
        // Sauvegarder les données de connexion
        localStorage.setItem('userPhone', formData.phone)
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userId', result.user.uid)
        
        // Récupérer le code d'invitation permanent depuis Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', result.user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            // Sauvegarder le code de parrainage depuis Firestore - PERMANENT
            if (userData?.referralCode) {
              const userKey = userData.numeroTel
              const existingCode = localStorage.getItem(`userReferralCode_${userKey}`)
              if (!existingCode || existingCode !== userData.referralCode) {
                localStorage.setItem(`userReferralCode_${userKey}`, userData.referralCode)
                console.log('✅ Code de parrainage permanent sauvegardé:', userData.referralCode)
              } else {
                console.log('✅ Code de parrainage déjà présent:', existingCode)
              }
            }
          }
        } catch (error) {
          console.log('⚠️ Erreur récupération code Firestore:', error)
        }
        
        // Vérifier si c'est une première connexion pour afficher le popup
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
        console.log('🔍 Login: hasSeenWelcome =', hasSeenWelcome)
        
        if (!hasSeenWelcome) {
          console.log('🎉 Login: Showing welcome popup')
          // Effacer d'abord hasSeenWelcome pour être sûr
          localStorage.removeItem('hasSeenWelcome')
          // Forcer l'affichage immédiat du popup
          setShowWelcomePopup(true)
          console.log('🎉 Login: Popup state set to true')
        } else {
          console.log('🏠 Login: Redirecting to home (welcome already seen)')
          // Rediriger vers l'accueil
          router.push('/')
        }
      } else {
        // Afficher popup d'erreur
        const message = result.error || 'Numéro de téléphone ou mot de passe incorrect'
        setErrorMessage(message)
        setShowErrorPopup(true)
        setErrors({ password: message })
        
        // Masquer le popup après 4 secondes
        setTimeout(() => setShowErrorPopup(false), 4000)
      }
    } catch (error) {
      console.error('Erreur connexion:', error)
      const message = 'Erreur de connexion. Vérifiez votre connexion internet.'
      setErrorMessage(message)
      setShowErrorPopup(true)
      setErrors({ password: message })
      
      // Masquer le popup après 4 secondes
      setTimeout(() => setShowErrorPopup(false), 4000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-green-400/10 to-purple-400/10 animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-400 via-green-400 to-blue-500 rounded-full shadow-2xl border-4 border-white flex items-center justify-center relative animate-pulse">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-blue-500 opacity-95 animate-spin" style={{animationDuration: '10s'}}></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-white text-2xl mb-1">🌍</div>
              <span className="text-white font-bold text-sm leading-none">Global</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
            Connexion à Global
          </div>
        </div>

        {/* Error Popup */}
        {showErrorPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-200 animate-pulse">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-500 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Connexion échouée</h3>
                <p className="text-gray-600 text-sm mb-6">{errorMessage}</p>
                <button
                  onClick={() => setShowErrorPopup(false)}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-4 text-center">
            <h1 className="text-lg font-black text-white mb-1">Connexion</h1>
            <p className="text-green-100 text-xs font-bold">Accédez à votre compte Global</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Phone Field */}
            <div>
              <label className="flex items-center text-blue-700 font-black mb-1 text-sm">
                <Smartphone className="w-3 h-3 mr-1" />
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="6XXXXXXXX"
                style={{ fontSize: '16px' }}
                className={`w-full px-3 py-2.5 rounded-lg border-2 transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium ${
                  errors.phone 
                    ? 'border-red-400 bg-red-50 shadow-red-100' 
                    : 'border-blue-300 bg-white focus:border-blue-500 focus:bg-blue-50 shadow-blue-100'
                } focus:outline-none focus:ring-1 focus:ring-blue-300 shadow-sm`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold">{errors.phone}</p>}
              <p className="text-blue-500 text-xs mt-1 font-bold">Format: 6XXXXXXXX</p>
            </div>

            {/* Password Field */}
            <div>
              <label className="flex items-center text-blue-700 font-black mb-1 text-sm">
                <Lock className="w-3 h-3 mr-1" />
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Votre mot de passe"
                  style={{ fontSize: '16px' }}
                  className={`w-full px-3 py-2.5 pr-10 rounded-lg border-2 transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium ${
                    errors.password 
                      ? 'border-red-400 bg-red-50 shadow-red-100' 
                      : 'border-blue-300 bg-white focus:border-blue-500 focus:bg-blue-50 shadow-blue-100'
                  } focus:outline-none focus:ring-1 focus:ring-blue-300 shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-sm rounded-lg font-black text-white transition-all duration-300 transform ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
              } flex items-center justify-center`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                <div className="flex items-center">
                  Se connecter
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center pt-3 border-t border-gray-200">
              <p className="text-gray-600 text-sm font-bold">
                Pas encore de compte ?{' '}
                <Link 
                  href={searchParams.get('ref') ? `/register-auth?ref=${searchParams.get('ref')}` : '/register-auth'} 
                  className="text-blue-600 font-black hover:text-blue-700 transition-colors"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Benefits */}
        <div className="mt-8 max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50">
            <h3 className="font-bold text-gray-800 mb-3 text-center">🎯 Accès à votre compte</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Vos investissements
              </div>
              <div className="flex items-center text-blue-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Historique des gains
              </div>
              <div className="flex items-center text-purple-700">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Système de parrainage
              </div>
              <div className="flex items-center text-orange-700">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Retraits sécurisés
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Popup */}
      <WelcomePopup 
        isOpen={showWelcomePopup}
        onClose={() => {
          setShowWelcomePopup(false)
          localStorage.setItem('hasSeenWelcome', 'true')
          router.push('/')
        }}
        onTelegramJoin={() => {
          console.log('User joined Telegram group from login')
        }}
      />
    </div>
  )
}
