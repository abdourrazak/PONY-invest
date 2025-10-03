'use client'
import Link from 'next/link'
import NavigationLink from '../NavigationLink/NavigationLink'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Plus, Minus, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToUserBalance } from '@/lib/transactions'

export default function RechargePage() {
  const { currentUser } = useAuth()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0)
  const [balance, setBalance] = useState(0)
  const router = useRouter()

  // Synchroniser le solde en temps réel
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserBalance(currentUser.uid, (newBalance) => {
        setBalance(newBalance)
      })
      return unsubscribe
    }
  }, [currentUser])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95">
                <ArrowLeft size={18} className="text-white" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full shadow-xl border-2 border-white/20 flex items-center justify-center relative animate-pulse overflow-hidden">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-95 animate-spin" style={{animationDuration: '10s'}}></div>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <Image src="/ponyAI.png" alt="PONY AI" width={40} height={40} className="object-cover w-full h-full rounded-full" unoptimized />
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">PONY</h1>
                <p className="text-white/60 text-xs">Recharge</p>
              </div>
            </div>
            <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
              <Bell size={18} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Title & Balance */}
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-4">Recharger mon compte</h1>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 inline-block">
            <div className="flex items-center justify-center">
              <span className="text-lg mr-2">💰</span>
              <span className="text-white font-bold text-sm">Solde: {balance.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-6 text-center">Méthodes de paiement</h2>
          
          {/* Payment Options Grid */}
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <button
                key={index}
                onClick={() => setSelectedPaymentMethod(index)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left transform hover:scale-105 active:scale-95 ${
                  selectedPaymentMethod === index
                    ? 'border-purple-400 bg-purple-500/20 backdrop-blur-sm shadow-lg'
                    : 'border-white/20 bg-black/30 backdrop-blur-sm hover:border-white/30'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    {index === 0 && (
                      <Image src="/org.png" alt="Orange Money" width={24} height={24} className="object-contain" />
                    )}
                    {index === 1 && (
                      <Image src="/mtn.png" alt="MTN Money" width={24} height={24} className="object-contain" />
                    )}
                    {index === 2 && (
                      <div className="text-yellow-400 text-xl font-bold">₿</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm text-white">
                      {method.name}
                    </span>
                  </div>
                  {selectedPaymentMethod === index && (
                    <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-xl font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center">
            <span className="text-lg mr-2">💳</span>
            Continuer vers le paiement
          </div>
        </button>
      </main>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
