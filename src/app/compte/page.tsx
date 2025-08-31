import ComptePage from '../../components/Compte/page'
import AdminDashboard from '@/components/Admin/Dashboard'
import { useState } from 'react'

export default function Compte() {
  // Ajouter un paramètre URL pour accéder au dashboard admin
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('admin') === 'true') {
      return <AdminDashboard />
    }
  }
  
  return <ComptePage />
}
