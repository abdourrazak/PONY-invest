'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Copy, Upload, X } from 'lucide-react'
import { createTransaction } from '@/lib/transactions'
import { CreateTransactionData } from '@/types/transactions'
import { checkLV1Discount } from '@/lib/firebaseAuth'
import LygosButton from '@/components/LygosPayment/LygosButton'


// Fonction pour compresser une image si elle dépasse 1MB
const compressImage = (file: File, maxSizeBytes: number = 1048487): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = document.createElement('img')
    
    img.onload = () => {
      // Calculer les nouvelles dimensions (réduire si nécessaire)
      let { width, height } = img
      const maxDimension = 1200 // Dimension maximale
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else {
          width = (width * maxDimension) / height
          height = maxDimension
        }
      }
      
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      
      // Commencer avec une qualité élevée et réduire si nécessaire
      let quality = 0.8
      let compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
      
      // Réduire la qualité jusqu'à ce que l'image soit sous la limite
      while (compressedDataUrl.length > maxSizeBytes && quality > 0.1) {
        quality -= 0.1
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
      }
      
      resolve(compressedDataUrl)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

interface GestionDepotProps {
  paymentMethod?: 'orange' | 'mtn' | 'crypto'
}

export default function GestionDepot({ paymentMethod = 'orange' }: GestionDepotProps) {
  const { currentUser, userData } = useAuth()
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [transactionImage, setTransactionImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasLV1Discount, setHasLV1Discount] = useState(false)

  const isOrange = paymentMethod === 'orange'
  const isMTN = paymentMethod === 'mtn'
  const isCrypto = paymentMethod === 'crypto'

  const beneficiaryCode = isOrange 
    ? "#150*1*1*2*689440366*Montant*1#" 
    : isMTN 
    ? "*126*1*1*653086253*Montant*1#" 
    : "TUBbip6CZHH8R9tods5Fnmcrxpvw2TdRpS"
  
  const beneficiaryName = isOrange 
    ? "DJOGANG MBIANDA" 
    : isMTN 
    ? "ADAMA DJAIMOU" 
    : "TUBbip6CZHH8R9tods5Fnmcrxpvw2TdRpS"
  
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

  // Vérifier si l'utilisateur a la réduction LV1 (10+ amis)
  useEffect(() => {
    if (currentUser) {
      checkLV1Discount(currentUser.uid).then(hasDiscount => {
        setHasLV1Discount(hasDiscount)
      }).catch(error => {
        console.log('Erreur vérification réduction:', error)
        setHasLV1Discount(false)
      })
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

    // Validation du montant
    const numericAmount = parseFloat(amount)
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert(`Veuillez entrer un montant valide`)
      return
    }
    
    // Validation spéciale pour 2000 FCFA (nécessite 10+ amis)
    if (numericAmount === 2000 && !hasLV1Discount) {
      alert(`Le montant de 2,000 FCFA nécessite d'inviter au moins 10 amis`)
      return
    }

    setLoading(true)

    try {
      
      // Compresser l'image si elle dépasse 1MB
      const compressedImage = await compressImage(transactionImage)
      
      // Créer la transaction dans Firestore
      const transactionData: CreateTransactionData = {
        type: 'deposit',
        amount: numericAmount,
        paymentMethod: paymentMethod as 'orange' | 'mtn' | 'crypto',
        phoneNumber: userData.numeroTel,
        proofImage: compressedImage,
        beneficiaryCode: beneficiaryCode,
        beneficiaryName: beneficiaryName
      }

      await createTransaction(
        currentUser.uid,
        userData.numeroTel,
        transactionData
      )

      // Réinitialiser le formulaire
      setAmount('')
      setTransactionImage(null)
      setImagePreview(null)
      
      alert('Demande de dépôt soumise avec succès!')
      
      // Rediriger vers le portefeuille (exactement comme retrait)
      router.push('/portefeuille')
    } catch (error) {
      console.error('❌ Erreur lors de la soumission du dépôt:', error)
      alert('Une erreur est survenue lors de la soumission du dépôt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
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
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Amount Selection Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <label className="block text-white/70 font-medium text-sm mb-4">
            Montant à déposer (FCFA)
          </label>
          
          {/* Preset Amount Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[2000, 5000, 14000, 34000, 79000, 109000, 249000, 399000].map((presetAmount) => {
              // Le bouton 2000 FCFA nécessite 10+ amis
              const isLocked = presetAmount === 2000 && !hasLV1Discount
              
              return (
                <button
                  key={presetAmount}
                  onClick={() => {
                    if (!isLocked) {
                      setSelectedAmount(presetAmount)
                      setAmount(presetAmount.toString())
                    }
                  }}
                  disabled={isLocked}
                  className={`px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 transform ${
                    isLocked
                      ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-500/30'
                      : selectedAmount === presetAmount
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-purple-400 hover:scale-105 active:scale-95'
                      : 'bg-black/30 backdrop-blur-sm border border-white/20 text-white/80 hover:bg-black/40 hover:scale-105 active:scale-95'
                  }`}
                  title={isLocked ? 'Invitez 10 amis pour débloquer' : ''}
                >
                  {presetAmount.toLocaleString()} FCFA
                  {isLocked && <span className="ml-1">🔒</span>}
                </button>
              )
            })}
          </div>
          
          {/* Selected Amount Display */}
          {selectedAmount && (
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Montant sélectionné :</span>
                <span className="text-green-400 font-bold text-lg">{selectedAmount.toLocaleString()} FCFA</span>
              </div>
            </div>
          )}
        </div>

        {/* Beneficiary Code Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <label className="block text-white/70 font-medium text-sm mb-3">
            Code ou adresse du compte bénéficiaire
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
              <span className="text-blue-400 font-mono text-sm break-all">{beneficiaryCode}</span>
            </div>
            <button
              onClick={() => copyToClipboard(beneficiaryCode)}
              className="p-3 bg-purple-500 hover:bg-purple-600 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <Copy className="w-4 h-4 text-white" />
            </button>
          </div>
          
          {/* QR Code Orange Money */}
          {isOrange && (
            <div className="mt-4 text-center">
              <p className="text-orange-400 text-sm mb-2 font-bold">📱 Utilisez l'application MaxIt</p>
              <p className="text-white/70 text-xs mb-3 font-medium">Scannez ce QR Code avec MaxIt</p>
              <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 inline-block">
                <div className="bg-white rounded-lg p-2">
                  <Image
                    src="/orange-qr-code.png"
                    alt="QR Code Orange Money MaxIt"
                    width={200}
                    height={200}
                    className="w-40 h-40 object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-white/80 text-xs mt-2 font-medium">QR Code Orange Money (MaxIt)</p>
              </div>
            </div>
          )}

          {/* QR Code MTN Mobile Money */}
          {isMTN && (
            <div className="mt-4 text-center">
              <p className="text-white/70 text-xs mb-3 font-medium">📱 Ou scannez ce QR Code</p>
              <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 inline-block">
                <div className="bg-white rounded-lg p-2">
                  <Image
                    src="/mtn-qr-code.png"
                    alt="QR Code MTN Mobile Money"
                    width={200}
                    height={200}
                    className="w-40 h-40 object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-white/80 text-xs mt-2 font-medium">QR Code MTN MoMo</p>
              </div>
            </div>
          )}

          {/* QR Code Crypto USDT TRC20 */}
          {isCrypto && (
            <div className="mt-4 text-center">
              <p className="text-blue-400 text-sm mb-2 font-bold">₿ Adresse USDT TRC20</p>
              <p className="text-white/70 text-xs mb-3 font-medium">Scannez ce QR Code pour envoyer</p>
              <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 inline-block">
                <div className="bg-white rounded-lg p-2">
                  <Image
                    src="/crypto-qr-code.png"
                    alt="QR Code USDT TRC20"
                    width={200}
                    height={200}
                    className="w-40 h-40 object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-white/80 text-xs mt-2 font-medium">QR Code USDT TRC20</p>
              </div>
            </div>
          )}
        </div>

        {/* Beneficiary Name Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <label className="block text-white/70 font-medium text-sm mb-3">
            Compte bénéficiaire
          </label>
          <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
            <span className="text-green-400 font-mono text-sm break-all">{beneficiaryName}</span>
          </div>
        </div>

        {/* Transaction Capture Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <label className="block text-white/70 font-medium text-sm mb-3">
            Capture de transaction
          </label>
          
          {!imagePreview ? (
            <div className="border-2 border-dashed border-white/30 bg-black/20 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-black/30 transition-colors duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="transaction-image"
              />
              <label htmlFor="transaction-image" className="cursor-pointer">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium text-sm mb-1">Ajouter une capture</p>
                <p className="text-white/60 text-xs">Cliquez pour sélectionner</p>
              </label>
            </div>
          ) : (
            <div className="relative">
              <div className="border-2 border-white/20 rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm">
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

        {/* Lygos Payment Button - Paiement International */}
        {selectedAmount && currentUser && (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white/70">
                  OU
                </span>
              </div>
            </div>

            <LygosButton
              amount={selectedAmount}
              userId={currentUser.uid}
              userPhone={userData?.numeroTel || '+237600000000'}
              userName={userData?.numeroTel || 'Utilisateur'}
              disabled={loading}
            />
          </div>
        )}

        {/* Submit Button - Méthode traditionnelle */}
        <button
          onClick={handleSubmit}
          disabled={(() => {
            const numericAmount = parseFloat(amount);
            
            // Vérifier si 2000 FCFA est bloqué
            const is2000Locked = numericAmount === 2000 && !hasLV1Discount;
            
            return !amount || 
                   !transactionImage || 
                   loading || 
                   is2000Locked ||
                   isNaN(numericAmount) ||
                   numericAmount <= 0;
          })()}
          className={`w-full py-4 rounded-xl font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg ${
            (() => {
              const numericAmount = parseFloat(amount);
              const is2000Locked = numericAmount === 2000 && !hasLV1Discount;
              
              const isEnabled = amount && 
                               transactionImage && 
                               !loading && 
                               !isNaN(numericAmount) && 
                               numericAmount > 0 &&
                               !is2000Locked;
              
              return isEnabled
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                : 'bg-white/20 text-white/50 cursor-not-allowed';
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
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
          <h3 className="text-yellow-400 font-medium text-sm mb-3">Instructions :</h3>
          <ul className="text-white/70 text-sm space-y-2">
            <li>• {isCrypto ? 'Envoyez USDT TRC20 vers l\'adresse ci-dessus' : 'Effectuez le transfert vers le code ci-dessus'}</li>
            <li>• Prenez une capture d'écran de la confirmation</li>
            <li>• Ajoutez la capture et soumettez</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
