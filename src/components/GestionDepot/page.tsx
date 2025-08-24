'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Copy, Upload, X } from 'lucide-react'

export default function GestionDepot() {
  const [amount, setAmount] = useState('')
  const [transactionImage, setTransactionImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const beneficiaryCode = "#150*46*0465611#"
  const beneficiaryName = "SEBASTIEN KAMAGA.."

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

  const handleSubmit = () => {
    // Logic for submitting the deposit
    console.log('Submitting deposit:', { amount, transactionImage })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 px-4 py-5 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-red-400/20 to-orange-500/20 animate-pulse"></div>
        <div className="relative z-10 flex items-center">
          <Link href="/recharge" className="mr-3 hover:scale-110 transition-transform duration-200">
            <ArrowLeft className="text-white" size={20} />
          </Link>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <Image src="/org.png" alt="Orange Money" width={20} height={20} className="object-contain" />
            </div>
            <h1 className="text-white text-lg font-black tracking-wide drop-shadow-lg">Orange Money Cameroun</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Amount Section */}
        <div className="mb-6">
          <label className="block text-blue-600 font-black text-base mb-3">
            Montant à déposer (FCFA)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Minimum 3,000 FCFA"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-4 border-2 border-blue-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-orange-50 bg-white shadow-sm font-medium text-lg transition-all duration-300"
            />
          </div>
        </div>

        {/* Beneficiary Code Section */}
        <div className="mb-6">
          <label className="block text-blue-600 font-black text-base mb-3">
            Code ou adresse du compte bénéficiaire
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-4">
              <span className="text-blue-800 font-black text-lg">{beneficiaryCode}</span>
            </div>
            <button
              onClick={() => copyToClipboard(beneficiaryCode)}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors duration-200 shadow-lg"
            >
              <Copy className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Beneficiary Name Section */}
        <div className="mb-6">
          <label className="block text-blue-600 font-black text-base mb-3">
            Compte bénéficiaire
          </label>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-4">
            <span className="text-blue-800 font-black text-lg">{beneficiaryName}</span>
          </div>
        </div>

        {/* Transaction Capture Section */}
        <div className="mb-8">
          <label className="block text-blue-600 font-black text-base mb-3">
            Capture de transaction
          </label>
          
          {!imagePreview ? (
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-blue-50/50 hover:bg-blue-50 transition-colors duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="transaction-image"
              />
              <label htmlFor="transaction-image" className="cursor-pointer">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <p className="text-blue-600 font-bold text-sm mb-2">Ajouter une capture</p>
                <p className="text-blue-500 text-xs">Cliquez pour sélectionner une image</p>
              </label>
            </div>
          ) : (
            <div className="relative">
              <div className="border-2 border-blue-300 rounded-xl overflow-hidden bg-white shadow-lg">
                <img
                  src={imagePreview}
                  alt="Transaction capture"
                  className="w-full h-48 object-cover"
                />
              </div>
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!amount || !transactionImage}
          className={`w-full py-4 rounded-xl font-black text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl ${
            amount && transactionImage
              ? 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-600 hover:via-red-600 hover:to-orange-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-center">
            <span className="text-xl mr-2">📤</span>
            Soumettre le dépôt
          </div>
        </button>

        {/* Instructions */}
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h3 className="text-orange-700 font-black text-sm mb-2">Instructions :</h3>
          <ul className="text-orange-600 text-xs space-y-1 font-medium">
            <li>• Effectuez le transfert vers le code ci-dessus</li>
            <li>• Prenez une capture d'écran de la confirmation</li>
            <li>• Ajoutez la capture et soumettez</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
