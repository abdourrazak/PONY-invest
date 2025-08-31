'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Shield, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react'

export default function DebugAdminPage() {
  const { currentUser, userData } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [fixApplied, setFixApplied] = useState(false)

  useEffect(() => {
    checkCurrentStatus()
  }, [currentUser, userData])

  const checkCurrentStatus = async () => {
    if (!currentUser) {
      setDebugInfo({
        authenticated: false,
        message: 'Utilisateur non connecté'
      })
      return
    }

    const info: any = {
      authenticated: true,
      uid: currentUser.uid,
      email: currentUser.email,
      phoneNumber: userData?.numeroTel || 'Non défini',
      currentRole: userData?.role || 'Non défini',
      hasAdminRole: userData?.role === 'admin'
    }

    // Vérifier directement dans Firestore
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists()) {
        const firestoreData = userDoc.data()
        info.firestoreRole = firestoreData.role || 'Non défini'
        info.firestorePhone = firestoreData.numeroTel || 'Non défini'
        info.syncIssue = info.currentRole !== info.firestoreRole
      }
    } catch (error) {
      info.firestoreError = error
    }

    setDebugInfo(info)
  }

  const fixAdminAccess = async () => {
    if (!currentUser) {
      alert('Veuillez vous connecter d\'abord')
      return
    }

    setLoading(true)
    try {
      // Mettre à jour le rôle admin dans Firestore
      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, {
        role: 'admin',
        balance: 0,
        updatedAt: new Date().toISOString()
      })

      // Forcer la mise à jour du contexte
      await checkCurrentStatus()
      
      setFixApplied(true)
      alert('Rôle admin configuré avec succès!')
      
      // Recharger pour appliquer les changements
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (error: any) {
      console.error('Erreur configuration admin:', error)
      alert(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAdminAccess = () => {
    window.open('/admin-x7k9m2p4', '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center space-x-3 mb-8">
            <Shield className="w-10 h-10 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Debug Admin Access</h1>
          </div>

          {/* Informations de debug */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">📊 État actuel</h2>
            
            <div className="bg-black/30 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  {debugInfo.authenticated ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-white">
                    Authentification: {debugInfo.authenticated ? 'Connecté' : 'Non connecté'}
                  </span>
                </div>

                {debugInfo.authenticated && (
                  <>
                    <div className="text-gray-300">
                      <strong>UID:</strong> {debugInfo.uid}
                    </div>
                    <div className="text-gray-300">
                      <strong>Email:</strong> {debugInfo.email}
                    </div>
                    <div className="text-gray-300">
                      <strong>Téléphone:</strong> {debugInfo.phoneNumber}
                    </div>
                    <div className="flex items-center space-x-2">
                      {debugInfo.hasAdminRole ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      )}
                      <span className="text-white">
                        Rôle actuel: <strong>{debugInfo.currentRole}</strong>
                      </span>
                    </div>
                    {debugInfo.firestoreRole && (
                      <div className="text-gray-300">
                        <strong>Rôle Firestore:</strong> {debugInfo.firestoreRole}
                      </div>
                    )}
                    {debugInfo.syncIssue && (
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <AlertCircle className="w-5 h-5" />
                        <span>Problème de synchronisation détecté</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">🔧 Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={checkCurrentStatus}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Shield className="w-5 h-5" />
                <span>Actualiser le statut</span>
              </button>

              <button
                onClick={fixAdminAccess}
                disabled={loading || !currentUser}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <span>
                  {loading ? 'Configuration...' : 'Configurer Admin'}
                </span>
              </button>

              <button
                onClick={testAdminAccess}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Shield className="w-5 h-5" />
                <span>Tester l'accès admin</span>
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>

          {fixApplied && (
            <div className="mt-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>Rôle admin activé! Rechargement en cours...</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">📝 Instructions</h3>
            <ol className="space-y-2 text-sm text-gray-300">
              <li>1. Connectez-vous avec le numéro <strong>+237697058617</strong></li>
              <li>2. Cliquez sur "Actualiser le statut" pour voir l'état actuel</li>
              <li>3. Si vous n'êtes pas admin, cliquez sur "Activer le rôle admin"</li>
              <li>4. Testez l'accès avec "Tester l'accès admin"</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
