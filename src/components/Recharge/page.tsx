'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'

export default function RechargePage() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0)

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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-500 px-4 py-4 relative">
        <div className="flex items-center justify-center">
          <Link href="/" className="absolute left-4">
            <ArrowLeft size={24} className="text-white" />
          </Link>
          <h1 className="text-white text-lg font-medium">Recharge</h1>
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
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-black mb-3">DÉPOSEZ VOS FONDS</h1>
          <div className="bg-green-500 text-white px-5 py-2 rounded-full inline-block">
            <span className="font-medium text-sm">Rechargez et commencez à investir !</span>
          </div>
        </div>

        {/* Balance */}
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-green-100 to-green-200 px-6 py-3 rounded-full inline-block">
            <span className="text-black font-semibold text-base">Solde: 0 FCFA</span>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          {/* Section Header */}
          <div className="flex items-center mb-5">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="w-14 h-1 bg-green-500 mb-1"></div>
              <h2 className="text-black font-semibold text-base">Choisissez un moyen de paiement</h2>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-3">
            {paymentMethods.map((method, index) => (
              <button
                key={index}
                onClick={() => setSelectedPaymentMethod(index)}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-[1.02] active:scale-[0.98] ${
                  selectedPaymentMethod === index
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-gray-50 hover:border-green-300 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
                    {index === 0 && (
                      <Image src="/org.png" alt="Orange Money" width={20} height={20} className="object-contain mr-2" />
                    )}
                    {index === 1 && (
                      <Image src="/mtn.png" alt="MTN Money" width={20} height={20} className="object-contain mr-2" />
                    )}
                    {index === 2 && (
                      <div className="text-green-500 text-lg">₿</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`font-medium text-sm ${
                      selectedPaymentMethod === index ? 'text-green-700' : 'text-black'
                    }`}>
                      {method.name}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
