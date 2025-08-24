'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, Users, TrendingUp, Award, Target, Copy } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getReferralCount, getReferrals } from '@/lib/firebaseAuth'

export default function EquipePage() {
  const [activeTab, setActiveTab] = useState('Équipe A')
  const [showSuccess, setShowSuccess] = useState(false)
  const { userData } = useAuth()
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    referralCode: '',
    referralLink: ''
  })
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [teamRevenue, setTeamRevenue] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReferralData = async () => {
      setLoading(false)
      
      if (typeof window !== 'undefined' && userData?.numeroTel) {
        let storedCode = localStorage.getItem(`userReferralCode_${userData.numeroTel}`)
        
        // Migration: vérifier l'ancien format si pas trouvé
        if (!storedCode) {
          const oldCode = localStorage.getItem('userReferralCode')
          if (oldCode) {
            localStorage.setItem(`userReferralCode_${userData.numeroTel}`, oldCode)
            localStorage.removeItem('userReferralCode')
            storedCode = oldCode
            console.log('✅ Code migré vers le nouveau format')
          }
        }
        
        // Ne jamais générer de nouveau code ici - utiliser uniquement celui de Firestore
        if (!storedCode) {
          console.log('⚠️ Aucun code trouvé dans localStorage, attente des données Firestore')
          return
        }
        
        const link = `${window.location.origin}/register-auth?ref=${storedCode}`
        
        // Récupérer les filleuls et le compteur
        try {
          const [referrals, count] = await Promise.all([
            getReferrals(storedCode),
            getReferralCount(storedCode)
          ])
          
          setTeamMembers(referrals)
          setReferralStats({
            totalReferrals: count,
            referralCode: storedCode,
            referralLink: link
          })
          
          // Calculate team revenue - 25 FCFA per referral
          const calculatedRevenue = referrals.length * 25
          setTeamRevenue(calculatedRevenue)
        } catch (error) {
          console.log('Erreur chargement données parrainage:', error)
          setReferralStats({
            totalReferrals: 0,
            referralCode: storedCode,
            referralLink: link
          })
        }
      }
    }
    
    loadReferralData()
  }, [userData])

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
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 px-3 sm:px-4 py-3 sm:py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 transform hover:scale-110">
            <ArrowLeft size={20} className="drop-shadow-sm sm:w-6 sm:h-6" />
          </Link>
          <h1 className="text-white text-lg sm:text-xl font-bold tracking-wide drop-shadow-md flex items-center">
            <Users className="mr-1 sm:mr-2" size={20} />
            Mon Équipe
          </h1>
          <div className="w-8 sm:w-10"></div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-3 sm:px-4 py-3 sm:py-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-3 sm:p-5 text-center shadow-lg border border-green-100 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <TrendingUp className="text-green-500 mr-1 sm:mr-2" size={16} />
              <span className="text-gray-700 text-xs sm:text-sm font-bold">Revenu Total</span>
            </div>
            <div className="text-green-600 text-lg sm:text-2xl font-black">{teamRevenue.toLocaleString()} FCFA</div>
          </div>
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-3 sm:p-5 text-center shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <Users className="text-blue-500 mr-1 sm:mr-2" size={16} />
              <span className="text-gray-700 text-xs sm:text-sm font-bold">Total Invitations</span>
            </div>
            <div className="text-blue-600 text-lg sm:text-2xl font-black">{referralStats.totalReferrals}</div>
          </div>
        </div>

        {/* Code d'Invitation */}
        <div className="bg-gradient-to-r from-white to-green-50 rounded-xl p-3 sm:p-5 mb-4 shadow-lg border border-green-100">
          <div className="text-gray-800 font-bold mb-2 sm:mb-3 flex items-center">
            <Award className="text-green-500 mr-1 sm:mr-2" size={16} />
            <span className="text-sm sm:text-base">Code d'Invitation</span>
          </div>
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-3 sm:p-4 border border-green-200 gap-2">
            <span className="text-gray-800 font-mono text-sm sm:text-lg font-bold tracking-wider truncate">
              {referralStats.referralCode || 'Chargement...'}
            </span>
            <button
              onClick={() => handleCopy(referralStats.referralCode)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Copy size={14} className="mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Copier</span>
            </button>
          </div>
        </div>

        {/* Lien d'Invitation */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl p-3 sm:p-5 mb-4 sm:mb-6 shadow-lg border border-blue-100">
          <div className="text-gray-800 font-bold mb-2 sm:mb-3 flex items-center">
            <Target className="text-blue-500 mr-1 sm:mr-2" size={16} />
            <span className="text-sm sm:text-base">Lien d'Invitation</span>
          </div>
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 sm:p-4 border border-blue-200 gap-2">
            <span className="text-blue-600 text-xs sm:text-sm flex-1 mr-2 truncate font-mono">
              {referralStats.referralLink || 'Chargement...'}
            </span>
            <button 
              onClick={() => handleCopy(referralStats.referralLink)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex-shrink-0"
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
            <div className="text-orange-600 text-2xl font-black">{referralStats.totalReferrals}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-5 text-center shadow-lg border border-green-100 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="text-green-500 mr-2" size={20} />
              <span className="text-gray-700 text-sm font-bold">Revenu Total</span>
            </div>
            <div className="text-green-600 text-2xl font-black">0 FCFA</div>
          </div>
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-5 text-center shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
            <div className="flex items-center justify-center mb-2">
              <Target className="text-blue-500 mr-2" size={20} />
              <span className="text-gray-700 text-sm font-bold">Profit de l'Équipe</span>
            </div>
            <div className="text-blue-600 text-2xl font-black">0 FCFA</div>
          </div>
        </div>

        {/* Liste des filleuls */}
        {teamMembers.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Users className="mr-2 text-blue-500" size={20} />
              Mes Filleuls ({teamMembers.length})
            </h3>
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {member.numeroTel?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{member.numeroTel || 'Utilisateur'}</p>
                      <p className="text-xs text-gray-500">
                        Inscrit le {member.createdAt?.toDate?.()?.toLocaleDateString() || 'Date inconnue'}
                      </p>
                    </div>
                  </div>
                  <div className="text-green-600 font-bold text-sm">
                    Actif
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
