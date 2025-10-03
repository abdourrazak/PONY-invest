'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell } from 'lucide-react'
import Image from 'next/image'

export default function AdoptionPage() {
  const [activeTab, setActiveTab] = useState('valide')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full shadow-xl border-2 border-white/20 flex items-center justify-center relative animate-pulse overflow-hidden">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-95 animate-spin" style={{animationDuration: '10s'}}></div>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <Image src="/ponyAI.png" alt="PONY AI" width={40} height={40} className="object-cover w-full h-full rounded-full" unoptimized />
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MON PRODUIT</h1>
                <p className="text-white/60 text-xs">Gestion des investissements</p>
              </div>
            </div>
            <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
              <Bell size={18} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Stats Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">📈</span>
                <div className="text-white text-3xl font-black">0</div>
              </div>
              <div className="text-white/70 text-sm font-bold">Total des Actifs</div>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">💰</span>
                <div className="text-green-400 text-3xl font-black">F0.00</div>
              </div>
              <div className="text-white/70 text-sm font-bold">Revenu Total</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('valide')}
            className={`flex-1 py-4 px-6 rounded-xl font-black text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
              activeTab === 'valide'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200'
                : 'bg-white/10 backdrop-blur-sm text-white/70 border border-white/20 hover:border-white/40 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center justify-center">
              <span className="mr-2">✅</span>
              Valide
            </div>
          </button>
          <button
            onClick={() => setActiveTab('expire')}
            className={`flex-1 py-4 px-6 rounded-xl font-black text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
              activeTab === 'expire'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200'
                : 'bg-white/10 backdrop-blur-sm text-white/70 border border-white/20 hover:border-white/40 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center justify-center">
              <span className="mr-2">❌</span>
              Expiré
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
              <span className="text-4xl">📊</span>
            </div>
            <div className="text-white text-lg font-black mb-4">Plus de Données</div>
            
            {activeTab === 'valide' && (
              <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-xl mr-2">✅</span>
                  <span className="text-green-400 font-bold text-sm">Produits Valides</span>
                </div>
                <div className="text-green-300 text-xs font-medium">
                  Aucun produit valide pour le moment.
                </div>
              </div>
            )}
            
            {activeTab === 'expire' && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-xl mr-2">❌</span>
                  <span className="text-red-400 font-bold text-sm">Produits Expirés</span>
                </div>
                <div className="text-red-300 text-xs font-medium">
                  Aucun produit expiré pour le moment.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

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
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-1 shadow-lg">
              <span className="text-white text-xs">📊</span>
            </div>
            <span className="text-purple-400 text-xs font-semibold">Mon Produit</span>
          </Link>
          <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👥</span>
            </div>
            <span className="text-white/70 text-xs">Équipe</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👤</span>
            </div>
            <span className="text-white/70 text-xs">Mon Compte</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
