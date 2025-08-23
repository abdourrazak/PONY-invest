'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Gift, Eye, EyeOff, Smartphone, Lock, Users, ArrowRight } from 'lucide-react'
import { initializeUserIfNeeded, isReferralCodeValid, createUserWithReferral } from '@/utils/referral'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidReferral, setIsValidReferral] = useState<boolean | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [requiresReferral, setRequiresReferral] = useState(false)

  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }))
      setIsValidReferral(isReferralCodeValid(refCode))
      setRequiresReferral(true)
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis'
    } else if (!/^6[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'Format: 6XXXXXXXX'
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmez votre mot de passe'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    
    // Code d'invitation optionnel pour l'administrateur (premier utilisateur)
    if (formData.referralCode && !isReferralCodeValid(formData.referralCode)) {
      newErrors.referralCode = 'Code d\'invitation invalide'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
    if (!validateForm()) return
    
    setIsRegistering(true)
    
    try {
      // Simuler l'inscription
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Créer l'utilisateur (code d'invitation optionnel)
      const success = createUserWithReferral({
        phone: formData.phone,
        password: formData.password,
        referredBy: formData.referralCode || undefined
      })
      
      if (success) {
        // Sauvegarder les données utilisateur
        localStorage.setItem('userPhone', formData.phone)
        localStorage.setItem('isLoggedIn', 'true')
        
        // Rediriger vers l'accueil
        router.push('/')
      } else {
        setErrors({ referralCode: 'Erreur lors de l\'inscription. Code d\'invitation invalide.' })
      }
    } catch (error) {
      console.error('Erreur inscription:', error)
      setErrors({ referralCode: 'Erreur lors de l\'inscription. Veuillez réessayer.' })
    } finally {
      setIsRegistering(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Validation en temps réel pour le code de parrainage
    if (field === 'referralCode') {
      if (value) {
        setIsValidReferral(isReferralCodeValid(value))
      } else {
        setIsValidReferral(null)
      }
    }
    
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
            Rejoins l'aventure Global
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-6 text-center">
            <h1 className="text-2xl font-black text-white mb-2">Créer un compte Global</h1>
            <p className="text-green-100 text-sm">Rejoignez notre plateforme d'investissement</p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">

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
                placeholder=""
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
                  placeholder=""
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

            {/* Confirm Password Field */}
            <div>
              <label className="flex items-center text-blue-700 font-semibold mb-2">
                <Lock className="w-4 h-4 mr-2" />
                Confirmation du mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder=""
                  className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-300 text-gray-800 placeholder-gray-500 ${
                    errors.confirmPassword 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-blue-200 bg-white focus:border-blue-500 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Referral Code Field */}
            <div>
              <label className="flex items-center text-blue-700 font-semibold mb-2">
                <Users className="w-4 h-4 mr-2" />
                Code d'invitation <span className="text-gray-500 ml-1">(optionnel)</span>
              </label>
              <input
                type="text"
                value={formData.referralCode}
                onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
                placeholder="Code d'invitation (optionnel)"
                disabled={requiresReferral}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 text-gray-800 placeholder-gray-500 font-mono ${
                  errors.referralCode 
                    ? 'border-red-300 bg-red-50' 
                    : isValidReferral === true
                      ? 'border-green-300 bg-green-50'
                      : isValidReferral === false
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-white focus:border-blue-500 focus:bg-white'
                } focus:outline-none focus:ring-2 focus:ring-blue-200 ${requiresReferral ? 'opacity-60' : ''}`}
              />
              {errors.referralCode && <p className="text-red-500 text-xs mt-1">{errors.referralCode}</p>}
              {isValidReferral === true && (
                <p className="text-green-600 text-xs mt-1">✅ Code d'invitation valide</p>
              )}
              {isValidReferral === false && formData.referralCode && (
                <p className="text-red-500 text-xs mt-1">❌ Code d'invitation invalide</p>
              )}
              <p className="text-blue-400 text-xs mt-1">Laissez vide si vous êtes le premier utilisateur</p>
            </div>
            
            {/* Referral Info */}
            {requiresReferral && (
              <div className={`p-4 rounded-lg mb-6 ${
                isValidReferral 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  <Gift className={`mr-2 ${isValidReferral ? 'text-green-600' : 'text-red-600'}`} size={20} />
                  <span className={`font-medium ${isValidReferral ? 'text-green-800' : 'text-red-800'}`}>
                    {isValidReferral ? 'Invitation valide !' : 'Invitation invalide'}
                  </span>
                </div>
                <p className={`text-sm ${isValidReferral ? 'text-green-700' : 'text-red-700'}`}>
                  Code: <span className="font-mono font-bold">{formData.referralCode}</span>
                </p>
                {!isValidReferral && (
                  <p className="text-sm text-red-600 mt-1 font-medium">
                    ⚠️ Vous devez avoir un code d'invitation valide pour vous inscrire
                  </p>
                )}
                {isValidReferral && (
                  <p className="text-sm text-green-600 mt-1">
                    🎉 Vous bénéficierez d'avantages spéciaux !
                  </p>
                )}
              </div>
            )}
            
            {errors.general && (
              <div className="p-4 rounded-lg mb-6 bg-red-50 border border-red-200">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleRegister}
              disabled={isRegistering || isValidReferral === false}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 transform ${
                isRegistering || isValidReferral === false
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
              } flex items-center justify-center`}
            >
              {isRegistering ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Création en cours...
                </div>
              ) : (
                <div className="flex items-center">
                  S'inscrire
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Déjà un compte ? {' '}
                <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Connexion
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50">
            <h3 className="font-bold text-gray-800 mb-3 text-center">🎁 Avantages de l'inscription</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Solde de départ : 1000 FCFA
              </div>
              <div className="flex items-center text-blue-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Récompenses quotidiennes
              </div>
              <div className="flex items-center text-purple-700">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Système de parrainage
              </div>
              <div className="flex items-center text-orange-700">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Investissements rentables
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
