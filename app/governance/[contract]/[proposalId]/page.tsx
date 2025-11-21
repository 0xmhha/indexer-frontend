import type { Metadata } from 'next'
import { ProposalDetailViewer } from '@/components/governance/ProposalDetailViewer'

interface ProposalPageProps {
  params: Promise<{
    contract: string
    proposalId: string
  }>
}

export async function generateMetadata({ params }: ProposalPageProps): Promise<Metadata> {
  const { proposalId } = await params
  return {
    title: `Proposal #${proposalId} | Stable-One Explorer`,
    description: `View details for governance proposal #${proposalId}`,
  }
}

export default async function ProposalDetailPage({ params }: ProposalPageProps) {
  const { contract, proposalId } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <ProposalDetailViewer contract={contract} proposalId={proposalId} />
    </div>
  )
}
