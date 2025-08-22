'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Gift } from 'lucide-react'
import { initializeUserIfNeeded, isReferralCodeValid } from '@/utils/referral'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [referralCode, setReferralCode] = useState('')
  const [isValidReferral, setIsValidReferral] = useState<boolean | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
      setIsValidReferral(isReferralCodeValid(refCode))
    }
  }, [searchParams])

  const handleRegister = () => {
    setIsRegistering(true)
    
    // Créer l'utilisateur avec le code de parrainage s'il est valide
    const referredBy = isValidReferral ? referralCode : undefined
    initializeUserIfNeeded(referredBy)
    
    // Rediriger vers l'accueil
    setTimeout(() => {
      router.push('/')
    }, 1500)
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

            {/* Referral Info */}
            {referralCode && (
              <div className={`p-4 rounded-lg mb-6 ${
                isValidReferral 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  <Gift className={`mr-2 ${isValidReferral ? 'text-green-600' : 'text-red-600'}`} size={20} />
                  <span className={`font-medium ${isValidReferral ? 'text-green-800' : 'text-red-800'}`}>
                    {isValidReferral ? 'Code de parrainage valide !' : 'Code de parrainage invalide'}
                  </span>
                </div>
                <p className={`text-sm ${isValidReferral ? 'text-green-700' : 'text-red-700'}`}>
                  Code: <span className="font-mono font-bold">{referralCode}</span>
                </p>
                {isValidReferral && (
                  <p className="text-sm text-green-600 mt-1">
                    🎉 Vous bénéficierez d'avantages spéciaux !
                  </p>
                )}
              </div>
            )}

            {/* Registration Button */}
            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 transform ${
                isRegistering
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
