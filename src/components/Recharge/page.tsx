'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'

export default function RechargePage() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0)
  const router = useRouter()

  const paymentMethods = [
    {
      name: 'Orange Money Cameroun',
      icon: '🟠',
      description: ''
    },
    {
      name: 'MTN Mobile (taper le code etape par etape)',
      icon: '📱',
      description: ''
    },
    {
      name: 'Cryptomonnaie (USDT TRC20) 1USDT = 600 FCFA',
      icon: '₿',
      description: ''
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 px-4 py-5 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-green-400/20 to-blue-500/20 animate-pulse"></div>
        <div className="relative z-10 flex items-center">
          <Link href="/" className="mr-3 hover:scale-110 transition-transform duration-200">
            <ArrowLeft className="text-white" size={20} />
          </Link>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">💳</span>
            </div>
            <h1 className="text-white text-lg font-black tracking-wide drop-shadow-lg">Recharge</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-gray-800 mb-3 drop-shadow-sm">DÉPOSEZ VOS FONDS</h1>
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full inline-block shadow-lg">
            <span className="font-bold text-sm">💰 Rechargez et commencez à investir !</span>
          </div>
        </div>

        {/* Balance */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-100 via-green-100 to-purple-100 px-8 py-4 rounded-2xl inline-block shadow-lg border border-white/50">
            <div className="flex items-center justify-center">
              <span className="text-2xl mr-2">💰</span>
              <span className="text-gray-800 font-black text-lg">Solde: 0 FCFA</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
          {/* Section Header */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="w-16 h-1.5 bg-gradient-to-r from-green-500 to-blue-500 mb-2 rounded-full"></div>
              <h2 className="text-gray-800 font-black text-lg">Choisissez un moyen de paiement</h2>
              <p className="text-gray-600 text-sm font-medium">Sélectionnez votre méthode préférée</p>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <button
                key={index}
                onClick={() => setSelectedPaymentMethod(index)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                  selectedPaymentMethod === index
                    ? 'border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-green-200'
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-blue-200'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                    {index === 0 && (
                      <Image src="/org.png" alt="Orange Money" width={24} height={24} className="object-contain" />
                    )}
                    {index === 1 && (
                      <Image src="/mtn.png" alt="MTN Money" width={24} height={24} className="object-contain" />
                    )}
                    {index === 2 && (
                      <div className="text-green-600 text-xl font-bold">₿</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`font-bold text-base ${
                      selectedPaymentMethod === index ? 'text-green-700' : 'text-gray-800'
                    }`}>
                      {method.name}
                    </span>
                    {selectedPaymentMethod === index && (
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-green-600 text-xs font-medium">Sélectionné</span>
                      </div>
                    )}
                  </div>
                  {selectedPaymentMethod === index && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Action Button */}
        <div className="mt-8">
          <button 
            onClick={() => {
              if (selectedPaymentMethod === 0) {
                router.push('/gestion-depot?method=orange')
              } else if (selectedPaymentMethod === 1) {
                router.push('/gestion-depot?method=mtn')
              }
            }}
            className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white py-4 rounded-xl font-black text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl"
          >
            <div className="flex items-center justify-center">
              <span className="text-xl mr-2">💳</span>
              Continuer vers le paiement
            </div>
          </button>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
