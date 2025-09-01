export default function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Route admin accessible à tous - pas d'authentification requise
  return <>{children}</>
}
