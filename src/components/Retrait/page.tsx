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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-500 px-4 py-4 relative">
        <div className="flex items-center justify-center">
          <Link href="/" className="absolute left-4">
            <ArrowLeft size={24} className="text-white" />
          </Link>
          <h1 className="text-white text-lg font-medium">Retrait</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-black mb-3">RETRAIT DE FONDS</h1>
          <div className="bg-green-500 text-white px-5 py-2 rounded-full inline-block">
            <span className="font-medium text-sm">Retirez vos gains en toute simplicité !</span>
          </div>
        </div>

        {/* Balance */}
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-green-100 to-green-200 px-6 py-3 rounded-full inline-block">
            <span className="text-black font-semibold text-base">Solde: 0 FCFA</span>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          {/* Section Header */}
          <div className="flex items-center mb-5">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="w-14 h-1 bg-green-500 mb-1"></div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-5">
            <label className="block text-black font-semibold text-sm mb-2">
              Montant à retirer (FCFA)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Minimum 500 FCFA"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-500 bg-gray-50"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-5">
            <label className="block text-black font-semibold text-sm mb-3">
              Mode de paiement
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPaymentMethod(index)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-[1.02] active:scale-[0.98] ${
                    selectedPaymentMethod === index
                      ? method.selectedColor
                      : `${method.color} hover:shadow-lg`
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {index === 0 && (
                      <div className="flex items-center">
                        <Image src="/org.png" alt="Orange Money" width={20} height={20} className="object-contain mr-2" />
                        <span className="text-orange-600 font-medium text-sm">Orange Money</span>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="flex items-center">
                        <Image src="/mtn.png" alt="MTN Money" width={20} height={20} className="object-contain mr-2" />
                        <span className="text-yellow-600 font-medium text-sm">MTN Money</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="mb-6">
            <label className="block text-black font-semibold text-sm mb-2">
              Numéro de réception
            </label>
            <input
              type="text"
              placeholder="6XX XXX XXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-500 bg-gray-50"
            />
          </div>

          {/* Submit Button */}
          <button className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg">
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
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
