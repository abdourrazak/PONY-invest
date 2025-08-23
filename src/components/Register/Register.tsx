'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Smartphone, Lock, Users, ArrowRight } from 'lucide-react'
import { registerUser, isReferralCodeValid } from '@/lib/firebaseAuth'

export default function Register() {
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
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isValidReferral, setIsValidReferral] = useState<boolean | null>(null)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }))
      // Validation asynchrone du code de parrainage
      const validateCode = async () => {
        console.log('🔍 Validation code URL:', refCode)
        const isValid = await isReferralCodeValid(refCode)
        console.log('📋 Résultat validation URL:', isValid)
        setIsValidReferral(isValid)
      }
      validateCode()
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    // Validation téléphone
    if (!formData.phone) {
      newErrors.phone = 'Le numéro de téléphone est requis'
    } else if (!/^6[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'Format: 6XXXXXXXX'
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    }

    // Validation confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmez votre mot de passe'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    // Validation code d'invitation - Pas de validation d'erreur pour les codes d'URL
    const hasReferralFromURL = !!searchParams.get('ref')
    if (!hasReferralFromURL && formData.referralCode && isValidReferral === false) {
      newErrors.referralCode = 'Code d\'invitation invalide'
    }
    // Les codes d'URL sont toujours considérés comme valides pour la validation du formulaire

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      console.log('🚀 Début inscription avec:', {
        phone: formData.phone,
        referralCode: formData.referralCode,
        hasReferralFromURL: !!searchParams.get('ref'),
        urlRef: searchParams.get('ref')
      })
      
      // Forcer l'utilisation du code d'URL si présent
      const finalReferralCode = searchParams.get('ref') || formData.referralCode || undefined
      console.log('🎯 Code final utilisé pour inscription:', finalReferralCode)
      
      // Inscription avec Firebase Auth + Firestore
      const result = await registerUser(
        formData.phone,
        formData.password,
        finalReferralCode
      )
      
      console.log('📋 Résultat inscription:', result)
      
      if (result.success && result.user) {
        console.log('✅ Inscription réussie, sauvegarde localStorage')
        
        // Sauvegarder les données utilisateur
        localStorage.setItem('userPhone', formData.phone)
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userId', result.user.uid)
        
        // Générer et sauvegarder le code d'invitation permanent
        const generatePermanentCode = (uid: string) => {
          let hash = 0
          for (let i = 0; i < uid.length; i++) {
            const char = uid.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
          }
          
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
          let code = ''
          let absHash = Math.abs(hash)
          
          for (let i = 0; i < 8; i++) {
            code += chars[absHash % chars.length]
            absHash = Math.floor(absHash / chars.length)
          }
          
          return code
        }
        
        const userReferralCode = generatePermanentCode(result.user.uid)
        localStorage.setItem('userReferralCode', userReferralCode)
        
        console.log('🏠 Redirection vers accueil')
        // Rediriger vers l'accueil
        router.push('/')
      } else {
        console.log('❌ Inscription échouée:', result.error)
        console.log('🔍 Debug - Code utilisé:', finalReferralCode)
        console.log('🔍 Debug - Code d\'URL:', searchParams.get('ref'))
        console.log('🔍 Debug - Code du formulaire:', formData.referralCode)
        
        // Afficher les détails d'erreur pour le debug mobile
        let message = result.error || 'Erreur lors de l\'inscription. Veuillez réessayer.'
        
        // Ajouter des détails pour aider au debug
        if (searchParams.get('ref')) {
          message = `Erreur: ${result.error || 'Inconnue'}\nCode URL: ${searchParams.get('ref')}\nCode final: ${finalReferralCode}`
        }
        
        // Afficher popup d'erreur avec détails
        setErrorMessage(message)
        setShowErrorPopup(true)
        setErrors({ referralCode: message })
        
        // Masquer le popup après 4 secondes
        setTimeout(() => setShowErrorPopup(false), 4000)
      }
    } catch (error) {
      console.error('💥 Erreur inscription catch:', error)
      const message = 'Erreur lors de l\'inscription. Vérifiez votre connexion internet.'
      setErrorMessage(message)
      setShowErrorPopup(true)
      setErrors({ referralCode: message })
      
      // Masquer le popup après 4 secondes
      setTimeout(() => setShowErrorPopup(false), 4000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Validation en temps réel pour le code d'invitation
    if (field === 'referralCode') {
      if (value) {
        const validateCode = async () => {
          const isValid = await isReferralCodeValid(value)
          console.log('🔍 Validation code:', value, 'Résultat:', isValid)
          setIsValidReferral(isValid)
        }
        validateCode()
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
                Code d'invitation {searchParams.get('ref') ? <span className="text-red-500 ml-1">*</span> : <span className="text-gray-500 ml-1">(optionnel)</span>}
              </label>
              <input
                type="text"
                value={formData.referralCode}
                onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
                placeholder={searchParams.get('ref') ? "Code d'invitation requis" : "Code d'invitation (optionnel)"}
                disabled={!!searchParams.get('ref')}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 text-gray-800 placeholder-gray-500 font-mono ${
                  searchParams.get('ref')
                    ? 'border-green-300 bg-green-50'
                    : errors.referralCode 
                      ? 'border-red-300 bg-red-50' 
                      : isValidReferral === true
                        ? 'border-green-300 bg-green-50'
                        : isValidReferral === false
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 bg-white focus:border-blue-500 focus:bg-white'
                } focus:outline-none focus:ring-2 focus:ring-blue-200 ${!!searchParams.get('ref') ? 'opacity-60' : ''}`}
              />
              {errors.referralCode && <p className="text-red-500 text-xs mt-1">{errors.referralCode}</p>}
              {searchParams.get('ref') && (
                <p className="text-green-600 text-xs mt-1">✅ Code d'invitation valide du lien</p>
              )}
              {!searchParams.get('ref') && isValidReferral === true && (
                <p className="text-green-600 text-xs mt-1">✅ Code d'invitation valide</p>
              )}
              {!searchParams.get('ref') && isValidReferral === false && formData.referralCode && (
                <p className="text-red-500 text-xs mt-1">❌ Code d'invitation invalide</p>
              )}
              {!searchParams.get('ref') && (
                <p className="text-blue-400 text-xs mt-1">Laissez vide si vous êtes le premier utilisateur</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (!searchParams.get('ref') && formData.referralCode && isValidReferral === false)}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 transform ${
                isLoading || (!searchParams.get('ref') && formData.referralCode && isValidReferral === false)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
              } flex items-center justify-center`}
            >
              {isLoading ? (
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
                Déjà un compte ?{' '}
                <Link 
                  href={searchParams.get('ref') ? `/login?ref=${searchParams.get('ref')}` : '/login'} 
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Connexion
                </Link>
              </p>
            </div>
          </form>
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

        {/* Error Popup */}
        {showErrorPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-200 animate-pulse">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-500 text-2xl">❌</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Inscription échouée</h3>
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
      </div>
    </div>
  )
}
