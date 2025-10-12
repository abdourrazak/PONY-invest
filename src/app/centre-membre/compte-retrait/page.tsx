'use client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ArrowLeft, Save, CreditCard, Bell, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'react-hot-toast'
import SupportFloat from '@/components/SupportFloat/SupportFloat'
import { useRouter } from 'next/navigation'

interface WithdrawalAccount {
  operator: string
  accountNumber: string
  holderName: string
  updatedAt?: any
}

export default function CompteRetraitPage() {
  const { userData, currentUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [formData, setFormData] = useState<WithdrawalAccount>({
    operator: '',
    accountNumber: '',
    holderName: ''
  })

  const operators = [
    { value: 'orange', label: 'Orange Money' },
    { value: 'mtn', label: 'MTN Mobile Money' },
    { value: 'crypto', label: 'Cryptomonnaie' }
  ]

  // Charger les données existantes
  useEffect(() => {
    const loadExistingData = async () => {
      if (!currentUser?.uid) return
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          if (data.withdrawalAccount) {
            setFormData(data.withdrawalAccount)
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }

    loadExistingData()
  }, [currentUser?.uid])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser?.uid) {
      toast.error('Vous devez être connecté')
      return
    }

    if (!formData.operator || !formData.accountNumber || !formData.holderName) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    // Validation du numéro de compte
    if (formData.operator === 'crypto') {
      if (formData.accountNumber.length !== 34) {
        toast.error('L\'adresse USDT TRC20 doit contenir exactement 34 caractères')
        return
      }
      if (!formData.accountNumber.startsWith('T')) {
        toast.error('L\'adresse USDT TRC20 doit commencer par "T"')
        return
      }
      // Validation basique du format TRC20
      if (!/^T[A-Za-z0-9]{33}$/.test(formData.accountNumber)) {
        toast.error('Format d\'adresse USDT TRC20 invalide')
        return
      }
    } else if (formData.operator !== 'crypto' && formData.accountNumber.length < 8) {
      toast.error('Le numéro de compte doit contenir au moins 8 chiffres')
      return
    }

    setLoading(true)

    try {
      const withdrawalData = {
        ...formData,
        updatedAt: new Date()
      }

      await setDoc(doc(db, 'users', currentUser.uid), {
        withdrawalAccount: withdrawalData
      }, { merge: true })

      // Afficher la popup de succès
      setShowSuccessPopup(true)
      
      // Rediriger vers le formulaire de retrait après 2 secondes
      setTimeout(() => {
        router.push('/retrait')
      }, 2000)
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/centre-membre" className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95">
                <ArrowLeft size={18} className="text-white" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 via-emerald-500 to-green-500 rounded-full shadow-xl border-2 border-white/20 flex items-center justify-center relative animate-pulse">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-500 opacity-95 animate-spin" style={{animationDuration: '10s'}}></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-white text-xs mb-0.5">💳</div>
                  <span className="text-white font-bold text-[8px] leading-none">Retrait</span>
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">COMPTE RETRAIT</h1>
                <p className="text-white/60 text-xs">Configuration de votre compte</p>
              </div>
            </div>
            <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
              <Bell size={18} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6 pb-20">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Informations de retrait</h2>
              <p className="text-sm text-white/70">Configurez votre compte pour recevoir vos retraits</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Opérateur */}
            <div>
              <label htmlFor="operator" className="block text-sm font-medium text-white/80 mb-2">
                Opérateur / Banque
              </label>
              <select
                id="operator"
                name="operator"
                value={formData.operator}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200"
                required
              >
                <option value="" className="bg-gray-800 text-white">Sélectionnez votre opérateur</option>
                {operators.map(op => (
                  <option key={op.value} value={op.value} className="bg-gray-800 text-white">{op.label}</option>
                ))}
              </select>
            </div>

            {/* Numéro de compte */}
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-white/80 mb-2">
                {formData.operator === 'bank' ? 'Numéro de compte bancaire' : 
                 formData.operator === 'crypto' ? 'Adresse de portefeuille (USDT TRC20)' : 
                 'Numéro de téléphone'}
              </label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder={
                  formData.operator === 'bank' ? 'Ex: 1234567890123456' : 
                  formData.operator === 'crypto' ? 'Ex: TXxx...xxxx (adresse TRC20)' : 
                  'Ex: 6******'
                }
                className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200"
                required
              />
            </div>

            {/* Nom du titulaire */}
            <div>
              <label htmlFor="holderName" className="block text-sm font-medium text-white/80 mb-2">
                Nom du titulaire du compte
              </label>
              <input
                type="text"
                id="holderName"
                name="holderName"
                value={formData.holderName}
                onChange={handleInputChange}
                placeholder="Nom complet du titulaire"
                className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200"
                required
              />
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  Enregistrer les modifications
                </div>
              )}
            </button>
          </form>

          {/* Informations importantes */}
          <div className="mt-6 p-4 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-400/30">
            <h3 className="font-semibold text-blue-300 mb-2">ℹ️ Informations importantes</h3>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Assurez-vous que les informations sont exactes</li>
              <li>• Les retraits seront effectués sur ce compte uniquement</li>
              {formData.operator === 'crypto' && (
                <>
                  <li>• Utilisez uniquement une adresse USDT TRC20 (réseau TRON)</li>
                  <li>• L'adresse doit commencer par "T" et contenir 34 caractères</li>
                  <li>• Vérifiez bien l'adresse avant validation</li>
                </>
              )}
            </ul>
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
          <Link href="/adoption" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">📊</span>
            </div>
            <span className="text-white/70 text-xs">Mon Produit</span>
          </Link>
          <Link href="/equipe" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-1">
              <span className="text-white text-xs">👥</span>
            </div>
            <span className="text-white/70 text-xs">Équipe</span>
          </Link>
          <Link href="/compte" className="flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-200">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-1 shadow-lg">
              <span className="text-white text-xs">👤</span>
            </div>
            <span className="text-purple-400 text-xs font-semibold">Mon Compte</span>
          </Link>
        </div>
      </div>

      <SupportFloat />

      {/* Popup de succès */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-green-400 mb-2">Configuration Réussie !</h3>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Votre compte de retrait a été configuré avec succès. Vous allez être redirigé vers le formulaire de retrait.
            </p>
            <div className="flex items-center justify-center text-white/60 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
              Redirection en cours...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
