'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Shield, AlertTriangle } from 'lucide-react'

export default function AdminSecureLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser, userData } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthorization = async () => {
      // Vérifier si l'utilisateur est connecté
      if (!currentUser) {
        router.push('/connexion')
        return
      }

      // Vérifier si l'utilisateur a le rôle admin
      if (userData?.role === 'admin') {
        setIsAuthorized(true)
      } else {
        // Rediriger vers la page d'accueil si pas admin
        router.push('/')
      }
      
      setIsLoading(false)
    }

    checkAuthorization()
  }, [currentUser, userData, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-white/50 mx-auto mb-4 animate-pulse" />
          <p className="text-white/70">Vérification des autorisations...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <h1 className="text-xl font-bold text-red-400">Accès Refusé</h1>
          </div>
          <p className="text-white/70">
            Vous n'avez pas les autorisations nécessaires pour accéder à cette zone.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {children}
    </div>
  )
}
