export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Accès libre pour tous les utilisateurs
  return <>{children}</>
}
