'use client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ArrowLeft, Phone, Wallet, Lock, Shield } from 'lucide-react'
import SupportFloat from '@/components/SupportFloat/SupportFloat'

export default function CentreMembrePage() {
  const { userData } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header premium */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 px-4 py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <Link href="/compte" className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 transform hover:scale-110">
            <ArrowLeft size={20} className="drop-shadow-sm" />
          </Link>
          <div className="text-center flex-1">
            <div className="text-white text-lg font-bold tracking-wide drop-shadow-md">
              Centre membre
            </div>
            <div className="text-green-100 text-sm font-medium drop-shadow-sm">
              {userData?.numeroTel || 'Utilisateur'}
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 pb-20">
        <div className="space-y-4">
          {/* Numéro de téléphone */}
          <div className="bg-gradient-to-r from-blue-50/40 via-indigo-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50 hover:border-blue-400 group backdrop-blur-sm transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Phone className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                <div>
                  <span className="text-gray-800 text-base font-black tracking-wide group-hover:text-blue-700 transition-colors duration-300">Numéro de téléphone</span>
                  <div className="text-sm text-gray-600 font-medium">{userData?.numeroTel || 'Non défini'}</div>
                </div>
              </div>
              <div className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300 transform group-hover:translate-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Compte de retrait */}
          <Link href="/centre-membre/compte-retrait" className="block w-full">
            <div className="bg-gradient-to-r from-emerald-50/40 via-green-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200/50 hover:border-emerald-400 group backdrop-blur-sm transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <span className="text-white text-lg font-bold drop-shadow-lg">💳</span>
                  </div>
                  <span className="text-gray-800 text-base font-black tracking-wide group-hover:text-emerald-700 transition-colors duration-300">Compte de retrait</span>
                </div>
                <div className="text-gray-400 group-hover:text-emerald-500 transition-colors duration-300 transform group-hover:translate-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Mot de passe de connexion */}
          <Link href="/centre-membre/mot-de-passe-connexion" className="block w-full">
            <div className="bg-gradient-to-r from-purple-50/40 via-violet-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50 hover:border-purple-400 group backdrop-blur-sm transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <span className="text-white text-lg font-bold drop-shadow-lg">🔒</span>
                  </div>
                  <span className="text-gray-800 text-base font-black tracking-wide group-hover:text-purple-700 transition-colors duration-300">Mot de passe de connexion</span>
                </div>
                <div className="text-gray-400 group-hover:text-purple-500 transition-colors duration-300 transform group-hover:translate-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Mot de passe des fonds */}
          <Link href="/centre-membre/mot-de-passe-fonds" className="block w-full">
            <div className="bg-gradient-to-r from-orange-50/40 via-amber-50/40 to-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-200/50 hover:border-orange-400 group backdrop-blur-sm transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-amber-600 to-orange-700 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <span className="text-white text-lg font-bold drop-shadow-lg">🔐</span>
                  </div>
                  <span className="text-gray-800 text-base font-black tracking-wide group-hover:text-orange-700 transition-colors duration-300">Mot de passe des fonds</span>
                </div>
                <div className="text-gray-400 group-hover:text-orange-500 transition-colors duration-300 transform group-hover:translate-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
