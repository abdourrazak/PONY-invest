'use client'
import Link from 'next/link'
import NavigationLink from '../NavigationLink/NavigationLink'
import { ArrowLeft } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'
import Image from 'next/image'

export default function ProposPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <NavigationLink href="/" className="hover:scale-110 transition-transform duration-200">
              <ArrowLeft className="text-white" size={20} />
            </NavigationLink>
            <div className="flex items-center">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mr-3 border border-white/30">
                <span className="text-white text-base">ℹ️</span>
              </div>
              <h1 className="text-white text-base font-black tracking-wide drop-shadow-lg">À propos de Pony AI</h1>
            </div>
            <div className="w-5"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Company Logo & Title */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6 shadow-xl">
            <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
              <Image src="/ponyAI.png" alt="Pony AI Logo" width={96} height={96} className="object-cover w-full h-full" unoptimized />
            </div>
            <h1 className="text-3xl font-black mb-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">Pony AI Inc.</h1>
            <div className="w-20 h-1 bg-white/50 mx-auto mb-3 rounded-full"></div>
            <p className="text-white/80 text-sm leading-relaxed font-medium">
              <span className="font-bold text-white">Pionnier de la Conduite Autonome</span> - Leader mondial dans le développement 
              de technologies de véhicules autonomes et d'intelligence artificielle pour la mobilité du futur.
            </p>
          </div>
        </div>

        {/* Company Overview Section */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <div>
              <div className="w-16 h-1.5 bg-gradient-to-r from-green-500 to-blue-500 mb-2 rounded-full"></div>
              <h2 className="text-xl font-black text-white">Aperçu de l'Entreprise</h2>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Siège Social */}
            <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <div className="text-blue-400 text-xs font-bold mb-2">Siège Social</div>
              <div className="text-white text-sm font-black">Fremont, CA, USA</div>
            </div>

            {/* Fondation */}
            <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                </svg>
              </div>
              <div className="text-green-400 text-xs font-bold mb-2">Fondation</div>
              <div className="text-white text-sm font-black">2016</div>
            </div>

            {/* Employés */}
            <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="text-purple-400 text-xs font-bold mb-2">Employés</div>
              <div className="text-white text-sm font-black">+1 000</div>
            </div>

            {/* Secteur */}
            <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-orange-400 text-xs font-bold mb-2">Secteur</div>
              <div className="text-white text-sm font-black">Véhicules Autonomes</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">🚗</span>
            </div>
            <h3 className="text-lg font-black text-white">Notre Spécialité</h3>
          </div>
          <p className="text-white/80 text-sm leading-relaxed font-medium">
            Pony AI est spécialisée dans le <span className="font-black text-blue-400">développement de technologies de conduite autonome</span> et 
            d'intelligence artificielle pour révolutionner la mobilité. Nos solutions sont 
            <span className="font-black text-green-400">à la pointe de l'innovation</span> dans l'industrie des véhicules autonomes.
          </p>
        </div>

        {/* Autonomous Technology Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-white/20">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Technologie Autonome - Notre Innovation Phare</h3>
            </div>
          </div>

          {/* Robotrust Image */}
          <div className="relative rounded-lg overflow-hidden mb-4">
            <Image 
              src="/Robotrust.png" 
              alt="Technologie Robotrust Pony AI" 
              width={400}
              height={200}
              className="w-full h-48 object-cover"
              unoptimized
            />
          </div>

          {/* Autonomous Content */}
          <div className="p-5">
            <h4 className="text-lg font-bold text-white mb-3">Robotrust - Intelligence Artificielle Avancée</h4>
            
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Pony AI développe des <span className="font-semibold text-white">systèmes de conduite autonome de niveau 4 et 5</span> utilisant l'intelligence artificielle 
              la plus avancée. Notre technologie Robotrust permet une <span className="font-semibold text-white">conduite entièrement autonome</span> 
              dans des environnements urbains complexes.
            </p>

            {/* Applications Section */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
              <h5 className="text-white font-semibold text-sm mb-3">Applications Principales :</h5>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-0.5">•</span>
                  <span className="text-white/80 text-sm">Robotaxis autonomes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-0.5">•</span>
                  <span className="text-white/80 text-sm">Livraison autonome</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-0.5">•</span>
                  <span className="text-white/80 text-sm">Transport public intelligent</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-0.5">•</span>
                  <span className="text-white/80 text-sm">Logistique et fret</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-0.5">•</span>
                  <span className="text-white/80 text-sm">Véhicules personnels autonomes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team Management Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-white/20">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Équipe de Direction Mondiale</h3>
            </div>
          </div>

          {/* Team Image */}
          <div className="relative rounded-lg overflow-hidden mb-4">
            <Image 
              src="/TeamManager.png" 
              alt="Équipe de direction Pony AI" 
              width={400}
              height={200}
              className="w-full h-48 object-cover"
              unoptimized
            />
          </div>

          {/* Content */}
          <div className="p-5">
            <h4 className="text-lg font-bold text-white mb-3">Leadership d'Excellence</h4>
            
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Pony AI est dirigée par une <span className="font-semibold text-white">équipe d'experts de renommée mondiale</span> issus des plus grandes entreprises 
              technologiques. Notre leadership combine expertise technique et vision stratégique pour <span className="font-semibold text-white">révolutionner la mobilité</span>.
            </p>

            {/* Leadership Section */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 mb-4">
              <h5 className="text-white font-semibold text-sm mb-3">Expertise Clé :</h5>
              <div className="flex flex-wrap gap-3">
                <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Intelligence Artificielle</span>
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">Robotique</span>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">Vision par Ordinateur</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Expansion Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-white/20">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Expansion Mondiale</h3>
            </div>
          </div>

          {/* Global Expansion Image */}
          <div className="relative rounded-lg overflow-hidden mb-4">
            <Image 
              src="/GlobalExpanssion.png" 
              alt="Expansion mondiale Pony AI" 
              width={400}
              height={200}
              className="w-full h-48 object-cover"
              unoptimized
            />
          </div>

          {/* Content */}
          <div className="p-5">
            <h4 className="text-lg font-bold text-white mb-3">Présence Internationale</h4>
            
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Pony AI opère dans <span className="font-semibold text-white">plusieurs marchés clés mondiaux</span> avec des centres de R&D et des déploiements 
              commerciaux en Amérique du Nord, en Chine et en expansion vers l'Europe et d'autres régions stratégiques.
            </p>

            {/* Markets Section */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
              <h5 className="text-white font-semibold text-sm mb-3">Marchés Principaux :</h5>
              <div className="grid grid-cols-2 gap-2">
                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium text-center">🇺🇸 États-Unis</span>
                <span className="bg-gradient-to-r from-red-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium text-center">🇨🇳 Chine</span>
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium text-center">🇪🇺 Europe</span>
                <span className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium text-center">🌏 Asie-Pacifique</span>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Opportunity Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-white/20">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Opportunité d'Investissement</h3>
            </div>
          </div>

          {/* Investment Cards */}
          <div className="p-5 space-y-4">
            {/* Pionnier Technologique Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-base mb-2">Pionnier de la Conduite Autonome</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Leader technologique dans un marché en forte expansion avec des perspectives de croissance exceptionnelles.
                  </p>
                </div>
              </div>
            </div>

            {/* Marché en Expansion Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h5V2a1 1 0 011-1h2.586a1 1 0 011.707.293l2.586 2.586a1 1 0 010 1.414l-2.586 2.586a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-base mb-2">Marché en Forte Expansion</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Le marché des véhicules autonomes connaît une croissance exponentielle avec des applications multiples.
                  </p>
                </div>
              </div>
            </div>

            {/* Innovation Continue Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-base mb-2">Innovation Continue</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Investissement massif en R&D pour maintenir l'avance technologique et développer de nouvelles solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Future Perspectives Section */}
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-white/20">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Perspectives d'Avenir</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-white text-sm leading-relaxed mb-4">
              Dans l'industrie des véhicules autonomes, la demande pour une <span className="font-semibold text-yellow-400">mobilité plus sûre</span>, des <span className="font-semibold text-green-400">coûts 
              de transport réduits</span> et des <span className="font-semibold text-pink-400">solutions plus intelligentes</span> représente une opportunité de croissance à long terme pour 
              Pony AI.
            </p>
            
            <p className="text-white text-sm leading-relaxed mb-4">
              Nos technologies restent un <span className="font-semibold text-orange-400">élément essentiel</span> de la révolution de la mobilité, et nos partenaires 
              s'appuieront sur l'innovation de Pony AI pour les décennies à venir.
            </p>

            {/* Strategic Positioning Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 mt-4">
              <h4 className="text-white font-semibold text-sm mb-2">Positionnement Stratégique</h4>
              <p className="text-white/80 text-xs leading-relaxed">
                Pony AI continue d'investir massivement dans la R&D pour maintenir son avance technologique et développer 
                les solutions de mobilité autonome de demain.
              </p>
            </div>
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
          <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">📊</span>
            </div>
            <span className="text-white/70 text-xs">Produits</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👤</span>
            </div>
            <span className="text-white/70 text-xs">Compte</span>
          </Link>
          <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👥</span>
            </div>
            <span className="text-white/70 text-xs">Équipe</span>
          </Link>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
