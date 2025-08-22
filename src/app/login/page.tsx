'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Smartphone, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)

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
      // Simuler la connexion
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Sauvegarder les données de connexion
      localStorage.setItem('userPhone', formData.phone)
      localStorage.setItem('isLoggedIn', 'true')
      
      // Rediriger vers l'accueil
      router.push('/')
    } catch (error) {
      console.error('Erreur connexion:', error)
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
            Bienvenue sur Global
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-6 text-center">
            <h1 className="text-2xl font-black text-white mb-2">Connexion</h1>
            <p className="text-green-100 text-sm">Accédez à votre compte Global</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Phone Field */}
            <div>
              <label className="flex items-center text-blue-700 font-semibold mb-2">
                <Smartphone className="w-4 h-4 mr-2" />
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="693098879"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 text-gray-800 placeholder-gray-500 ${
                  errors.phone 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-blue-200 bg-white focus:border-blue-500 focus:bg-white'
                } focus:outline-none focus:ring-2 focus:ring-blue-200`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              <p className="text-blue-400 text-xs mt-1">Format: 6XXXXXXXX</p>
            </div>

            {/* Password Field */}
            <div>
              <label className="flex items-center text-blue-700 font-semibold mb-2">
                <Lock className="w-4 h-4 mr-2" />
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-300 text-gray-800 placeholder-gray-500 ${
                    errors.password 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-blue-200 bg-white focus:border-blue-500 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 transform ${
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
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Pas encore de compte ?{' '}
                <Link href="/register-auth" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  S'inscrire
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
