'use client'
import ComptePage from '../../components/Compte/page'
import AdminDashboard from '@/components/Admin/Dashboard'
import { useEffect, useState } from 'react'

export default function Compte() {
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    // Vérifier le paramètre URL côté client
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('admin') === 'true') {
      setShowAdmin(true)
    }
  }, [])

  // Si le paramètre admin=true est présent, afficher le dashboard admin
  if (showAdmin) {
    return <AdminDashboard />
  }
  
  return <ComptePage />
}
