'use client'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 px-4 py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-white hover:text-green-200 transition-colors p-2 rounded-lg hover:bg-white/10">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-white text-xl font-bold">💎 Forfaits d'investissement</h1>
          <div className="w-6"></div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg sticky top-0 z-10 border-b border-gray-200">
        <div className="flex space-x-3 mb-4">
          {['Fixe', 'Activité'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-xl'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
              }`}
            >
              {tab === 'Fixe' ? '💰 Fixe' : '⚡ Activité'}
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      <main className="px-4 py-4 pb-20">
        {currentProducts.includes('LV1') && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 relative shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV1</span>
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Standard</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
              <Image src="/p1.png" alt="LV1" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Prix :</span>
                  <span className="text-blue-600 text-sm font-black">3 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Par jour :</span>
                  <span className="text-green-600 text-sm font-black">+600 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Durée :</span>
                  <span className="text-purple-600 text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-red-600 font-bold text-lg">3 000 FCFA</span>
            <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV2') && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV2</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
              <Image src="/p2.png" alt="LV2" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Prix :</span>
                  <span className="text-blue-600 text-sm font-black">5 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Par jour :</span>
                  <span className="text-green-600 text-sm font-black">+1 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Durée :</span>
                  <span className="text-purple-600 text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-red-600 font-bold text-lg">5 000 FCFA</span>
            <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV3') && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV3</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
              <Image src="/p3.png" alt="LV3" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Prix :</span>
                  <span className="text-blue-600 text-sm font-black">7 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Par jour :</span>
                  <span className="text-green-600 text-sm font-black">+2 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Durée :</span>
                  <span className="text-purple-600 text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-red-600 font-bold text-lg">7 000 FCFA</span>
            <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV4') && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV4</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
              <Image src="/p4.png" alt="LV4" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Prix :</span>
                  <span className="text-blue-600 text-sm font-black">12 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Par jour :</span>
                  <span className="text-green-600 text-sm font-black">+2 400 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Durée :</span>
                  <span className="text-purple-600 text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-red-600 font-bold text-lg">12 000 FCFA</span>
            <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV5') && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV5</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
              <Image src="/p5.png" alt="LV5" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Prix :</span>
                  <span className="text-blue-600 text-sm font-black">20 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Par jour :</span>
                  <span className="text-green-600 text-sm font-black">+4 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Durée :</span>
                  <span className="text-purple-600 text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-red-600 font-bold text-lg">20 000 FCFA</span>
            <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV6') && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV6</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
              <Image src="/p6.png" alt="LV6" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Prix :</span>
                  <span className="text-blue-600 text-sm font-black">50 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Par jour :</span>
                  <span className="text-green-600 text-sm font-black">+10 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Durée :</span>
                  <span className="text-purple-600 text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-red-600 font-bold text-lg">50 000 FCFA</span>
            <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}

        {currentProducts.includes('LV7') && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 relative hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">LV7</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">Promo</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex-shrink-0 overflow-hidden">
              <Image src="/p7.png" alt="LV7" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Prix :</span>
                  <span className="text-blue-600 text-sm font-black">95 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Par jour :</span>
                  <span className="text-green-600 text-sm font-black">+19 000 FCFA</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-center">
                  <span className="text-gray-800 text-sm font-bold">Durée :</span>
                  <span className="text-purple-600 text-sm font-black">30 jours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-red-600 font-bold text-lg">95 000 FCFA</span>
            <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              Louer Maintenant
            </button>
          </div>
        </div>
        )}


        {/* Empty state */}
        {currentProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">Aucun produit disponible</div>
            <div className="text-gray-400 text-sm">dans la catégorie {activeTab}</div>
          </div>
        )}
      </main>

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
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">📊</span>
            </div>
            <span className="text-green-600 text-xs font-medium">Produits</span>
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
