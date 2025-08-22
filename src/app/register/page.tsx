'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Gift } from 'lucide-react'
import { initializeUserIfNeeded, isReferralCodeValid, createUserWithReferral } from '@/utils/referral'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [isValidReferral, setIsValidReferral] = useState<boolean | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [requiresReferral, setRequiresReferral] = useState(false)

  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
      setIsValidReferral(isReferralCodeValid(refCode))
      setRequiresReferral(true)
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis'
    } else if (!/^\+?[0-9]{8,15}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Format de numéro invalide'
    }
    
    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    
    // Validation stricte du code de parrainage
    if (requiresReferral && !isValidReferral) {
      newErrors.referral = 'Code d\'invitation invalide. Vous ne pouvez pas vous inscrire sans un code valide.'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = () => {
    if (!validateForm()) return
    
    setIsRegistering(true)
    
    try {
      // Créer l'utilisateur avec le code de parrainage
      const success = createUserWithReferral({
        phone: phone.trim(),
        password,
        referredBy: isValidReferral ? referralCode : undefined
      })
      
      if (success) {
        // Rediriger vers l'accueil
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        setErrors({ general: 'Erreur lors de la création du compte' })
        setIsRegistering(false)
      }
    } catch (error) {
      setErrors({ general: 'Erreur lors de la création du compte' })
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 px-4 py-5 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-green-400/20 to-blue-500/20 animate-pulse"></div>
        <div className="relative z-10 flex items-center">
          <Link href="/" className="mr-3 hover:scale-110 transition-transform duration-200">
            <ArrowLeft className="text-white" size={20} />
          </Link>
          <h1 className="text-white text-lg font-black tracking-wide drop-shadow-lg">Inscription</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-5 py-8">
        <div className="max-w-md mx-auto">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue sur AXML</h2>
              <p className="text-gray-600">Rejoignez notre plateforme d'investissement</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <input
                  type="tel"
                  placeholder="Numéro de téléphone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Code d'invitation (requis)"
                  value={referralCode}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase()
                    setReferralCode(code)
                    if (code) {
                      setIsValidReferral(isReferralCodeValid(code))
                    } else {
                      setIsValidReferral(null)
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.referral ? 'border-red-500' : referralCode && isValidReferral === false ? 'border-red-500' : referralCode && isValidReferral ? 'border-green-500' : 'border-gray-300'
                  }`}
                  disabled={requiresReferral}
                />
                {errors.referral && <p className="text-red-500 text-sm mt-1">{errors.referral}</p>}
                {referralCode && isValidReferral === false && (
                  <p className="text-red-500 text-sm mt-1">Code d'invitation invalide</p>
                )}
                {referralCode && isValidReferral && (
                  <p className="text-green-600 text-sm mt-1">✓ Code d'invitation valide</p>
                )}
              </div>
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
                  Code: <span className="font-mono font-bold">{referralCode}</span>
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

            {/* Registration Button */}
            <button
              onClick={handleRegister}
              disabled={isRegistering || (requiresReferral && !isValidReferral)}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 transform ${
                isRegistering || (requiresReferral && !isValidReferral)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
              }`}
            >
              {isRegistering ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                'Créer mon compte'
              )}
            </button>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Avantages de l'inscription :</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Solde de départ : 1000 FCFA</li>
                <li>• Récompenses quotidiennes</li>
                <li>• Accès aux investissements</li>
                <li>• Système de parrainage</li>
              </ul>
            </div>
          </div>

          {/* Already have account */}
          <div className="text-center">
            <p className="text-gray-600">
              Déjà inscrit ?{' '}
              <Link href="/" className="text-green-600 font-medium hover:text-green-700">
                Accéder à mon compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
