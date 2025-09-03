'use client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { toast } from 'react-hot-toast'
import SupportFloat from '@/components/SupportFloat/SupportFloat'

export default function MotDePasseConnexionPage() {
  const { userData, currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
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
    
    if (!currentUser?.email) {
      toast.error('Utilisateur non connecté')
      return
    }

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error('Le nouveau mot de passe doit être différent de l\'ancien')
      return
    }

    setLoading(true)

    try {
      // Créer les credentials pour la ré-authentification
      const credential = EmailAuthProvider.credential(currentUser.email, formData.currentPassword)
      
      // Ré-authentifier l'utilisateur
      await reauthenticateWithCredential(currentUser, credential)
      
      // Mettre à jour le mot de passe
      await updatePassword(currentUser, formData.newPassword)
      
      toast.success('Mot de passe mis à jour avec succès')
      
      // Réinitialiser le formulaire
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error)
      
      if (error.code === 'auth/wrong-password') {
        toast.error('Mot de passe actuel incorrect')
      } else if (error.code === 'auth/weak-password') {
        toast.error('Le nouveau mot de passe est trop faible')
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error('Veuillez vous reconnecter pour effectuer cette action')
      } else {
        toast.error('Erreur lors de la mise à jour du mot de passe')
      }
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
              Mot de passe de connexion
            </div>
            <div className="text-green-100 text-sm font-medium drop-shadow-sm">
              Sécurisez votre compte
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 pb-20">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Lock className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Changer le mot de passe</h2>
              <p className="text-sm text-gray-600">Modifiez votre mot de passe de connexion</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mot de passe actuel */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Entrez votre mot de passe actuel"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Entrez votre nouveau mot de passe"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  required
                  minLength={6}
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

            {/* Confirmer le nouveau mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmez votre nouveau mot de passe"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  required
                  minLength={6}
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
              className="w-full bg-gradient-to-r from-purple-500 via-violet-600 to-purple-700 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Modification en cours...
                </div>
              ) : (
                <div className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Modifier le mot de passe
                </div>
              )}
            </button>
          </form>

          {/* Conseils de sécurité */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">🔒 Conseils de sécurité</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Utilisez au moins 8 caractères</li>
              <li>• Mélangez lettres majuscules, minuscules et chiffres</li>
              <li>• Évitez les mots du dictionnaire</li>
              <li>• N'utilisez pas d'informations personnelles</li>
              <li>• Ne partagez jamais votre mot de passe</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Support Float */}
      <SupportFloat />
    </div>
  )
}
