'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'

export default function RetraitPage() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0)
  const [amount, setAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const paymentMethods = [
    {
      name: 'Orange Money',
      color: 'border-orange-200 bg-orange-50',
      selectedColor: 'border-orange-500 bg-orange-100'
    },
    {
      name: 'MTN Money',
      color: 'border-yellow-200 bg-yellow-50',
      selectedColor: 'border-yellow-500 bg-yellow-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 px-4 py-4 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-green-400/20 to-blue-500/20 animate-pulse"></div>
        <div className="relative z-10 flex items-center">
          <Link href="/" className="mr-3 hover:scale-110 transition-transform duration-200">
            <ArrowLeft className="text-white" size={18} />
          </Link>
          <div className="flex items-center">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-base">💸</span>
            </div>
            <h1 className="text-white text-base font-black tracking-wide drop-shadow-lg">Retrait</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Title & Balance */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-gray-800 mb-3">Retirer mes fonds</h1>
          <div className="bg-gradient-to-r from-blue-100 to-green-100 px-4 py-2 rounded-xl inline-block shadow-sm border border-white/50">
            <div className="flex items-center justify-center">
              <span className="text-lg mr-2">💰</span>
              <span className="text-gray-800 font-bold text-sm">Solde: 0 FCFA</span>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="mb-6">
          <h2 className="text-gray-800 font-black text-base mb-4 text-center">Formulaire de retrait</h2>
          
          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-gray-800 font-black text-sm mb-2">
              💰 Montant à retirer (FCFA)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Minimum 500 FCFA"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-3 border-2 border-blue-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-blue-50 bg-white shadow-sm font-medium text-base transition-all duration-300"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-4">
            <label className="block text-gray-800 font-black text-sm mb-2">
              📱 Mode de paiement
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPaymentMethod(index)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-[1.01] active:scale-[0.99] shadow-sm ${
                    selectedPaymentMethod === index
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-green-200'
                      : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {index === 0 && (
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                          <Image src="/org.png" alt="Orange Money" width={16} height={16} className="object-contain" />
                        </div>
                        <span className={`font-bold text-xs ${
                          selectedPaymentMethod === index ? 'text-green-700' : 'text-orange-600'
                        }`}>Orange Money</span>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-2">
                          <Image src="/mtn.png" alt="MTN Money" width={16} height={16} className="object-contain" />
                        </div>
                        <span className={`font-bold text-xs ${
                          selectedPaymentMethod === index ? 'text-green-700' : 'text-yellow-600'
                        }`}>MTN Money</span>
                      </div>
                    )}
                  </div>
                  {selectedPaymentMethod === index && (
                    <div className="flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="mb-6">
            <label className="block text-gray-800 font-black text-sm mb-2">
              📞 Numéro de réception
            </label>
            <input
              type="text"
              placeholder="6XX XXX XXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-3 border-2 border-blue-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-blue-50 bg-white shadow-sm font-medium text-base transition-all duration-300"
            />
          </div>

          {/* Submit Button */}
          <button className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white py-3 rounded-xl font-black text-sm transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg">
            <div className="flex items-center justify-center">
              <span className="text-lg mr-2">💸</span>
              Soumettre la demande
            </div>
          </button>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
