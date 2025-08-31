import AdminDashboard from '@/components/Admin/Dashboard'

// Route admin accessible à tous les utilisateurs - pas d'authentification requise
export default function AdminGlobalPage() {
  return <AdminDashboard />
}
