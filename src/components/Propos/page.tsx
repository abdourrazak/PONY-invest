'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SupportFloat from '../SupportFloat/SupportFloat'

export default function ProposPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-500 px-4 py-4 relative">
        <div className="flex items-center justify-center">
          <Link href="/" className="absolute left-4">
            <ArrowLeft size={24} className="text-white" />
          </Link>
          <h1 className="text-white text-lg font-medium">À propos de Global</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 pb-20">
        {/* Company Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-black mb-4">Global Holdings</h1>
          <p className="text-gray-600 text-sm leading-relaxed px-2">
            <span className="font-semibold text-black">Advanced Semiconductor Materials Lithography</span> - Le leader mondial dans la fabrication 
            de machines de lithographie ultra-sophistiquées pour la production de puces 
            électroniques de nouvelle génération.
          </p>
        </div>

        {/* Company Overview Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-black">Aperçu de l'Entreprise</h2>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Siège Social */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-gray-600 text-xs font-medium mb-1">Siège Social</div>
              <div className="text-black text-sm font-semibold">Veldhoven, Pays-Bas</div>
            </div>

            {/* Fondation */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-gray-600 text-xs font-medium mb-1">Fondation</div>
              <div className="text-black text-sm font-semibold">1984</div>
            </div>

            {/* Employés */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="text-gray-600 text-xs font-medium mb-1">Employés</div>
              <div className="text-black text-sm font-semibold">+40 000</div>
            </div>

            {/* Secteur */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-gray-600 text-xs font-medium mb-1">Secteur</div>
              <div className="text-black text-sm font-semibold">Semi-conducteurs</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <p className="text-gray-700 text-sm leading-relaxed">
            Global est spécialisée dans la <span className="font-semibold text-black">fabrication de machines de lithographie ultra-sophistiquées</span> qui 
            permettent de graver des circuits microscopiques sur les microprocesseurs. Ces équipements sont 
            indispensables pour la production de puces électroniques modernes.
          </p>
        </div>

        {/* EUV Technology Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-black">Technologie EUV - Notre Innovation Phare</h3>
            </div>
          </div>

          {/* EUV Image */}
          <div className="relative">
            <img 
              src="/src/public/asml2.jpeg" 
              alt="Technologie EUV Global" 
              className="w-full h-48 object-cover"
            />
          </div>

          {/* EUV Content */}
          <div className="p-5">
            <h4 className="text-lg font-bold text-black mb-3">Extreme Ultraviolet Lithography (EUV)</h4>
            
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Global est <span className="font-semibold text-black">la seule entreprise au monde</span> à maîtriser cette technologie révolutionnaire. L'EUV permet de 
              fabriquer des puces électroniques extrêmement fines et puissantes, notamment les processeurs de <span className="font-semibold text-black">3 
              nanomètres ou moins</span>.
            </p>

            {/* Applications Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="text-blue-600 font-semibold text-sm mb-3">Applications Principales :</h5>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                  <span className="text-blue-600 text-sm">Smartphones de nouvelle génération</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                  <span className="text-blue-600 text-sm">Ordinateurs haute performance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                  <span className="text-blue-600 text-sm">Voitures autonomes et électriques</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                  <span className="text-blue-600 text-sm">Objets connectés (IoT)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                  <span className="text-blue-600 text-sm">Intelligence artificielle</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Strategic Position Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-black">Position Stratégique Mondiale</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h4 className="text-lg font-bold text-black mb-3">Quasi-Monopole EUV</h4>
            
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Global détient un <span className="font-semibold text-black">quasi-monopole mondial</span> dans les équipements EUV. Sans Global, aucun grand 
              fabricant de puces ne peut produire les dernières générations de processeurs.
            </p>

            {/* Clients Section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h5 className="text-green-600 font-semibold text-sm mb-3">Clients Principaux :</h5>
              <div className="flex flex-wrap gap-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">TSMC</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Intel</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Samsung</span>
              </div>
            </div>

            {/* Strategic Image */}
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src="/src/public/banner2.jpeg" 
                alt="Position stratégique Global" 
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Investment Opportunity Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-black">Opportunité d'Investissement</h3>
            </div>
          </div>

          {/* Investment Cards */}
          <div className="p-5 space-y-4">
            {/* Leader Mondial Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-blue-600 font-semibold text-base mb-2">Leader Mondial Ultra Spécialisé</h4>
                  <p className="text-blue-600 text-sm leading-relaxed">
                    Position dominante dans un secteur technologique critique avec des barrières d'entrée extrêmement élevées.
                  </p>
                </div>
              </div>
            </div>

            {/* Forte Croissance Card */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.414 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-green-600 font-semibold text-base mb-2">Forte Croissance</h4>
                  <p className="text-green-600 text-sm leading-relaxed">
                    Croissance soutenue grâce à la demande mondiale croissante en puces électroniques et en intelligence artificielle.
                  </p>
                </div>
              </div>
            </div>

            {/* Position Incontournable Card */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-purple-600 font-semibold text-base mb-2">Position Incontournable</h4>
                  <p className="text-purple-600 text-sm leading-relaxed">
                    Technologie exclusive et indispensable pour tous les grands fabricants de semi-conducteurs mondiaux.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Shareholders Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-black">Actionnariat Institutionnel</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              Les principaux actionnaires d'Global incluent des <span className="font-semibold text-black">institutions financières de renom</span> et des fonds de 
              pension internationaux, témoignant de la confiance du marché dans la stratégie et la performance 
              de l'entreprise.
            </p>

            {/* Institutional Investors Cards */}
            <div className="space-y-3">
              {/* BlackRock */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                      <path fillRule="evenodd" d="M3 8a2 2 0 012-2v9a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-gray-800 font-medium text-sm">BlackRock</h4>
                </div>
              </div>

              {/* Vanguard */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <h4 className="text-gray-800 font-medium text-sm">Vanguard</h4>
                </div>
              </div>

              {/* Amundi */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-gray-800 font-medium text-sm">Amundi</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Future Perspectives Section */}
        <div className="bg-blue-600 rounded-xl shadow-sm overflow-hidden mt-6 text-white">
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-blue-500">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 101.414 1.414l2-2a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Perspectives d'Avenir</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-white text-sm leading-relaxed mb-4">
              Dans l'industrie des semi-conducteurs, la demande pour une <span className="font-semibold">productivité plus élevée</span>, des <span className="font-semibold">coûts 
              plus bas</span> et des <span className="font-semibold">processus plus simples</span> représente une opportunité de croissance à long terme pour 
              Global.
            </p>
            
            <p className="text-white text-sm leading-relaxed mb-4">
              Ses machines restent un <span className="font-semibold">élément essentiel</span> de la chaîne d'approvisionnement en puces, et ses clients 
              s'appuieront sur la technologie d'Global pour les années à venir.
            </p>

            {/* Strategic Positioning Box */}
            <div className="bg-blue-700 rounded-lg p-4 mt-4">
              <h4 className="text-white font-semibold text-sm mb-2">Positionnement Stratégique</h4>
              <p className="text-white text-xs leading-relaxed">
                Global continue d'investir massivement dans la R&D pour maintenir son avance technologique et répondre aux 
                besoins futurs de l'industrie des semi-conducteurs.
              </p>
            </div>
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
          <Link href="/produits" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">📊</span>
            </div>
            <span className="text-gray-500 text-xs">Produits</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">👤</span>
            </div>
            <span className="text-gray-500 text-xs">Compte</span>
          </Link>
          <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
              <span className="text-gray-500 text-xs">👥</span>
            </div>
            <span className="text-gray-500 text-xs">Équipe</span>
          </Link>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
