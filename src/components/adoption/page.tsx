'use client'
import { useState } from 'react'
import Link from 'next/link'
import NavigationLink from '../NavigationLink/NavigationLink'
import { ArrowLeft } from 'lucide-react'

export default function AdoptionPage() {
  const [activeTab, setActiveTab] = useState('valide')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 px-4 py-5 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-green-400/20 to-blue-500/20 animate-pulse"></div>
        <div className="relative z-10 flex items-center justify-between">
          <NavigationLink href="/" className="hover:scale-110 transition-transform duration-200">
            <ArrowLeft className="text-white" size={20} />
          </NavigationLink>
          <div className="flex items-center">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-base">📊</span>
            </div>
            <h1 className="text-white text-base font-black tracking-wide drop-shadow-lg">Mon Produit</h1>
          </div>
          <div className="w-5"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-5 py-5">
        {/* Stats Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 mb-5 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-white text-3xl font-black mb-1">0</div>
              <div className="text-green-100 text-sm font-medium">Total des Actifs</div>
            </div>
            <div className="text-center">
              <div className="text-white text-3xl font-black mb-1">F0.00</div>
              <div className="text-green-100 text-sm font-medium">Revenu Total</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-5 gap-3">
          <button
            onClick={() => setActiveTab('valide')}
            className={`flex-1 py-3 px-5 rounded-full font-bold text-sm transition-all duration-300 ${
              activeTab === 'valide'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-white text-green-600 border-2 border-green-200 hover:border-green-400'
            }`}
          >
            Valide
          </button>
          <button
            onClick={() => setActiveTab('expire')}
            className={`flex-1 py-3 px-5 rounded-full font-bold text-sm transition-all duration-300 ${
              activeTab === 'expire'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-white text-green-600 border-2 border-green-200 hover:border-green-400'
            }`}
          >
            Expiré
          </button>
        </div>

        {/* Content */}
        <div className="text-center py-10">
          <div className="text-gray-600 text-base font-medium mb-3">Plus de Données.</div>
          
          {activeTab === 'valide' && (
            <div className="text-gray-500 text-xs">
              Aucun produit valide pour le moment.
            </div>
          )}
          
          {activeTab === 'expire' && (
            <div className="text-gray-500 text-xs">
              Aucun produit expiré pour le moment.
            </div>
          )}
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
