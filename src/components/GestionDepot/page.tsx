'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Copy, Upload, X } from 'lucide-react'
import { createTransaction } from '@/lib/transactions'
import { CreateTransactionData } from '@/types/transactions'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Fonction pour hasher le mot de passe avec SHA-256
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

interface GestionDepotProps {
  paymentMethod?: 'orange' | 'mtn' | 'crypto'
}

export default function GestionDepot({ paymentMethod = 'orange' }: GestionDepotProps) {
  const { currentUser, userData } = useAuth()
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [transactionImage, setTransactionImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [fundsPassword, setFundsPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasConfiguredPassword, setHasConfiguredPassword] = useState(false)

  const isOrange = paymentMethod === 'orange'
  const isMTN = paymentMethod === 'mtn'
  const isCrypto = paymentMethod === 'crypto'

  const beneficiaryCode = isOrange 
    ? "#150*46*0535612#" 
    : isMTN 
    ? "*126*1*1*655434565#" 
    : "1038166766"
  
  const beneficiaryName = isOrange 
    ? "SOMBRE Abd.." 
    : isMTN 
    ? "SOMBRE Abd.." 
    : "TLjWdzsFMMifpBuShQu4kGrUbSxmbLanFt"
  
  const serviceName = isOrange 
    ? "Orange Money Cameroun" 
    : isMTN 
    ? "MTN Mobile Money" 
    : "Cryptomonnaie (USDT TRC20) 1USDT = 600 FCFA"
  
  const logoSrc = isOrange 
    ? "/org.png" 
    : isMTN 
    ? "/mtn.png" 
    : "₿"
  
  const headerColors = isOrange 
    ? "from-orange-500 via-orange-600 to-red-500" 
    : isMTN
    ? "from-yellow-500 via-yellow-600 to-orange-500"
    : "from-blue-500 via-purple-600 to-indigo-600"
  
  const accentColors = isOrange
    ? { primary: "blue", secondary: "orange" }
    : isMTN
    ? { primary: "yellow", secondary: "red" }
    : { primary: "blue", secondary: "purple" }

  // Vérifier si l'utilisateur a configuré un mot de passe des fonds
  useEffect(() => {
    if (currentUser) {
      const checkFundsPassword = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setHasConfiguredPassword(!!data.fundsPassword?.hash)
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du mot de passe:', error)
        }
      }
      checkFundsPassword()
    }
  }, [currentUser])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setTransactionImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setTransactionImage(null)
    setImagePreview(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleSubmit = async () => {
    if (!amount || !transactionImage || !currentUser || !userData) return

    // Vérifier si l'utilisateur a configuré un mot de passe des fonds
    if (!hasConfiguredPassword) {
      alert('Vous devez d\'abord configurer un mot de passe des fonds dans le Centre membre')
      router.push('/centre-membre/mot-de-passe-fonds')
      return
    }

    // Vérifier le mot de passe des fonds
    if (!fundsPassword) {
      alert('Veuillez entrer votre mot de passe des fonds')
      return
    }

    // Validation du montant minimum
    const minAmount = isCrypto ? 10 : 3000 // 10 USDT ou 3000 FCFA
    const numericAmount = parseFloat(amount)
    
    if (isNaN(numericAmount) || numericAmount < minAmount) {
      alert(`Le montant minimum est de ${minAmount} ${isCrypto ? 'USDT' : 'FCFA'}`)
      return
    }

    setLoading(true)

    try {
      // Vérifier le mot de passe des fonds
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        const storedPasswordHash = data.fundsPassword?.hash
        const enteredPasswordHash = await hashPassword(fundsPassword)
        
        if (storedPasswordHash !== enteredPasswordHash) {
          alert('Mot de passe des fonds incorrect')
          setLoading(false)
          return
        }
      }

      // TEST: Créer transaction sans image d'abord pour tester
      const transactionData: CreateTransactionData = {
        type: 'deposit',
        amount: numericAmount,
        paymentMethod: paymentMethod as 'orange' | 'mtn' | 'crypto',
        phoneNumber: userData.numeroTel,
        proofImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Image placeholder
        beneficiaryCode: beneficiaryCode,
        beneficiaryName: beneficiaryName
      }

      console.log('🔥 Création transaction dépôt:', transactionData)

      await createTransaction(
        currentUser.uid,
        userData.numeroTel,
        transactionData
      )

      console.log('✅ Transaction créée, réinitialisation...')

      // Réinitialiser le formulaire
      setAmount('')
      setTransactionImage(null)
      setImagePreview(null)
      setFundsPassword('')
      
      console.log('✅ Formulaire réinitialisé, affichage alerte...')
      alert('Demande de dépôt soumise avec succès!')
      
      console.log('✅ Redirection vers portefeuille...')
      // Rediriger vers le portefeuille (exactement comme retrait)
      router.push('/portefeuille')
    } catch (error) {
      console.error('❌ Erreur lors de la soumission du dépôt:', error)
      alert('Une erreur est survenue lors de la soumission du dépôt')
    } finally {
      console.log('🔄 setLoading(false)')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className={`bg-gradient-to-r ${headerColors} px-4 py-4 shadow-lg relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${isOrange ? 'from-orange-400/20 via-red-400/20 to-orange-500/20' : isMTN ? 'from-yellow-400/20 via-orange-400/20 to-yellow-500/20' : 'from-blue-400/20 via-purple-400/20 to-indigo-500/20'} animate-pulse`}></div>
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/recharge" className="hover:scale-110 transition-transform duration-200">
            <ArrowLeft className="text-white" size={18} />
          </Link>
          <div className="flex items-center">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              {isCrypto ? (
                <span className="text-white text-base font-bold">₿</span>
              ) : (
                <Image src={logoSrc} alt={serviceName} width={16} height={16} className="object-contain" />
              )}
            </div>
            <h1 className="text-white text-base font-black tracking-wide drop-shadow-lg">{serviceName}</h1>
          </div>
          <div className="w-5"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Amount Section */}
        <div className="mb-4">
          <label className={`block ${isOrange ? 'text-blue-600' : isMTN ? 'text-yellow-600' : 'text-blue-600'} font-black text-sm mb-2`}>
            Montant à déposer ({isCrypto ? 'USDT' : 'FCFA'})
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={isCrypto ? "Minimum 10 USDT" : "Minimum 3,000 FCFA"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-3 py-3 border-2 ${isOrange ? 'border-blue-300 focus:border-orange-500 focus:bg-orange-50' : isMTN ? 'border-yellow-300 focus:border-yellow-500 focus:bg-yellow-50' : 'border-blue-300 focus:border-purple-500 focus:bg-purple-50'} rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none bg-white shadow-sm font-medium text-base transition-all duration-300`}
            />
          </div>
        </div>

        {/* Beneficiary Code Section */}
        <div className="mb-4">
          <label className={`block ${isOrange ? 'text-blue-600' : isMTN ? 'text-yellow-600' : 'text-blue-600'} font-black text-sm mb-2`}>
            Code ou adresse du compte bénéficiaire
          </label>
          <div className="flex items-center gap-2">
            <div className={`flex-1 ${isOrange ? 'bg-blue-50 border-blue-200' : isMTN ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'} border-2 rounded-xl px-3 py-3`}>
              <span className={`${isOrange ? 'text-blue-800' : isMTN ? 'text-yellow-800' : 'text-blue-800'} font-black ${isCrypto ? 'text-xs' : 'text-sm'}`}>{beneficiaryCode}</span>
            </div>
            <button
              onClick={() => copyToClipboard(beneficiaryCode)}
              className={`w-10 h-10 ${isOrange ? 'bg-blue-500 hover:bg-blue-600' : isMTN ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} rounded-xl flex items-center justify-center transition-colors duration-200 shadow-sm`}
            >
              <Copy className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Beneficiary Name Section */}
        <div className="mb-4">
          <label className={`block ${isOrange ? 'text-blue-600' : isMTN ? 'text-yellow-600' : 'text-blue-600'} font-black text-sm mb-2`}>
            Compte bénéficiaire
          </label>
          <div className={`${isOrange ? 'bg-blue-50 border-blue-200' : isMTN ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'} border-2 rounded-xl px-3 py-3`}>
            <span className={`${isOrange ? 'text-blue-800' : isMTN ? 'text-yellow-800' : 'text-blue-800'} font-black ${isCrypto ? 'text-xs break-all' : 'text-sm'}`}>{beneficiaryName}</span>
          </div>
        </div>

        {/* Transaction Capture Section */}
        <div className="mb-6">
          <label className={`block ${isOrange ? 'text-blue-600' : isMTN ? 'text-yellow-600' : 'text-blue-600'} font-black text-sm mb-2`}>
            Capture de transaction
          </label>
          
          {!imagePreview ? (
            <div className={`border-2 border-dashed ${isOrange ? 'border-blue-300 bg-blue-50/50 hover:bg-blue-50' : isMTN ? 'border-yellow-300 bg-yellow-50/50 hover:bg-yellow-50' : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50'} rounded-xl p-4 text-center transition-colors duration-200`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="transaction-image"
              />
              <label htmlFor="transaction-image" className="cursor-pointer">
                <div className={`w-12 h-12 ${isOrange ? 'bg-blue-500' : isMTN ? 'bg-yellow-500' : 'bg-blue-500'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <p className={`${isOrange ? 'text-blue-600' : isMTN ? 'text-yellow-600' : 'text-blue-600'} font-bold text-xs mb-1`}>Ajouter une capture</p>
                <p className={`${isOrange ? 'text-blue-500' : isMTN ? 'text-yellow-500' : 'text-blue-500'} text-xs`}>Cliquez pour sélectionner</p>
              </label>
            </div>
          ) : (
            <div className="relative">
              <div className={`border-2 ${isOrange ? 'border-blue-300' : isMTN ? 'border-yellow-300' : 'border-blue-300'} rounded-xl overflow-hidden bg-white shadow-sm`}>
                <img
                  src={imagePreview}
                  alt="Transaction capture"
                  className="w-full h-40 object-cover"
                />
              </div>
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Mot de passe des fonds */}
        <div className="mb-6">
          <label className={`block ${isOrange ? 'text-blue-600' : isMTN ? 'text-yellow-600' : 'text-blue-600'} font-black text-sm mb-2`}>
            🔐 Mot de passe des fonds
          </label>
          {!hasConfiguredPassword ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm mb-2">Vous devez configurer un mot de passe des fonds</p>
              <button 
                onClick={() => router.push('/centre-membre/mot-de-passe-fonds')}
                className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Configurer maintenant
              </button>
            </div>
          ) : (
            <input
              type="password"
              placeholder="Entrez votre mot de passe des fonds"
              value={fundsPassword}
              onChange={(e) => setFundsPassword(e.target.value)}
              className={`w-full px-3 py-3 border-2 ${isOrange ? 'border-blue-300 focus:border-orange-500 focus:bg-orange-50' : isMTN ? 'border-yellow-300 focus:border-yellow-500 focus:bg-yellow-50' : 'border-blue-300 focus:border-purple-500 focus:bg-purple-50'} rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none bg-white shadow-sm font-medium text-base transition-all duration-300`}
            />
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={(() => {
            const numericAmount = parseFloat(amount);
            const minAmount = isCrypto ? 10 : 3000;
            
            return !amount || 
                   !transactionImage || 
                   !hasConfiguredPassword || 
                   !fundsPassword || 
                   loading || 
                   isNaN(numericAmount) || 
                   numericAmount < minAmount;
          })()}
          className={`w-full py-3 rounded-xl font-black text-sm transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg ${
            (() => {
              const numericAmount = parseFloat(amount);
              const minAmount = isCrypto ? 10 : 3000;
              
              const isEnabled = amount && 
                               transactionImage && 
                               hasConfiguredPassword && 
                               fundsPassword && 
                               !loading && 
                               !isNaN(numericAmount) && 
                               numericAmount >= minAmount;
              
              return isEnabled
                ? isOrange 
                  ? 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-600 hover:via-red-600 hover:to-orange-700 text-white'
                  : isMTN
                  ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed';
            })()
          }`}
        >
          <div className="flex items-center justify-center">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Traitement en cours...
              </>
            ) : (
              <>
                <span className="text-lg mr-2">📤</span>
                Soumettre le dépôt
              </>
            )}
          </div>
        </button>

        {/* Instructions */}
        <div className={`mt-4 ${isOrange ? 'bg-orange-50 border-orange-200' : isMTN ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'} border rounded-xl p-3`}>
          <h3 className={`${isOrange ? 'text-orange-700' : isMTN ? 'text-yellow-700' : 'text-blue-700'} font-black text-xs mb-2`}>Instructions :</h3>
          <ul className={`${isOrange ? 'text-orange-600' : isMTN ? 'text-yellow-600' : 'text-blue-600'} text-xs space-y-1 font-medium`}>
            <li>• {isCrypto ? 'Envoyez USDT TRC20 vers l\'adresse ci-dessus' : 'Effectuez le transfert vers le code ci-dessus'}</li>
            <li>• Prenez une capture d'écran de la confirmation</li>
            <li>• Ajoutez la capture et soumettez</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
