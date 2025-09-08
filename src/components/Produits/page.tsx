'use client'
import { useState } from 'react'
import { ArrowLeft, Bell } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function ProduitsPage() {
  const [activeTab, setActiveTab] = useState('Fixe')

  // Définir les produits par catégorie
  const productsByCategory = {
    'Fixe': ['LV1', 'LV2', 'LV3', 'LV4', 'LV5', 'LV6', 'LV7'],
    'Activité': []
  }

  const currentProducts = productsByCategory[activeTab] || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-white/10">
                <ArrowLeft size={20} />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full shadow-xl border-2 border-white/20 flex items-center justify-center relative animate-pulse">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-95 animate-spin" style={{animationDuration: '10s'}}></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-white text-xs mb-0.5">🌍</div>
                  <span className="text-white font-bold text-[8px] leading-none">Global</span>
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">GLOBAL</h1>
                <p className="text-white/60 text-xs">Forfaits d'investissement</p>
              </div>
            </div>
            <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
              <Bell size={18} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-sm px-4 py-3 sticky top-0 z-10 border-b border-white/10">
        <div className="max-w-md mx-auto">
          <div className="flex space-x-3 mb-4">
            {['Fixe', 'Activité'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl'
                    : 'bg-black/30 backdrop-blur-sm text-white/70 hover:bg-black/40 border border-white/20'
                }`}
              >
                {tab === 'Fixe' ? '💰 Fixe' : '⚡ Activité'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products List */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-4 pb-20">
        {currentProducts.includes('LV1') && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV1</span>
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p1.png" alt="LV1" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Prix :</span>
                  <span className="text-blue-400 text-xs sm:text-sm font-black">3 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Par jour :</span>
                  <span className="text-purple-400 text-xs sm:text-sm font-black">+600 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Durée :</span>
                  <span className="text-pink-400 text-xs sm:text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">3 000 FCFA</span>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV2') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV2</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p2.png" alt="LV2" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Prix :</span>
                  <span className="text-blue-400 text-xs sm:text-sm font-black">5 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Par jour :</span>
                  <span className="text-purple-400 text-xs sm:text-sm font-black">+1 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Durée :</span>
                  <span className="text-pink-400 text-xs sm:text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">5 000 FCFA</span>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV3') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV3</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p3.png" alt="LV3" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Prix :</span>
                  <span className="text-blue-400 text-xs sm:text-sm font-black">7 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Par jour :</span>
                  <span className="text-purple-400 text-xs sm:text-sm font-black">+2 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Durée :</span>
                  <span className="text-pink-400 text-xs sm:text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">7 000 FCFA</span>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV4') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV4</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p4.png" alt="LV4" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Prix :</span>
                  <span className="text-blue-400 text-xs sm:text-sm font-black">12 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Par jour :</span>
                  <span className="text-purple-400 text-xs sm:text-sm font-black">+2 400 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Durée :</span>
                  <span className="text-pink-400 text-xs sm:text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">12 000 FCFA</span>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV5') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV5</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p5.png" alt="LV5" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Prix :</span>
                  <span className="text-blue-400 text-xs sm:text-sm font-black">20 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Par jour :</span>
                  <span className="text-purple-400 text-xs sm:text-sm font-black">+4 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Durée :</span>
                  <span className="text-pink-400 text-xs sm:text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">20 000 FCFA</span>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV6') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV6</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p6.png" alt="LV6" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Prix :</span>
                  <span className="text-blue-400 text-xs sm:text-sm font-black">50 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Par jour :</span>
                  <span className="text-purple-400 text-xs sm:text-sm font-black">+10 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Durée :</span>
                  <span className="text-pink-400 text-xs sm:text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">50 000 FCFA</span>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV7') && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-purple-500 text-white px-3 py-1 rounded text-sm font-bold">LV7</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex-shrink-0 overflow-hidden">
              <Image src="/p7.png" alt="LV7" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/10">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Prix :</span>
                  <span className="text-blue-400 text-xs sm:text-sm font-black">95 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Par jour :</span>
                  <span className="text-purple-400 text-xs sm:text-sm font-black">+19 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-white/70 text-xs sm:text-sm font-bold">Durée :</span>
                  <span className="text-pink-400 text-xs sm:text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-yellow-400 font-bold text-lg">95 000 FCFA</span>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}


        {/* Empty state */}
        {currentProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/70 text-lg mb-2">Aucun produit disponible</div>
            <div className="text-white/50 text-sm">dans la catégorie {activeTab}</div>
          </div>
        )}
      </main>

      {/* Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-t border-white/10 px-4 py-2">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">🏠</span>
            </div>
            <span className="text-white/70 text-xs">Accueil</span>
          </Link>
          <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">📊</span>
            </div>
            <span className="text-purple-400 text-xs font-medium">Produits</span>
          </Link>
          <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👥</span>
            </div>
            <span className="text-white/70 text-xs">Équipe</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👤</span>
            </div>
            <span className="text-white/70 text-xs">Mon Compte</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
