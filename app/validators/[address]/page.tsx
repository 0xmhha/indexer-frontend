import type { Metadata } from 'next'
import { ValidatorDetail } from '@/components/validators/ValidatorDetail'

interface ValidatorDetailPageProps {
  params: Promise<{ address: string }>
}

export async function generateMetadata({ params }: ValidatorDetailPageProps): Promise<Metadata> {
  const { address } = await params
  return {
    title: `Validator ${address.slice(0, 10)}... | Stable-One Explorer`,
    description: `View detailed statistics and participation data for validator ${address}`,
  }
}

export default async function ValidatorDetailPage({ params }: ValidatorDetailPageProps) {
  const { address } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <ValidatorDetail address={address} />
    </div>
  )
}
