export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Accès libre pour tous les utilisateurs - pas d'authentification requise
  return <>{children}</>
}
