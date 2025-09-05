'use client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'react-hot-toast'
import SupportFloat from '@/components/SupportFloat/SupportFloat'

// Fonction pour hasher le mot de passe avec SHA-256
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function MotDePasseFondsPage() {
  const { userData, currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  })
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [hasExistingPassword, setHasExistingPassword] = useState(false)

  // Vérifier s'il y a déjà un mot de passe
  useEffect(() => {
    const checkExistingPassword = async () => {
      if (!currentUser?.uid) return
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          if (data.fundsPassword?.hash) {
            setHasExistingPassword(true)
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du mot de passe:', error)
      }
    }

    checkExistingPassword()
  }, [currentUser?.uid])

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser?.uid) {
      toast.error('Utilisateur non connecté')
      return
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      // Hasher le mot de passe
      const hashedPassword = await hashPassword(formData.newPassword)
      
      const passwordData = {
        hash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await setDoc(doc(db, 'users', currentUser.uid), {
        fundsPassword: passwordData
      }, { merge: true })

      toast.success(hasExistingPassword ? 'Mot de passe modifié avec succès' : 'Mot de passe créé avec succès')
      
      // Réinitialiser le formulaire
      setFormData({
        newPassword: '',
        confirmPassword: ''
      })
      setHasExistingPassword(true)
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error)
      toast.error('Erreur lors de la mise à jour du mot de passe')
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
              Nouveau mot de passe des fonds
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
                {hasExistingPassword ? 'Modifier le mot de passe' : 'Créer un mot de passe des fonds'}
              </h2>
              <p className="text-sm text-gray-600">
                {hasExistingPassword ? 'Modifiez votre mot de passe de sécurité' : 'Créez un mot de passe pour sécuriser vos fonds'}
              </p>
            </div>
          </div>

          {hasExistingPassword && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm">
                ✅ Vous avez déjà configuré un mot de passe de sécurité. Vous pouvez le modifier ci-dessous.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {hasExistingPassword ? 'Nouveau mot de passe' : 'Mot de passe des fonds'}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Entrez votre mot de passe"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmer le mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmez votre mot de passe"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-600 to-orange-700 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {hasExistingPassword ? 'Modification...' : 'Création...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  {hasExistingPassword ? 'Modifier le mot de passe' : 'Créer le mot de passe'}
                </div>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
