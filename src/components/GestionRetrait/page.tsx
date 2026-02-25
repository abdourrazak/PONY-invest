'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Copy, Upload, X } from 'lucide-react'

interface GestionRetraitProps {
  paymentMethod?: 'orange' | 'mtn' | 'crypto'
}

export default function GestionRetrait({ paymentMethod = 'orange' }: GestionRetraitProps) {
  const { userData } = useAuth()
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [cryptoAddress, setCryptoAddress] = useState('')

  const isOrange = paymentMethod === 'orange'
  const isMTN = paymentMethod === 'mtn'
  const isCrypto = paymentMethod === 'crypto'

  const serviceName = isOrange
    ? "Orange Money Cameroun"
    : isMTN
      ? "MTN Mobile Money"
      : "Cryptomonnaie (USDT TRC20) 1 USDT = $1"

  const logoSrc = isOrange
    ? "/org.png"
    : isMTN
      ? "/mtn.png"
      : "₿"

  const headerColors = isOrange
    ? "from-orange-500 via-orange-600 to-red-500"
    : isMTN
      ? "from-yellow-500 via-yellow-600 to-orange-500"
      : "from-blue-500 via-purple-600 to-indigo-600"

  const handleSubmit = () => {
    if (!amount || (!phoneNumber && !isCrypto) || (isCrypto && !cryptoAddress)) return

    // Validation du montant minimum
    const minAmount = isCrypto ? 5 : 10 // $5 USDT ou $10 minimum
    const numericAmount = parseFloat(amount)

    if (numericAmount < minAmount) {
      alert(`Le montant minimum de retrait est de $${minAmount}`)
      return
    }

    // Créer un nouvel objet de retrait
    const withdrawalRequest = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      amount: amount,
      paymentMethod: paymentMethod,
      phoneNumber: isCrypto ? '' : phoneNumber,
      cryptoAddress: isCrypto ? cryptoAddress : '',
      status: 'pending' as const,
      submittedAt: new Date().toISOString(),
      type: 'withdrawal' as const
    }

    // Sauvegarder dans localStorage avec le numéro de téléphone de l'utilisateur
    const userKey = userData?.numeroTel || 'anonymous'
    const existingWithdrawals = localStorage.getItem(`withdrawals_${userKey}`)
    const withdrawals = existingWithdrawals ? JSON.parse(existingWithdrawals) : []
    withdrawals.unshift(withdrawalRequest) // Ajouter au début de la liste
    localStorage.setItem(`withdrawals_${userKey}`, JSON.stringify(withdrawals))

    // Réinitialiser le formulaire
    setAmount('')
    setPhoneNumber('')
    setCryptoAddress('')

    // Rediriger vers le portefeuille
    router.push('/portefeuille')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className={`bg-gradient-to-r ${headerColors} px-4 py-4 shadow-lg relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${isOrange ? 'from-orange-400/20 via-red-400/20 to-orange-500/20' : isMTN ? 'from-yellow-400/20 via-orange-400/20 to-yellow-500/20' : 'from-blue-400/20 via-purple-400/20 to-indigo-500/20'} animate-pulse`}></div>
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/retrait" className="hover:scale-110 transition-transform duration-200">
            <ArrowLeft className="text-white" size={18} />
          </Link>
          <div className="flex items-center">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              {isCrypto ? (
                <span className="text-white text-base font-bold">₿</span>
              ) : (
                <Image src={logoSrc} alt={serviceName} width={16} height={16} className="object-contain" />
              )}
            </div>
            <h1 className="text-white text-base font-black tracking-wide drop-shadow-lg">Retrait {serviceName}</h1>
          </div>
          <div className="w-5"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Amount Section */}
        <div className="mb-4">
          <label className={`block ${isOrange ? 'text-blue-600' : isMTN ? 'text-yellow-600' : 'text-blue-600'} font-black text-sm mb-2`}>
            Montant à retirer ({isCrypto ? 'USDT' : '$'})
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={isCrypto ? "Minimum 20 USDT" : "Minimum 5,000 $"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-3 py-3 border-2 ${isOrange ? 'border-blue-300 focus:border-orange-500 focus:bg-orange-50' : isMTN ? 'border-yellow-300 focus:border-yellow-500 focus:bg-yellow-50' : 'border-blue-300 focus:border-purple-500 focus:bg-purple-50'} rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none bg-white shadow-sm font-medium text-base transition-all duration-300`}
            />
          </div>
        </div>

        {/* Phone Number or Crypto Address Section */}
        <div className="mb-4">
          <label className={`block ${isOrange ? 'text-blue-600' : isMTN ? 'text-yellow-600' : 'text-blue-600'} font-black text-sm mb-2`}>
            {isCrypto ? 'Adresse USDT TRC20' : 'Numéro de téléphone'}
          </label>
          <div className="relative">
            {isCrypto ? (
              <input
                type="text"
                placeholder="Votre adresse USDT TRC20"
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                className={`w-full px-3 py-3 border-2 border-blue-300 focus:border-purple-500 focus:bg-purple-50 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none bg-white shadow-sm font-medium text-base transition-all duration-300`}
              />
            ) : (
              <input
                type="tel"
                placeholder={isOrange ? "6XXXXXXXX" : "6XXXXXXXX"}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`w-full px-3 py-3 border-2 ${isOrange ? 'border-blue-300 focus:border-orange-500 focus:bg-orange-50' : 'border-yellow-300 focus:border-yellow-500 focus:bg-yellow-50'} rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none bg-white shadow-sm font-medium text-base transition-all duration-300`}
              />
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!amount || (!phoneNumber && !isCrypto) || (isCrypto && !cryptoAddress)}
          className={`w-full py-3 rounded-xl font-black text-sm transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg ${amount && ((phoneNumber && !isCrypto) || (isCrypto && cryptoAddress))
              ? isOrange
                ? 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-600 hover:via-red-600 hover:to-orange-700 text-white'
                : isMTN
                  ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          <div className="flex items-center justify-center">
            <span className="text-lg mr-2">💸</span>
            Soumettre la demande de retrait
          </div>
        </button>

        {/* Instructions */}
        <div className={`mt-4 ${isOrange ? 'bg-orange-50 border-orange-200' : isMTN ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'} border rounded-xl p-3`}>
          <h3 className={`${isOrange ? 'text-orange-700' : isMTN ? 'text-yellow-700' : 'text-blue-700'} font-black text-xs mb-2`}>Instructions :</h3>
          <ul className={`${isOrange ? 'text-orange-600' : isMTN ? 'text-yellow-600' : 'text-blue-600'} text-xs space-y-1 font-medium`}>
            <li>• Saisissez le montant que vous souhaitez retirer</li>
            <li>• {isCrypto ? 'Indiquez votre adresse USDT TRC20 valide' : 'Indiquez votre numéro de téléphone'}</li>
            <li>• Votre demande sera traitée sous 24-48h</li>
            <li>• {isCrypto ? 'Frais de réseau : 2 USDT' : 'Frais de traitement : 2%'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
