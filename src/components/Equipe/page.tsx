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
        
        // Si pas de code en localStorage, utiliser celui de userData (Firestore)
        if (!storedCode && userData.referralCode) {
          storedCode = userData.referralCode
          localStorage.setItem(`userReferralCode_${userData.numeroTel}`, storedCode)
          console.log('✅ Code récupéré depuis Firestore:', storedCode)
        }
        
        if (!storedCode) {
          console.log('⚠️ Aucun code trouvé, génération d\'un nouveau code')
          // Générer un nouveau code si aucun n'existe
          const newCode = 'AXML' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 2).toUpperCase()
          localStorage.setItem(`userReferralCode_${userData.numeroTel}`, newCode)
          storedCode = newCode
        }
        
        const link = `${window.location.origin}/register-auth?ref=${storedCode}`
        
        console.log('🔍 Recherche des filleuls pour le code:', storedCode)
        
        // Récupérer les filleuls et le compteur
        try {
          console.log('🚀 Début récupération des filleuls pour le code:', storedCode)
          
          const referrals = await getReferrals(storedCode)
          const count = referrals.length
          
          console.log('📊 Résultats finaux:', {
            filleulsTrouves: referrals.length,
            compteur: count,
            detailsFilleuls: referrals.map(r => ({
              numero: r.numeroTel,
              referredBy: r.referredBy,
              uid: r.uid
            }))
          })
          
          setTeamMembers(referrals)
          setReferralStats({
            totalReferrals: count,
            referralCode: storedCode,
            referralLink: link
          })
          
          // Calculate team revenue - 25 FCFA per referral
          const calculatedRevenue = referrals.length * 25
          setTeamRevenue(calculatedRevenue)
          
          console.log('💰 Calcul des revenus:', {
            nombreFilleuls: referrals.length,
            revenusCalcules: calculatedRevenue,
            recompenseParFilleul: 25
          })
          
          // Forcer le re-render
          setTimeout(() => {
            console.log('🔄 Force refresh après 2 secondes')
            setTeamMembers([...referrals])
          }, 2000)
          
        } catch (error) {
          console.log('❌ Erreur chargement données parrainage:', error)
          setReferralStats({
            totalReferrals: 0,
            referralCode: storedCode,
            referralLink: link
          })
        }
      }
    }
    
    loadReferralData()
    
    // Rafraîchir les données quand la page devient visible
    const handleFocus = () => {
      console.log('📱 Page Équipe focus - Rafraîchissement des données')
      loadReferralData()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page Équipe visible - Rafraîchissement des données')
        loadReferralData()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [userData])

  const handleCopy = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
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
          <div className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-lg border border-gray-200">
            <div className="text-gray-700 text-sm font-bold mb-2">Total des Invitations</div>
            <div className="text-green-600 text-2xl sm:text-3xl font-black">{referralStats.totalReferrals}</div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-lg border border-gray-200">
            <div className="text-gray-700 text-sm font-bold mb-2">Revenu Total</div>
            <div className="text-green-600 text-2xl sm:text-3xl font-black">F{teamRevenue.toFixed(2)}</div>
          </div>
        </div>

        {/* Code d'Invitation */}
        <div className="bg-white rounded-xl p-4 sm:p-5 mb-4 shadow-lg border border-gray-200">
          <div className="text-gray-800 font-bold mb-3 text-sm sm:text-base">Code d'Invitation</div>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200 gap-2">
            <span className="text-green-600 font-bold text-lg sm:text-xl flex-1">
              {referralStats.referralCode}
            </span>
            <button
              onClick={() => handleCopy(referralStats.referralCode, 'code')}
              className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-1 sm:gap-2 flex-shrink-0"
            >
              <span className="text-xs sm:text-sm">COPIER</span>
            </button>
          </div>
        </div>

        {/* Lien d'Invitation */}
        <div className="bg-white rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-lg border border-gray-200">
          <div className="text-gray-800 font-bold mb-3 text-sm sm:text-base">Lien d'Invitation</div>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200 gap-2">
            <span className="text-green-600 font-bold text-xs sm:text-sm flex-1 truncate">
              {referralStats.referralLink}
            </span>
            <button
              onClick={() => handleCopy(referralStats.referralLink, 'link')}
              className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-1 sm:gap-2 flex-shrink-0"
            >
              <span className="text-xs sm:text-sm">COPIER</span>
            </button>
          </div>
        </div>

        {/* Team Tabs */}
        <div className="flex mb-4">
          <div className="bg-green-500 text-white px-6 py-3 rounded-t-xl font-bold text-sm flex-1 text-center">
            Équipe A
          </div>
          <div className="bg-gray-200 text-gray-600 px-6 py-3 rounded-t-xl font-bold text-sm flex-1 text-center border-l border-white">
            Équipe B
          </div>
          <div className="bg-gray-200 text-gray-600 px-6 py-3 rounded-t-xl font-bold text-sm flex-1 text-center border-l border-white">
            Équipe C
          </div>
        </div>

        {/* Team Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-gray-200">
            <div className="text-green-600 text-2xl font-black mb-1">{referralStats.totalReferrals}</div>
            <div className="text-gray-700 text-sm font-bold">Total des Invitations</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-gray-200">
            <div className="text-green-600 text-2xl font-black mb-1">0</div>
            <div className="text-gray-700 text-sm font-bold">Invitations Valides</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-gray-200">
            <div className="text-green-600 text-2xl font-black mb-1">F{teamRevenue.toFixed(2)}</div>
            <div className="text-gray-700 text-sm font-bold">Revenu Total</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg border border-gray-200">
            <div className="text-green-600 text-2xl font-black mb-1">22</div>
            <div className="text-gray-700 text-sm font-bold">Profit de l'Équipe</div>
          </div>
        </div>

        {/* Team Members Table */}
        {teamMembers.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="p-4 text-gray-700 font-bold text-sm text-center">Mobile</div>
              <div className="p-4 text-gray-700 font-bold text-sm text-center border-l border-gray-200">Niveau</div>
              <div className="p-4 text-gray-700 font-bold text-sm text-center border-l border-gray-200">Investissement</div>
            </div>
            {/* Table Rows */}
            {teamMembers.map((member, index) => (
              <div key={member.uid} className="grid grid-cols-3 border-b border-gray-100 last:border-b-0">
                <div className="p-4 text-gray-800 font-bold text-sm text-center">{member.numeroTel}</div>
                <div className="p-4 text-gray-600 text-sm text-center border-l border-gray-100">A</div>
                <div className="p-4 text-gray-600 text-sm text-center border-l border-gray-100">F0.00</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
            <div className="text-gray-600 font-bold text-base mb-2">Aucun membre dans votre équipe</div>
            <div className="text-gray-500 text-sm">Partagez votre code d'invitation pour commencer !</div>
          </div>
        )}
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

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-green-400 flex items-center gap-3">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="font-bold text-sm">
              ✅ Copié avec succès !
            </div>
          </div>
        </div>
      )}

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
