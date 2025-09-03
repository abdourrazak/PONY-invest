'use client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'react-hot-toast'
import SupportFloat from '@/components/SupportFloat/SupportFloat'

// Fonction pour hasher le PIN avec SHA-256
const hashPIN = async (pin: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function MotDePasseFondsPage() {
  const { userData, currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPins, setShowPins] = useState({
    new: false,
    confirm: false
  })
  const [formData, setFormData] = useState({
    newPin: '',
    confirmPin: ''
  })
  const [hasExistingPin, setHasExistingPin] = useState(false)

  // Vérifier s'il y a déjà un PIN
  useEffect(() => {
    const checkExistingPin = async () => {
      if (!currentUser?.uid) return
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          if (data.fundsPin?.hash) {
            setHasExistingPin(true)
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du PIN:', error)
      }
    }

    checkExistingPin()
  }, [currentUser?.uid])

  const togglePinVisibility = (field: 'new' | 'confirm') => {
    setShowPins(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Limiter à 6 chiffres maximum
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6)
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser?.uid) {
      toast.error('Utilisateur non connecté')
      return
    }

    if (!formData.newPin || !formData.confirmPin) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    if (formData.newPin.length < 4) {
      toast.error('Le PIN doit contenir au moins 4 chiffres')
      return
    }

    if (formData.newPin.length > 6) {
      toast.error('Le PIN ne peut pas dépasser 6 chiffres')
      return
    }

    if (formData.newPin !== formData.confirmPin) {
      toast.error('Les PINs ne correspondent pas')
      return
    }

    // Vérifier que ce ne sont pas des chiffres trop simples
    const simplePatterns = ['1234', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1212', '1010']
    if (simplePatterns.includes(formData.newPin)) {
      toast.error('Veuillez choisir un PIN plus sécurisé')
      return
    }

    setLoading(true)

    try {
      // Hasher le PIN
      const hashedPin = await hashPIN(formData.newPin)
      
      const pinData = {
        hash: hashedPin,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await setDoc(doc(db, 'users', currentUser.uid), {
        fundsPin: pinData
      }, { merge: true })

      toast.success(hasExistingPin ? 'PIN modifié avec succès' : 'PIN créé avec succès')
      
      // Réinitialiser le formulaire
      setFormData({
        newPin: '',
        confirmPin: ''
      })
      setHasExistingPin(true)
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du PIN:', error)
      toast.error('Erreur lors de la mise à jour du PIN')
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
              Mot de passe des fonds
            </div>
            <div className="text-green-100 text-sm font-medium drop-shadow-sm">
              Sécurisez vos transactions
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 pb-20">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-amber-600 to-orange-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Shield className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {hasExistingPin ? 'Modifier le PIN' : 'Créer un PIN'}
              </h2>
              <p className="text-sm text-gray-600">
                {hasExistingPin ? 'Modifiez votre PIN de sécurité' : 'Créez un PIN pour sécuriser vos fonds'}
              </p>
            </div>
          </div>

          {hasExistingPin && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm">
                ✅ Vous avez déjà configuré un PIN de sécurité. Vous pouvez le modifier ci-dessous.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nouveau PIN */}
            <div>
              <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 mb-2">
                {hasExistingPin ? 'Nouveau PIN (4-6 chiffres)' : 'PIN de sécurité (4-6 chiffres)'}
              </label>
              <div className="relative">
                <input
                  type={showPins.new ? 'text' : 'password'}
                  id="newPin"
                  name="newPin"
                  value={formData.newPin}
                  onChange={handleInputChange}
                  placeholder="Entrez votre PIN"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-center text-2xl tracking-wider"
                  required
                  minLength={4}
                  maxLength={6}
                  pattern="[0-9]{4,6}"
                />
                <button
                  type="button"
                  onClick={() => togglePinVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPins.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmer le PIN */}
            <div>
              <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le PIN
              </label>
              <div className="relative">
                <input
                  type={showPins.confirm ? 'text' : 'password'}
                  id="confirmPin"
                  name="confirmPin"
                  value={formData.confirmPin}
                  onChange={handleInputChange}
                  placeholder="Confirmez votre PIN"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-center text-2xl tracking-wider"
                  required
                  minLength={4}
                  maxLength={6}
                  pattern="[0-9]{4,6}"
                />
                <button
                  type="button"
                  onClick={() => togglePinVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPins.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Indicateur de force du PIN */}
            {formData.newPin && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Sécurité du PIN:</div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((level) => {
                    let isActive = false
                    let color = 'bg-gray-200'
                    
                    if (formData.newPin.length >= 4) {
                      if (level === 1) { isActive = true; color = 'bg-red-400' }
                      if (formData.newPin.length >= 5 && level <= 2) { isActive = true; color = 'bg-yellow-400' }
                      if (formData.newPin.length >= 6 && level <= 3) { isActive = true; color = 'bg-orange-400' }
                      if (formData.newPin.length === 6 && !/^(.)\1+$/.test(formData.newPin) && level <= 4) { 
                        isActive = true; color = 'bg-green-400' 
                      }
                    }
                    
                    return (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded ${isActive ? color : 'bg-gray-200'} transition-colors`}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-600 to-orange-700 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {hasExistingPin ? 'Modification...' : 'Création...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  {hasExistingPin ? 'Modifier le PIN' : 'Créer le PIN'}
                </div>
              )}
            </button>
          </form>

          {/* Informations importantes */}
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">🔐 Informations importantes</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Ce PIN sera demandé pour toutes vos transactions financières</li>
              <li>• Utilisez un PIN unique et difficile à deviner</li>
              <li>• Évitez les suites simples (1234, 0000, etc.)</li>
              <li>• Ne partagez jamais votre PIN avec qui que ce soit</li>
              <li>• Votre PIN est stocké de manière sécurisée et chiffrée</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
