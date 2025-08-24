'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AdoptionPage() {
  const [activeTab, setActiveTab] = useState('valide')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 px-4 py-5 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-green-400/20 to-blue-500/20 animate-pulse"></div>
        <div className="relative z-10 flex items-center">
          <Link href="/" className="mr-3 hover:scale-110 transition-transform duration-200">
            <ArrowLeft className="text-white" size={20} />
          </Link>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">📊</span>
            </div>
            <h1 className="text-white text-lg font-black tracking-wide drop-shadow-lg">Mon Produit</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-5 py-5">
        {/* Stats Card */}
        <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl p-6 mb-6 shadow-xl border border-white/20">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">📈</span>
                <div className="text-white text-3xl font-black">0</div>
              </div>
              <div className="text-white/80 text-sm font-bold">Total des Actifs</div>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">💰</span>
                <div className="text-white text-3xl font-black">F0.00</div>
              </div>
              <div className="text-white/80 text-sm font-bold">Revenu Total</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 gap-4">
          <button
            onClick={() => setActiveTab('valide')}
            className={`flex-1 py-4 px-6 rounded-xl font-black text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
              activeTab === 'valide'
                ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white shadow-green-200'
                : 'bg-white/95 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:shadow-blue-200'
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
                ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white shadow-green-200'
                : 'bg-white/95 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:shadow-blue-200'
            }`}
          >
            <div className="flex items-center justify-center">
              <span className="mr-2">❌</span>
              Expiré
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📊</span>
            </div>
            <div className="text-gray-700 text-lg font-black mb-4">Plus de Données</div>
            
            {activeTab === 'valide' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-xl mr-2">✅</span>
                  <span className="text-green-700 font-bold text-sm">Produits Valides</span>
                </div>
                <div className="text-green-600 text-xs font-medium">
                  Aucun produit valide pour le moment.
                </div>
              </div>
            )}
            
            {activeTab === 'expire' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-xl mr-2">❌</span>
                  <span className="text-red-700 font-bold text-sm">Produits Expirés</span>
                </div>
                <div className="text-red-600 text-xs font-medium">
                  Aucun produit expiré pour le moment.
                </div>
              </div>
            )}
          </div>
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
          <Link href="/adoption" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">📊</span>
            </div>
            <span className="text-green-600 text-xs font-medium">Mon Produit</span>
          </Link>
          <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">👥</span>
            </div>
            <span className="text-gray-500 text-xs">Équipe</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">👤</span>
            </div>
            <span className="text-gray-500 text-xs">Mon Compte</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
