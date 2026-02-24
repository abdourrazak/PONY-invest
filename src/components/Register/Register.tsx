'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Smartphone, Lock, ArrowRight, Users, MessageCircle, RefreshCw, CheckCircle } from 'lucide-react'
import WelcomePopup from '../WelcomePopup/WelcomePopup'
import { registerUser, isReferralCodeValid } from '@/lib/firebaseAuth'
import PhoneInput from '@/components/PhoneInput/PhoneInput'

// Étapes du formulaire
type Step = 'form' | 'otp' | 'success'

export default function Register() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('form')
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  })
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isValidReferral, setIsValidReferral] = useState<boolean | null>(null)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [debugCode, setDebugCode] = useState('') // Dev only

  // Compte à rebours pour renvoyer le code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    console.log('🔍 Register: showWelcomePopup state changed to:', showWelcomePopup)
  }, [showWelcomePopup])

  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }))
      const validateCode = async () => {
        const isValid = await isReferralCodeValid(refCode)
        setIsValidReferral(isValid)
      }
      validateCode()
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.phone) {
      newErrors.phone = 'Le numéro de téléphone est requis'
    } else {
      const localNumber = formData.phone.replace(/^\+\d+\s*/, '').trim()
      if (!/^6[0-9]{8}$/.test(localNumber)) {
        newErrors.phone = 'Format: 6XXXXXXXX'
      }
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmez votre mot de passe'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    const hasReferralFromURL = !!searchParams.get('ref')
    if (!hasReferralFromURL && formData.referralCode && isValidReferral === false) {
      newErrors.referralCode = 'Code d\'invitation invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ─── Envoi de l'OTP WhatsApp ───────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!validateForm()) return
    if (countdown > 0) return

    setIsSendingOtp(true)
    setOtpError('')

    try {
      const response = await fetch('/api/twilio/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phone }),
      })

      const data = await response.json()

      if (!response.ok) {
        setOtpError(data.error || 'Erreur lors de l\'envoi du code')
        return
      }

      // En dev : afficher le code directement pour faciliter les tests
      if (data.debugCode) {
        setDebugCode(data.debugCode)
      }

      setStep('otp')
      setCountdown(60) // 60 secondes avant de pouvoir renvoyer
    } catch (err) {
      setOtpError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  // ─── Vérification de l'OTP ────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otpCode.join('')
    if (code.length !== 6) {
      setOtpError('Entrez les 6 chiffres du code')
      return
    }

    setIsVerifyingOtp(true)
    setOtpError('')

    try {
      const response = await fetch('/api/twilio/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phone, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        setOtpError(data.error || 'Code incorrect')
        return
      }

      // ✅ Téléphone vérifié → créer le compte Firebase
      setPhoneVerified(true)
      await handleCreateAccount()
    } catch (err) {
      setOtpError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  // ─── Création du compte Firebase après vérification OTP ──────────────────
  const handleCreateAccount = async () => {
    setIsLoading(true)

    try {
      const finalReferralCode = searchParams.get('ref') || formData.referralCode || undefined
      const localNumber = formData.phone.replace(/^\+\d+\s*/, '').trim()

      const result = await registerUser(localNumber, formData.password, finalReferralCode)

      if (result.success && result.user) {
        localStorage.setItem('userPhone', formData.phone)
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userId', result.user.uid)

        if (result.user.referralCode) {
          const userKey = result.user.numeroTel
          localStorage.setItem(`userReferralCode_${userKey}`, result.user.referralCode)
        }

        localStorage.removeItem('hasSeenWelcome')
        setShowWelcomePopup(true)
      } else {
        const message = result.error || 'Erreur lors de l\'inscription. Veuillez réessayer.'
        setErrorMessage(message)
        setShowErrorPopup(true)
        setTimeout(() => setShowErrorPopup(false), 4000)
        // Revenir à l'étape du formulaire
        setStep('form')
      }
    } catch (error) {
      setErrorMessage('Erreur lors de l\'inscription. Vérifiez votre connexion internet.')
      setShowErrorPopup(true)
      setTimeout(() => setShowErrorPopup(false), 4000)
      setStep('form')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (field === 'referralCode') {
      if (value) {
        const validateCode = async () => {
          const isValid = await isReferralCodeValid(value)
          setIsValidReferral(isValid)
        }
        validateCode()
      } else {
        setIsValidReferral(null)
      }
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // ─── Gestion de la saisie du code OTP (cases individuelles) ──────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Chiffres uniquement
    const newOtp = [...otpCode]
    newOtp[index] = value.slice(-1) // 1 chiffre par case
    setOtpCode(newOtp)
    setOtpError('')

    // Focus automatique sur la case suivante
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`)
      next?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`)
      prev?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setOtpCode(paste.split(''))
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDU
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-400 via-green-400 to-blue-500 rounded-full shadow-2xl border-4 border-white flex items-center justify-center relative animate-pulse overflow-hidden">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-blue-500 opacity-95 animate-spin" style={{ animationDuration: '10s' }}></div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <Image src="/ponyAI.png" alt="PONY AI" width={80} height={80} className="object-cover w-full h-full rounded-full" unoptimized />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white px-6 py-3 rounded-full text-base font-extrabold shadow-lg tracking-wide">
            Rejoins l'aventure PONY
          </div>
        </div>

        {/* ─────────────────────────────── ÉTAPE 1 : Formulaire ─── */}
        {step === 'form' && (
          <div className="w-full max-w-md bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="bg-black/30 backdrop-blur-sm p-6 text-center border-b border-white/10">
              <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Créer un compte PONY</h1>
              <p className="text-white/80 text-sm font-semibold">Rejoignez notre plateforme d'investissement</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendOtp() }} className="p-6 space-y-5">
              {/* Phone */}
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

              {/* Password */}
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
                    className={`w-full px-4 py-3 pr-10 rounded-xl border transition-all duration-300 text-white placeholder-white/50 font-semibold bg-black/20 backdrop-blur-sm ${errors.password ? 'border-red-400' : 'border-white/30 focus:border-blue-400 focus:bg-black/30'
                      } focus:outline-none shadow-sm`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white/90">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1 font-bold">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
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
                    className={`w-full px-4 py-3 pr-10 rounded-xl border transition-all duration-300 text-white placeholder-white/50 font-semibold bg-black/20 backdrop-blur-sm ${errors.confirmPassword ? 'border-red-400' : 'border-white/30 focus:border-blue-400 focus:bg-black/30'
                      } focus:outline-none shadow-sm`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white/90">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 font-bold">{errors.confirmPassword}</p>}
              </div>

              {/* Referral Code */}
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
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 text-white placeholder-white/50 font-mono font-bold bg-black/20 backdrop-blur-sm ${searchParams.get('ref') ? 'border-green-400 bg-green-500/10'
                      : errors.referralCode ? 'border-red-400'
                        : isValidReferral === true ? 'border-green-400 bg-green-500/10'
                          : isValidReferral === false ? 'border-red-400'
                            : 'border-white/30 focus:border-blue-400 focus:bg-black/30'
                    } focus:outline-none shadow-sm ${!!searchParams.get('ref') ? 'opacity-60' : ''}`}
                />
                {errors.referralCode && <p className="text-red-400 text-xs mt-1 font-bold">{errors.referralCode}</p>}
                {searchParams.get('ref') && <p className="text-green-400 text-xs mt-1 font-bold">✅ Code d'invitation valide du lien</p>}
                {!searchParams.get('ref') && isValidReferral === true && <p className="text-green-400 text-xs mt-1 font-bold">✅ Code d'invitation valide</p>}
                {!searchParams.get('ref') && isValidReferral === false && formData.referralCode && <p className="text-red-400 text-xs mt-1 font-bold">❌ Code d'invitation invalide</p>}
                {!searchParams.get('ref') && <p className="text-blue-400 text-xs mt-1 font-bold">Laissez vide si vous êtes le premier utilisateur</p>}
              </div>

              {/* Error OTP send */}
              {otpError && (
                <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3">
                  <p className="text-red-400 text-sm text-center font-semibold">{otpError}</p>
                </div>
              )}

              {/* Submit → Envoyer OTP */}
              <button
                type="submit"
                disabled={isSendingOtp || (!searchParams.get('ref') && !!formData.referralCode && isValidReferral === false)}
                className={`w-full py-3.5 text-base rounded-xl font-black text-white transition-all duration-300 transform shadow-lg ${isSendingOtp || (!searchParams.get('ref') && !!formData.referralCode && isValidReferral === false)
                    ? 'bg-gray-600/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-[1.02] active:scale-[0.98]'
                  } flex items-center justify-center`}
              >
                {isSendingOtp ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    <span className="font-extrabold tracking-wide">Envoi du code...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    <span className="font-extrabold tracking-wide">Vérifier via WhatsApp</span>
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
        )}

        {/* ─────────────────────────────── ÉTAPE 2 : Saisie OTP ─── */}
        {step === 'otp' && (
          <div className="w-full max-w-md bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="bg-black/30 backdrop-blur-sm p-6 text-center border-b border-white/10">
              <div className="w-16 h-16 bg-green-500/20 border-2 border-green-400/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">Code WhatsApp envoyé !</h2>
              <p className="text-white/70 text-sm font-semibold">
                Un code à 6 chiffres a été envoyé au
              </p>
              <p className="text-green-400 font-black text-base mt-1">{formData.phone}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Info sandbox */}
              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4">
                <p className="text-yellow-400 text-xs font-bold text-center">
                  ⚠️ Mode Test (Sandbox) : Votre numéro doit d'abord avoir rejoint le sandbox Twilio
                </p>
              </div>

              {/* Debug code (dev uniquement) */}
              {debugCode && (
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-3">
                  <p className="text-blue-300 text-xs font-bold text-center">
                    🛠️ Mode dev — Code : <span className="text-white text-lg font-black tracking-widest">{debugCode}</span>
                  </p>
                </div>
              )}

              {/* Cases OTP */}
              <div>
                <label className="block text-white/70 font-semibold text-sm mb-4 text-center">
                  Entrez le code reçu sur WhatsApp
                </label>
                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-2xl font-black rounded-xl border-2 transition-all duration-200 bg-black/30 text-white focus:outline-none ${digit
                          ? 'border-green-400 bg-green-500/10'
                          : otpError
                            ? 'border-red-400'
                            : 'border-white/30 focus:border-blue-400 focus:bg-black/40'
                        }`}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-red-400 text-sm text-center mt-3 font-bold">{otpError}</p>
                )}
              </div>

              {/* Bouton vérifier */}
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || isLoading || otpCode.join('').length !== 6}
                className={`w-full py-3.5 text-base rounded-xl font-black text-white transition-all duration-300 transform shadow-lg ${isVerifyingOtp || isLoading || otpCode.join('').length !== 6
                    ? 'bg-gray-600/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 hover:scale-[1.02] active:scale-[0.98]'
                  } flex items-center justify-center`}
              >
                {isVerifyingOtp || isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    <span>{isVerifyingOtp ? 'Vérification...' : 'Création du compte...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Confirmer et créer mon compte</span>
                  </div>
                )}
              </button>

              {/* Renvoyer le code */}
              <div className="text-center space-y-3">
                {countdown > 0 ? (
                  <p className="text-white/50 text-sm">
                    Renvoyer dans <span className="text-white font-bold">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="flex items-center justify-center mx-auto text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSendingOtp ? 'animate-spin' : ''}`} />
                    {isSendingOtp ? 'Envoi...' : 'Renvoyer le code'}
                  </button>
                )}

                <button
                  onClick={() => { setStep('form'); setOtpCode(['', '', '', '', '', '']); setOtpError('') }}
                  className="text-white/50 hover:text-white/80 text-sm transition-colors underline"
                >
                  ← Modifier mon numéro
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Avantages */}
        {step === 'form' && (
          <div className="mt-8 max-w-md w-full">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <h3 className="font-extrabold text-white text-base mb-4 text-center tracking-wide">🎁 Avantages de l'inscription</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-green-400">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2.5 flex-shrink-0"></span>
                  <span className="font-semibold">Solde de départ : 1000 $</span>
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
        )}

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
