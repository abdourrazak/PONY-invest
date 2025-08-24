import GestionDepot from '@/components/GestionDepot/page'

interface PageProps {
  searchParams: { method?: 'orange' | 'mtn' }
}

export default function GestionDepotPage({ searchParams }: PageProps) {
  const paymentMethod = searchParams.method || 'orange'
  return <GestionDepot paymentMethod={paymentMethod} />
}
