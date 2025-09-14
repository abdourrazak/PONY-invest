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

export default function Login() {
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
      const result = await loginUser(formData.phone, formData.password)
      
      if (result.success && result.user) {
        localStorage.setItem('userPhone', formData.phone)
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userId', result.user.uid)
        
        try {
          const userDoc = await getDoc(doc(db, 'users', result.user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            if (userData?.referralCode) {
              const userKey = userData.numeroTel
              const existingCode = localStorage.getItem(`userReferralCode_${userKey}`)
              if (!existingCode || existingCode !== userData.referralCode) {
                localStorage.setItem(`userReferralCode_${userKey}`, userData.referralCode)
              }
            }
          }
        } catch (error) {
          console.log('⚠️ Erreur récupération code Firestore:', error)
        }
        
        localStorage.removeItem('hasSeenWelcome')
        setShowWelcomePopup(true)
      } else {
        const message = result.error || 'Numéro de téléphone ou mot de passe incorrect'
        setErrorMessage(message)
        setShowErrorPopup(true)
        setErrors({ password: message })
        
        setTimeout(() => setShowErrorPopup(false), 4000)
      }
    } catch (error) {
      console.error('Erreur connexion:', error)
      const message = 'Erreur de connexion. Vérifiez votre connexion internet.'
      setErrorMessage(message)
      setShowErrorPopup(true)
      setErrors({ password: message })
      
      setTimeout(() => setShowErrorPopup(false), 4000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
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

        <div className="w-full max-w-md bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          <div className="bg-black/30 backdrop-blur-sm p-4 text-center border-b border-white/10">
            <h1 className="text-lg font-black text-white/90 mb-1">Connexion</h1>
            <p className="text-white/70 text-xs font-bold">Accédez à votre compte Global</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="flex items-center text-white/90 font-black mb-1 text-sm">
                <Smartphone className="w-3 h-3 mr-1" />
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="6XXXXXXXX"
                style={{ fontSize: '16px' }}
                className={`w-full px-3 py-2.5 rounded-lg border transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium bg-white/90 backdrop-blur-sm ${
                  errors.phone 
                    ? 'border-red-400' 
                    : 'border-white/30 focus:border-blue-400 focus:bg-white'
                } focus:outline-none shadow-sm`}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1 font-bold">{errors.phone}</p>}
              <p className="text-blue-400 text-xs mt-1 font-bold">Format: 6XXXXXXXX</p>
            </div>

            <div>
              <label className="flex items-center text-white/90 font-black mb-1 text-sm">
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
                  className={`w-full px-3 py-2.5 pr-10 rounded-lg border transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium bg-white/90 backdrop-blur-sm ${
                    errors.password 
                      ? 'border-red-400' 
                      : 'border-white/30 focus:border-blue-400 focus:bg-white'
                  } focus:outline-none shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1 font-bold">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-sm rounded-lg font-black text-white transition-all duration-300 transform ${
                isLoading
                  ? 'bg-gray-600/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:scale-[1.02] active:scale-[0.98]'
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

            <div className="text-center pt-3 border-t border-white/10">
              <p className="text-white/70 text-sm font-bold">
                Pas encore de compte ?{' '}
                <Link 
                  href={searchParams.get('ref') ? `/register-auth?ref=${searchParams.get('ref')}` : '/register-auth'} 
                  className="text-blue-400 font-black hover:text-blue-300 transition-colors"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 max-w-md w-full">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <h3 className="font-bold text-white/90 mb-3 text-center">🎯 Accès à votre compte</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Vos investissements
              </div>
              <div className="flex items-center text-blue-400">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Historique des gains
              </div>
              <div className="flex items-center text-purple-400">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Système de parrainage
              </div>
              <div className="flex items-center text-orange-400">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Retraits sécurisés
              </div>
            </div>
          </div>
        </div>
      </div>

      <WelcomePopup 
        isOpen={showWelcomePopup}
        onClose={() => {
          setShowWelcomePopup(false)
          router.push('/')
        }}
        onTelegramJoin={() => {
          console.log('User joined Telegram group from login')
        }}
      />
    </div>
  )
}
