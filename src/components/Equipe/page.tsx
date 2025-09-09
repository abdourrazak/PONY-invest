'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, Users, TrendingUp, Award, Target, Copy, Share2, Info } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getMultiLevelReferralStats, MultiLevelReferralStats } from '@/lib/firebaseAuth'

export default function EquipePage() {
  const { userData } = useAuth()
  const [multiLevelStats, setMultiLevelStats] = useState<MultiLevelReferralStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMultiLevelReferralData()
  }, [userData])

  const loadMultiLevelReferralData = async () => {
    if (!userData) return

    try {
      setLoading(true)
      const stats = await getMultiLevelReferralStats(userData)
      setMultiLevelStats(stats)
    } catch (error) {
      console.error('Erreur chargement données parrainage multi-niveaux:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    if (multiLevelStats?.referralLink) {
      navigator.clipboard.writeText(multiLevelStats.referralLink)
      alert('Lien de parrainage copié !')
    }
  }

  const shareReferralLink = () => {
    if (multiLevelStats?.referralLink && navigator.share) {
      navigator.share({
        title: 'Rejoignez AXML Global',
        text: 'Investissez et gagnez avec AXML Global !',
        url: multiLevelStats.referralLink
      })
    } else {
      copyReferralLink()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Mon Équipe</h1>
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Statistiques globales */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="text-center space-y-4">
            <div>
              <div className="text-3xl font-bold text-yellow-400">
                {multiLevelStats?.totalReferrals || 0}
              </div>
              <div className="text-white/70">Total Filleuls</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-400">
                {Math.round(multiLevelStats?.totalRevenue || 0)} FCFA
              </div>
              <div className="text-white/70">Revenus Total</div>
            </div>

            <div className="pt-4 border-t border-white/20">
              <div className="text-sm text-white/70 mb-2">Code de parrainage</div>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-lg">
                {multiLevelStats?.referralCode || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Équipes multi-niveaux */}
        <div className="space-y-4">
          {/* Équipe A */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold">Équipe A</h3>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm font-medium">
                  10%
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{multiLevelStats?.equipeA.count || 0}</div>
                <div className="text-xs text-white/70">Filleuls directs</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/70">Revenus générés</span>
              <span className="text-green-400 font-semibold">
                {Math.round(multiLevelStats?.equipeA.revenue || 0)} FCFA
              </span>
            </div>

            {multiLevelStats?.equipeA.members && multiLevelStats.equipeA.members.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-white/70">Membres récents:</div>
                {multiLevelStats.equipeA.members.slice(0, 3).map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-black/20 rounded-lg p-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {member.numeroTel.slice(-2)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">+{member.numeroTel}</div>
                      <div className="text-xs text-white/50">Filleul direct</div>
                    </div>
                  </div>
                ))}
                {multiLevelStats.equipeA.members.length > 3 && (
                  <div className="text-center text-sm text-white/50">
                    +{multiLevelStats.equipeA.members.length - 3} autres membres
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Équipe B */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold">Équipe B</h3>
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-sm font-medium">
                  5%
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{multiLevelStats?.equipeB.count || 0}</div>
                <div className="text-xs text-white/70">Niveau 2</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/70">Revenus générés</span>
              <span className="text-blue-400 font-semibold">
                {Math.round(multiLevelStats?.equipeB.revenue || 0)} FCFA
              </span>
            </div>

            {multiLevelStats?.equipeB.members && multiLevelStats.equipeB.members.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-white/70">Membres récents:</div>
                {multiLevelStats.equipeB.members.slice(0, 2).map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-black/20 rounded-lg p-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {member.numeroTel.slice(-2)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">+{member.numeroTel}</div>
                      <div className="text-xs text-white/50">Niveau 2</div>
                    </div>
                  </div>
                ))}
                {multiLevelStats.equipeB.members.length > 2 && (
                  <div className="text-center text-sm text-white/50">
                    +{multiLevelStats.equipeB.members.length - 2} autres membres
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Équipe C */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold">Équipe C</h3>
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-sm font-medium">
                  3%
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{multiLevelStats?.equipeC.count || 0}</div>
                <div className="text-xs text-white/70">Niveau 3</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/70">Revenus générés</span>
              <span className="text-purple-400 font-semibold">
                {Math.round(multiLevelStats?.equipeC.revenue || 0)} FCFA
              </span>
            </div>

            {multiLevelStats?.equipeC.members && multiLevelStats.equipeC.members.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-white/70">Membres récents:</div>
                {multiLevelStats.equipeC.members.slice(0, 2).map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-black/20 rounded-lg p-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {member.numeroTel.slice(-2)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">+{member.numeroTel}</div>
                      <div className="text-xs text-white/50">Niveau 3</div>
                    </div>
                  </div>
                ))}
                {multiLevelStats.equipeC.members.length > 2 && (
                  <div className="text-center text-sm text-white/50">
                    +{multiLevelStats.equipeC.members.length - 2} autres membres
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions de partage */}
        <div className="space-y-3">
          <button
            onClick={shareReferralLink}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Share2 className="w-5 h-5" />
            <span>Partager mon lien</span>
          </button>

          <button
            onClick={copyReferralLink}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 border border-white/20"
          >
            <Copy className="w-5 h-5" />
            <span>Copier le lien</span>
          </button>
        </div>

        {/* Informations sur les bonus */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
          <div className="flex items-center space-x-2 mb-4">
            <Info className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-400">Système de Bonus</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Équipe A (Filleuls directs)</span>
              <span className="text-green-400 font-semibold">10%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Équipe B (Niveau 2)</span>
              <span className="text-blue-400 font-semibold">5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Équipe C (Niveau 3)</span>
              <span className="text-purple-400 font-semibold">3%</span>
            </div>
            
            <div className="pt-3 border-t border-white/20 text-xs text-white/60">
              Les bonus sont calculés sur les gains de vos filleuls dans chaque équipe.
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link href="/" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">🏠</span>
            </div>
            <span className="text-white/70 text-xs">Accueil</span>
          </Link>
          <Link href="/adoption" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">📊</span>
            </div>
            <span className="text-white/70 text-xs">Mon Produit</span>
          </Link>
          <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-1 shadow-lg">
              <span className="text-white text-xs">👥</span>
            </div>
            <span className="text-purple-400 text-xs font-semibold">Équipe</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👤</span>
            </div>
            <span className="text-white/70 text-xs">Mon Compte</span>
          </Link>
        </div>
      </div>

      <SupportFloat />
    </div>
  )
}
