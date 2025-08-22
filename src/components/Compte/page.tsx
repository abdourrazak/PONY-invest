'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cloud, Plus, Minus, Smartphone, Wallet, ChevronRight, Share2, Users, Copy } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'
import { initializeUserIfNeeded, getReferralStats } from '@/utils/referral'

export default function ComptePage() {
  const [balance, setBalance] = useState(1000)
  const [funds, setFunds] = useState(1000)
  const [referralStats, setReferralStats] = useState({ totalReferrals: 0, referralCode: '', referralLink: '' })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const savedBalance = localStorage.getItem('userBalance')
    const savedFunds = localStorage.getItem('userFunds')
    
    if (savedBalance) {
      setBalance(parseInt(savedBalance))
    } else {
      localStorage.setItem('userBalance', '1000')
    }

    if (savedFunds) {
      setFunds(parseInt(savedFunds))
    } else {
      localStorage.setItem('userFunds', '1000')
    }

    // Initialiser l'utilisateur et récupérer les stats de parrainage
    initializeUserIfNeeded()
    const stats = getReferralStats()
    setReferralStats(stats)
  }, [])
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 px-4 py-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-green-400/20 to-blue-500/20 animate-pulse"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-sm hover:scale-110 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-100 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-gray-700 text-base font-bold">👤</span>
              </div>
            </div>
            <div className="text-white">
              <div className="text-lg font-black tracking-wide drop-shadow-lg">+237693098877</div>
              <div className="text-green-200 text-sm font-medium">Membre Actif</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500/80 to-cyan-500/80 p-2 rounded-xl shadow-lg backdrop-blur-sm border border-white/20">
              <Cloud className="text-white drop-shadow-sm" size={24} />
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full shadow-xl border border-white/20 hover:scale-105 transition-all duration-200">
              <span className="text-white text-sm font-black tracking-wide drop-shadow-sm">LV0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 pb-20">
        {/* Mes atouts */}
        <div className="mx-4 mb-6">
          <div className="bg-gradient-to-br from-green-600 via-green-700 to-blue-600 rounded-3xl p-5 shadow-2xl border border-white/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-green-400/20 to-blue-500/20 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-xl font-black tracking-wide drop-shadow-lg">Mes atouts</h3>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-xl shadow-xl border border-white/20 backdrop-blur-sm">
                  <span className="text-yellow-900 text-lg font-black drop-shadow-sm">💎</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-white text-4xl font-black mb-2 drop-shadow-xl animate-pulse tracking-wide">
                  {funds.toLocaleString('fr-FR')} XOF
                </div>
                <div className="text-green-100 text-sm font-black drop-shadow-sm">Solde disponible</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-5">
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-green-400/30">
              <div className="flex items-center justify-center space-x-2">
                <Plus size={20} className="drop-shadow-sm" />
                <span className="drop-shadow-sm">Recharge</span>
              </div>
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-blue-400/30">
              <div className="flex items-center justify-center space-x-2">
                <Minus size={20} className="drop-shadow-sm" />
                <span className="drop-shadow-sm">Retrait</span>
              </div>
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-purple-400/30">
              <div className="flex items-center justify-center space-x-2">
                <Smartphone size={20} className="drop-shadow-sm" />
                <span className="drop-shadow-sm">Appareil</span>
              </div>
            </button>
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-orange-400/30">
              <div className="flex items-center justify-center space-x-2">
                <Wallet size={20} className="drop-shadow-sm" />
                <span className="drop-shadow-sm">Portefeuille</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 shadow-lg border border-green-400/30 hover:scale-105 transition-all duration-300">
              <div className="text-center">
                <div className="text-green-100 text-xs font-medium mb-1">Gains aujourd'hui</div>
                <div className="text-white text-lg font-black drop-shadow-lg">0 XOF</div>
                <div className="text-green-200 text-xs mt-1">📈 +0%</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 shadow-lg border border-blue-400/30 hover:scale-105 transition-all duration-300">
              <div className="text-center">
                <div className="text-blue-100 text-xs font-medium mb-1">Gains totaux</div>
                <div className="text-white text-lg font-black drop-shadow-lg">{(funds - 1000).toLocaleString('fr-FR')} XOF</div>
                <div className="text-blue-200 text-xs mt-1">💰 Récompenses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-3 mb-6">
          <Link href="/equipe" className="block w-full bg-gradient-to-r from-white via-purple-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50 hover:border-purple-400 group backdrop-blur-sm transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <span className="text-white text-lg font-bold drop-shadow-lg">👥</span>
                </div>
                <span className="text-gray-800 text-base font-black tracking-wide group-hover:text-purple-700 transition-colors duration-300">Liste des Parrainés</span>
              </div>
              <div className="text-gray-400 group-hover:text-purple-500 transition-colors duration-300 transform group-hover:translate-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Link>

          <button className="w-full bg-gradient-to-r from-white via-indigo-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-200/50 hover:border-indigo-400 group backdrop-blur-sm transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <span className="text-white text-lg font-bold drop-shadow-lg">📋</span>
                </div>
                <span className="text-gray-800 text-base font-black tracking-wide group-hover:text-indigo-700 transition-colors duration-300">Mes Reçus</span>
              </div>
              <div className="text-gray-400 group-hover:text-indigo-500 transition-colors duration-300 transform group-hover:translate-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </button>

          {/* Referral Section */}
          <div className="bg-gradient-to-r from-white via-purple-50/40 to-white rounded-xl p-4 shadow-lg border border-purple-200/50 mb-4">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-gray-800 text-base font-black tracking-wide">Mon Parrainage</span>
                <div className="flex items-center mt-1">
                  <Users className="w-4 h-4 text-purple-600 mr-1" />
                  <span className="text-purple-600 text-sm font-medium">{referralStats.totalReferrals} filleul{referralStats.totalReferrals !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">Mon Code d'Invitation</label>
                <div className="flex items-center bg-gray-50 rounded-lg p-2">
                  <span className="font-mono font-bold text-purple-600 flex-1">{referralStats.referralCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(referralStats.referralCode)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="ml-2 p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">Lien d'Invitation</label>
                <div className="flex items-center bg-gray-50 rounded-lg p-2">
                  <span className="text-sm text-gray-700 flex-1 truncate">{referralStats.referralLink}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(referralStats.referralLink)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="ml-2 p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {copied && (
                <div className="text-center text-green-600 text-sm font-medium">
                  ✅ Copié dans le presse-papiers !
                </div>
              )}
            </div>
          </div>

          <Link href="/register-auth" className="block w-full">
            <button className="w-full bg-gradient-to-r from-white via-red-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200/50 hover:border-red-400 group backdrop-blur-sm transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z"/>
                  </svg>
                </div>
                <span className="text-gray-800 text-base font-black tracking-wide group-hover:text-red-700 transition-colors duration-300">Déconnexion</span>
              </div>
              <div className="text-gray-400 group-hover:text-red-500 transition-colors duration-300 transform group-hover:translate-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            </button>
          </Link>

        </div>
      </div>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">🏠</span>
            </div>
            <span className="text-gray-500 text-xs">Accueil</span>
          </Link>
          <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">📊</span>
            </div>
            <span className="text-gray-500 text-xs">Produits</span>
          </Link>
          <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">👥</span>
            </div>
            <span className="text-gray-500 text-xs">Équipe</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👤</span>
            </div>
            <span className="text-green-600 text-xs font-medium">Mon Compte</span>
          </Link>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
