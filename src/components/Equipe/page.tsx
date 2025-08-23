'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, Users, TrendingUp, Award, Target, Copy } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getReferralStats, getReferrals } from '@/lib/firebaseAuth'

export default function EquipePage() {
  const [activeTab, setActiveTab] = useState('Équipe A')
  const [showSuccess, setShowSuccess] = useState(false)
  const { userData } = useAuth()
  const [referralStats, setReferralStats] = useState(() => {
    const defaultCode = 'AXML' + Math.random().toString(36).substr(2, 4).toUpperCase()
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://axml-global.vercel.app'
    return {
      totalReferrals: 0,
      referralCode: defaultCode,
      referralLink: `${baseUrl}/register-auth?ref=${defaultCode}`
    }
  })
  const [teamRevenue, setTeamRevenue] = useState(0)
  const [validInvitations, setValidInvitations] = useState(0)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Forcer l'arrêt du loading immédiatement
    setLoading(false)
    
    // Générer un code simple et permanent
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId') || 'anonymous'
      let storedCode = localStorage.getItem('userReferralCode')
      
      if (!storedCode) {
        // Code simple basé sur timestamp + random
        storedCode = 'AXML' + Date.now().toString().slice(-4) + Math.random().toString(36).substr(2, 2).toUpperCase()
        localStorage.setItem('userReferralCode', storedCode)
      }
      
      const link = `${window.location.origin}/register-auth?ref=${storedCode}`
      
      setReferralStats({
        totalReferrals: 0,
        referralCode: storedCode,
        referralLink: link
      })
    }
  }, [])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 px-4 py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 transform hover:scale-110">
            <ArrowLeft size={24} className="drop-shadow-sm" />
          </Link>
          <h1 className="text-white text-xl font-bold tracking-wide drop-shadow-md flex items-center">
            <Users className="mr-2" size={24} />
            Mon Équipe
          </h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-5 text-center shadow-lg border border-green-100 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="text-green-500 mr-2" size={20} />
              <span className="text-gray-700 text-sm font-bold">Revenu Total</span>
            </div>
            <div className="text-green-600 text-2xl font-black">{teamRevenue.toLocaleString()} FCFA</div>
          </div>
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-5 text-center shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
            <div className="flex items-center justify-center mb-2">
              <Users className="text-blue-500 mr-2" size={20} />
              <span className="text-gray-700 text-sm font-bold">Total Invitations</span>
            </div>
            <div className="text-blue-600 text-2xl font-black">{referralStats.totalReferrals}</div>
          </div>
        </div>

        {/* Code d'Invitation */}
        <div className="bg-gradient-to-r from-white to-green-50 rounded-xl p-5 mb-4 shadow-lg border border-green-100">
          <div className="text-gray-800 font-bold mb-3 flex items-center">
            <Award className="text-green-500 mr-2" size={20} />
            Code d'Invitation
          </div>
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4 border border-green-200">
            <span className="text-green-600 font-mono text-lg font-bold">{referralStats.referralCode || 'Chargement...'}</span>
            <button 
              onClick={() => handleCopy(referralStats.referralCode)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              COPIER
            </button>
          </div>
        </div>

        {/* Lien d'Invitation */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl p-5 mb-6 shadow-lg border border-blue-100">
          <div className="text-gray-800 font-bold mb-3 flex items-center">
            <Target className="text-blue-500 mr-2" size={20} />
            Lien d'Invitation
          </div>
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-blue-200">
            <span className="text-blue-600 text-xs flex-1 mr-2 truncate font-mono">
              {referralStats.referralLink || 'Chargement...'}
            </span>
            <button 
              onClick={() => handleCopy(referralStats.referralLink)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              COPIER
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl mb-4 shadow-lg border border-gray-200">
          <div className="flex">
            {['Équipe A', 'Équipe B', 'Équipe C'].map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-4 text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50'
                } ${index === 0 ? 'rounded-tl-xl' : ''} ${index === 2 ? 'rounded-tr-xl' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-5 text-center shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
            <div className="flex items-center justify-center mb-2">
              <Users className="text-purple-500 mr-2" size={20} />
              <span className="text-gray-700 text-sm font-bold">Total Invitations</span>
            </div>
            <div className="text-purple-600 text-2xl font-black">{referralStats.totalReferrals}</div>
          </div>
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-5 text-center shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
            <div className="flex items-center justify-center mb-2">
              <Award className="text-orange-500 mr-2" size={20} />
              <span className="text-gray-700 text-sm font-bold">Invitations Valides</span>
            </div>
            <div className="text-orange-600 text-2xl font-black">{validInvitations}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-5 text-center shadow-lg border border-green-100 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="text-green-500 mr-2" size={20} />
              <span className="text-gray-700 text-sm font-bold">Revenu Total</span>
            </div>
            <div className="text-green-600 text-2xl font-black">{teamRevenue.toLocaleString()} FCFA</div>
          </div>
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-5 text-center shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
            <div className="flex items-center justify-center mb-2">
              <Target className="text-blue-500 mr-2" size={20} />
              <span className="text-gray-700 text-sm font-bold">Profit de l'Équipe</span>
            </div>
            <div className="text-blue-600 text-2xl font-black">{(teamRevenue * 0.1).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 border border-green-400 animate-bounce">
          <div className="flex items-center">
            <Award className="mr-2" size={20} />
            <span className="font-bold">Copié avec succès !</span>
          </div>
        </div>
      )}

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
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👥</span>
            </div>
            <span className="text-green-600 text-xs font-medium">Équipe</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">👤</span>
            </div>
            <span className="text-gray-500 text-xs">Mon Compte</span>
          </Link>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
