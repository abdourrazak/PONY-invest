'use client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, EyeOff, Bell } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white relative">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/centre-membre" className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95">
                <ArrowLeft size={18} className="text-white" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 rounded-full shadow-xl border-2 border-white/20 flex items-center justify-center relative animate-pulse">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 opacity-95 animate-spin" style={{animationDuration: '10s'}}></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-white text-xs mb-0.5">🔐</div>
                  <span className="text-white font-bold text-[8px] leading-none">Sécurité</span>
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">MOT DE PASSE</h1>
                <p className="text-white/60 text-xs">Sécurisez vos transactions</p>
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
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {hasExistingPassword ? 'Modifier le mot de passe' : 'Créer un mot de passe des fonds'}
              </h2>
              <p className="text-sm text-white/70">
                {hasExistingPassword ? 'Modifiez votre mot de passe de sécurité' : 'Créez un mot de passe pour sécuriser vos fonds'}
              </p>
            </div>
          </div>

          {hasExistingPassword && (
            <div className="mb-6 p-4 bg-green-500/20 backdrop-blur-sm rounded-xl border border-green-400/30">
              <p className="text-green-300 text-sm">
                ✅ Vous avez déjà configuré un mot de passe de sécurité. Vous pouvez le modifier ci-dessous.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-white/80 mb-2">
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
                  className="w-full px-4 py-3 pr-12 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmer le mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
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
                  className="w-full px-4 py-3 pr-12 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
    </div>
  )
}
