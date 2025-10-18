'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Smartphone, Lock, ArrowRight, Users } from 'lucide-react'
import WelcomePopup from '../WelcomePopup/WelcomePopup'
import { registerUser, isReferralCodeValid } from '@/lib/firebaseAuth'
import PhoneInput from '@/components/PhoneInput/PhoneInput'

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
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)

  // Debug state changes
  useEffect(() => {
    console.log('🔍 Register: showWelcomePopup state changed to:', showWelcomePopup)
  }, [showWelcomePopup])

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
    } else {
      // Extraire le numéro local (sans indicatif pays)
      const localNumber = formData.phone.replace(/^\+\d+\s*/, '').trim()
      if (!/^6[0-9]{8}$/.test(localNumber)) {
        newErrors.phone = 'Format: 6XXXXXXXX'
      }
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
      console.log('🎯 Code final utilisé pour inscription:', {
        finalCode: finalReferralCode,
        urlRef: searchParams.get('ref'),
        formRef: formData.referralCode,
        finalCodeType: typeof finalReferralCode
      })
      
      // Extraire le numéro local pour l'inscription
      const localNumber = formData.phone.replace(/^\+\d+\s*/, '').trim()
      
      // Inscription avec Firebase Auth + Firestore
      const result = await registerUser(
        localNumber,
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
        
        // Le code d'invitation est déjà généré et sauvegardé dans Firestore lors de l'inscription
        // Récupérer le code depuis les données utilisateur retournées
        if (result.user.referralCode) {
          const userKey = result.user.numeroTel
          localStorage.setItem(`userReferralCode_${userKey}`, result.user.referralCode)
          console.log('✅ Code d\'invitation sauvegardé:', result.user.referralCode)
        }
        console.log('🏠 Redirection vers accueil')
        // Afficher popup de bienvenue pour chaque inscription
        console.log('🎉 Register: Showing welcome popup (every registration)')
        // Toujours effacer hasSeenWelcome pour forcer l'affichage
        localStorage.removeItem('hasSeenWelcome')
        // Afficher le popup à chaque inscription
        setShowWelcomePopup(true)
        console.log('🎉 Register: Popup state set to true')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-400 via-green-400 to-blue-500 rounded-full shadow-2xl border-4 border-white flex items-center justify-center relative animate-pulse overflow-hidden">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-blue-500 opacity-95 animate-spin" style={{animationDuration: '10s'}}></div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <Image src="/ponyAI.png" alt="PONY AI" width={80} height={80} className="object-cover w-full h-full rounded-full" unoptimized />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white px-6 py-3 rounded-full text-base font-extrabold shadow-lg tracking-wide">
            Rejoins l'aventure PONY
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="bg-black/30 backdrop-blur-sm p-6 text-center border-b border-white/10">
            <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Créer un compte PONY</h1>
            <p className="text-white/80 text-sm font-semibold">Rejoignez notre plateforme d'investissement</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Phone Field */}
            <div>
              <label className="flex items-center text-white font-bold mb-2.5 text-sm tracking-wide">
                <Smartphone className="w-4 h-4 mr-2" />
                <span className="font-extrabold">Numéro de téléphone</span>
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                placeholder="Numéro de téléphone"
                className={errors.phone ? 'border-red-400' : ''}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1 font-bold">{errors.phone}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="flex items-center text-white font-bold mb-2.5 text-sm tracking-wide">
                <Lock className="w-4 h-4 mr-2" />
                <span className="font-extrabold">Mot de passe</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Minimum 6 caractères"
                  style={{ fontSize: '16px' }}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border transition-all duration-300 text-white placeholder-white/50 font-semibold bg-black/20 backdrop-blur-sm ${
                    errors.password 
                      ? 'border-red-400' 
                      : 'border-white/30 focus:border-blue-400 focus:bg-black/30'
                  } focus:outline-none shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white/90"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1 font-bold">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="flex items-center text-white font-bold mb-2.5 text-sm tracking-wide">
                <Lock className="w-4 h-4 mr-2" />
                <span className="font-extrabold">Confirmation du mot de passe</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  style={{ fontSize: '16px' }}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border transition-all duration-300 text-white placeholder-white/50 font-semibold bg-black/20 backdrop-blur-sm ${
                    errors.confirmPassword 
                      ? 'border-red-400' 
                      : 'border-white/30 focus:border-blue-400 focus:bg-black/30'
                  } focus:outline-none shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white/90"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 font-bold">{errors.confirmPassword}</p>}
            </div>

            {/* Referral Code Field */}
            <div>
              <label className="flex items-center text-white font-bold mb-2.5 text-sm tracking-wide">
                <Users className="w-4 h-4 mr-2" />
                <span className="font-extrabold">Code d'invitation</span>
                {searchParams.get('ref') ? <span className="text-red-400 ml-1.5 font-black">*</span> : <span className="text-white/60 ml-1.5 font-semibold text-xs">(optionnel)</span>}
              </label>
              <input
                type="text"
                value={formData.referralCode}
                onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
                placeholder={searchParams.get('ref') ? "Code d'invitation requis" : "PONY... (optionnel)"}
                disabled={!!searchParams.get('ref')}
                style={{ fontSize: '16px' }}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 text-white placeholder-white/50 font-mono font-bold bg-black/20 backdrop-blur-sm ${
                  searchParams.get('ref')
                    ? 'border-green-400 bg-green-500/10 text-white/90'
                    : errors.referralCode 
                      ? 'border-red-400' 
                      : isValidReferral === true
                        ? 'border-green-400 bg-green-500/10 text-white/90'
                        : isValidReferral === false
                          ? 'border-red-400'
                          : 'border-white/30 focus:border-blue-400 focus:bg-black/30'
                } focus:outline-none shadow-sm ${!!searchParams.get('ref') ? 'opacity-60' : ''}`}
              />
              {errors.referralCode && <p className="text-red-400 text-xs mt-1 font-bold">{errors.referralCode}</p>}
              {searchParams.get('ref') && (
                <p className="text-green-400 text-xs mt-1 font-bold">✅ Code d'invitation valide du lien</p>
              )}
              {!searchParams.get('ref') && isValidReferral === true && (
                <p className="text-green-400 text-xs mt-1 font-bold">✅ Code d'invitation valide</p>
              )}
              {!searchParams.get('ref') && isValidReferral === false && formData.referralCode && (
                <p className="text-red-400 text-xs mt-1 font-bold">❌ Code d'invitation invalide</p>
              )}
              {!searchParams.get('ref') && (
                <p className="text-blue-400 text-xs mt-1 font-bold">Laissez vide si vous êtes le premier utilisateur</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (!searchParams.get('ref') && formData.referralCode && isValidReferral === false)}
              className={`w-full py-3.5 text-base rounded-xl font-black text-white transition-all duration-300 transform shadow-lg ${
                isLoading || (!searchParams.get('ref') && formData.referralCode && isValidReferral === false)
                  ? 'bg-gray-600/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:scale-[1.02] active:scale-[0.98]'
              } flex items-center justify-center`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span className="font-extrabold tracking-wide">Création en cours...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="font-extrabold tracking-wide">S'inscrire</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-5 border-t border-white/10 mt-6">
              <p className="text-white/80 text-sm font-semibold">
                Déjà un compte ?{' '}
                <Link 
                  href={searchParams.get('ref') ? `/login?ref=${searchParams.get('ref')}` : '/login'} 
                  className="text-blue-400 font-extrabold hover:text-blue-300 transition-colors underline decoration-2 underline-offset-2"
                >
                  Connexion
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Benefits */}
        <div className="mt-8 max-w-md w-full">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <h3 className="font-extrabold text-white text-base mb-4 text-center tracking-wide">🎁 Avantages de l'inscription</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-green-400">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2.5 flex-shrink-0"></span>
                <span className="font-semibold">Solde de départ : 1000 FCFA</span>
              </div>
              <div className="flex items-center text-blue-400">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2.5 flex-shrink-0"></span>
                <span className="font-semibold">Récompenses quotidiennes</span>
              </div>
              <div className="flex items-center text-purple-400">
                <span className="w-2.5 h-2.5 bg-purple-500 rounded-full mr-2.5 flex-shrink-0"></span>
                <span className="font-semibold">Système de parrainage</span>
              </div>
              <div className="flex items-center text-orange-400">
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full mr-2.5 flex-shrink-0"></span>
                <span className="font-semibold">Investissements rentables</span>
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
                <h3 className="text-xl font-extrabold text-gray-800 mb-3 tracking-tight">Inscription échouée</h3>
                <p className="text-gray-600 text-sm font-medium mb-6 leading-relaxed">{errorMessage}</p>
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

        {/* Welcome Popup */}
        <WelcomePopup 
          isOpen={showWelcomePopup}
          onClose={() => {
            setShowWelcomePopup(false)
            // Ne plus sauvegarder hasSeenWelcome pour permettre l'affichage répétitif
            console.log('🔒 Register: Popup closed, redirecting to home')
            router.push('/')
          }}
          onTelegramJoin={() => {
            console.log('User joined Telegram group from register')
          }}
        />
      </div>
    </div>
  )
}
