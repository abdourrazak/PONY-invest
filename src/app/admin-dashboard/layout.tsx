export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Accès libre pour tous les utilisateurs - pas d'authentification requise
  return <>{children}</>
}
