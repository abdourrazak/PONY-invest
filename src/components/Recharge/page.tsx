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
      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Title & Balance */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-gray-800 mb-3">Recharger mon compte</h1>
          <div className="bg-gradient-to-r from-blue-100 to-green-100 px-4 py-2 rounded-xl inline-block shadow-sm border border-white/50">
            <div className="flex items-center justify-center">
              <span className="text-lg mr-2">💰</span>
              <span className="text-gray-800 font-bold text-sm">Solde: 0 FCFA</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="mb-6">
          <h2 className="text-gray-800 font-black text-base mb-4 text-center">Méthodes de paiement</h2>
          
          {/* Payment Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {paymentMethods.map((method, index) => (
              <button
                key={index}
                onClick={() => setSelectedPaymentMethod(index)}
                className={`p-3 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-[1.01] active:scale-[0.99] ${
                  selectedPaymentMethod === index
                    ? 'border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 shadow-sm'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                    {index === 0 && (
                      <Image src="/org.png" alt="Orange Money" width={20} height={20} className="object-contain" />
                    )}
                    {index === 1 && (
                      <Image src="/mtn.png" alt="MTN Money" width={20} height={20} className="object-contain" />
                    )}
                    {index === 2 && (
                      <div className="text-blue-600 text-lg font-bold">₿</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`font-bold text-sm ${
                      selectedPaymentMethod === index ? 'text-green-700' : 'text-gray-800'
                    }`}>
                      {method.name}
                    </span>
                  </div>
                  {selectedPaymentMethod === index && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
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
        <div className="mt-6">
          <button 
            onClick={() => {
              if (selectedPaymentMethod === 0) {
                router.push('/gestion-depot?method=orange')
              } else if (selectedPaymentMethod === 1) {
                router.push('/gestion-depot?method=mtn')
              } else if (selectedPaymentMethod === 2) {
                router.push('/gestion-depot?method=crypto')
              }
            }}
            className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white py-3 rounded-xl font-black text-sm transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg"
          >
            <div className="flex items-center justify-center">
              <span className="text-lg mr-2">💳</span>
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
