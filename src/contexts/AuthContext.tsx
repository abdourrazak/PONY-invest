'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getCurrentUserData, User } from '@/lib/firebaseAuth'

interface AuthContextType {
  currentUser: FirebaseUser | null
  userData: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true
})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      
      if (user) {
        // Récupérer les données utilisateur depuis Firestore
        const data = await getCurrentUserData()
        setUserData(data)
      } else {
        // Vérifier localStorage pour maintenir la session
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        const userPhone = localStorage.getItem('userPhone')
        const userId = localStorage.getItem('userId')
        
        if (isLoggedIn && userPhone && userId) {
          // Créer un utilisateur temporaire basé sur localStorage
          const tempUserData: User = {
            uid: userId,
            numeroTel: userPhone,
            referralCode: localStorage.getItem('userReferralCode') || '',
            createdAt: null
          }
          setUserData(tempUserData)
        } else {
          setUserData(null)
        }
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userData,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
