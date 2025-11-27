import type { Metadata } from 'next'
import { EpochDetail } from '@/components/epochs/EpochDetail'

interface EpochDetailPageProps {
  params: Promise<{ number: string }>
}

export async function generateMetadata({ params }: EpochDetailPageProps): Promise<Metadata> {
  const { number } = await params
  return {
    title: `Epoch #${number} | Stable-One Explorer`,
    description: `View detailed information for epoch ${number} including validators and candidates`,
  }
}

export default async function EpochDetailPage({ params }: EpochDetailPageProps) {
  const { number } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <EpochDetail epochNumber={number} />
    </div>
  )
}
