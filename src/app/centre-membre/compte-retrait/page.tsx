'use client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ArrowLeft, Save, CreditCard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'react-hot-toast'
import SupportFloat from '@/components/SupportFloat/SupportFloat'

interface WithdrawalAccount {
  operator: string
  accountNumber: string
  holderName: string
  updatedAt?: any
}

export default function CompteRetraitPage() {
  const { userData, currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<WithdrawalAccount>({
    operator: '',
    accountNumber: '',
    holderName: ''
  })

  const operators = [
    { value: 'moov', label: 'Moov Money' },
    { value: 'orange', label: 'Orange Money' },
    { value: 'mtn', label: 'MTN Mobile Money' },
    { value: 'wave', label: 'Wave' },
    { value: 'bank', label: 'Compte bancaire' }
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
    if (formData.operator !== 'bank' && formData.accountNumber.length < 8) {
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

      toast.success('Compte de retrait mis à jour avec succès')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header premium */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 px-4 py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <Link href="/centre-membre" className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 transform hover:scale-110">
            <ArrowLeft size={20} className="drop-shadow-sm" />
          </Link>
          <div className="text-center flex-1">
            <div className="text-white text-lg font-bold tracking-wide drop-shadow-md">
              Compte de retrait
            </div>
            <div className="text-green-100 text-sm font-medium drop-shadow-sm">
              Configuration de votre compte
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 pb-20">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <CreditCard className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Informations de retrait</h2>
              <p className="text-sm text-gray-600">Configurez votre compte pour recevoir vos retraits</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Opérateur */}
            <div>
              <label htmlFor="operator" className="block text-sm font-medium text-gray-700 mb-2">
                Opérateur / Banque
              </label>
              <select
                id="operator"
                name="operator"
                value={formData.operator}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
              >
                <option value="">Sélectionnez votre opérateur</option>
                {operators.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>

            {/* Numéro de compte */}
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.operator === 'bank' ? 'Numéro de compte bancaire' : 'Numéro de téléphone'}
              </label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder={formData.operator === 'bank' ? 'Ex: 1234567890123456' : 'Ex: 6******'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            {/* Nom du titulaire */}
            <div>
              <label htmlFor="holderName" className="block text-sm font-medium text-gray-700 mb-2">
                Nom du titulaire du compte
              </label>
              <input
                type="text"
                id="holderName"
                name="holderName"
                value={formData.holderName}
                onChange={handleInputChange}
                placeholder="Nom complet du titulaire"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Informations importantes</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Assurez-vous que les informations sont exactes</li>
              <li>• Les retraits seront effectués sur ce compte uniquement</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
