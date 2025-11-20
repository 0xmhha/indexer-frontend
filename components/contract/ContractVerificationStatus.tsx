'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ContractVerificationStatusProps {
  address: string
  isContract: boolean
}

interface VerificationInfo {
  verified: boolean
  compilerVersion?: string
  optimizationUsed?: boolean
  runs?: number
  evmVersion?: string
  license?: string
  verifiedAt?: string
}

// Mock verification check - replace with actual API call when backend is ready
function useContractVerification(address: string): {
  verification: VerificationInfo | null
  loading: boolean
  error: string | null
} {
  // TODO: Replace with actual API call
  // const { data, loading, error } = useQuery(GET_CONTRACT_VERIFICATION, { variables: { address } })

  // Mock data for demonstration
  const mockVerified = address.toLowerCase().endsWith('0')

  if (mockVerified) {
    return {
      verification: {
        verified: true,
        compilerVersion: 'v0.8.19+commit.7dd6d404',
        optimizationUsed: true,
        runs: 200,
        evmVersion: 'paris',
        license: 'MIT',
        verifiedAt: '2024-01-15T10:30:00Z',
      },
      loading: false,
      error: null,
    }
  }

  return {
    verification: {
      verified: false,
    },
    loading: false,
    error: null,
  }
}

export function ContractVerificationStatus({ address, isContract }: ContractVerificationStatusProps) {
  const [showDetails, setShowDetails] = useState(false)
  const { verification, loading, error } = useContractVerification(address)

  if (!isContract) {
    return null
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>CONTRACT VERIFICATION</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
            <span className="text-sm text-text-muted">Checking verification status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>CONTRACT VERIFICATION</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-error">Failed to check verification status</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <span>CONTRACT VERIFICATION</span>
          {verification?.verified && (
            <span className="flex items-center gap-1 text-xs font-normal text-accent-green">
              <span className="h-2 w-2 rounded-full bg-accent-green" />
              VERIFIED
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {verification?.verified ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-green/20">
                <svg
                  className="h-4 w-4 text-accent-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Contract Source Code Verified</p>
                <p className="text-xs text-text-muted">
                  Exact match with deployed bytecode
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              aria-expanded={showDetails}
            >
              {showDetails ? 'HIDE DETAILS' : 'SHOW DETAILS'}
            </Button>

            {showDetails && (
              <div className="mt-4 space-y-3 border-t border-bg-tertiary pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-text-muted">Compiler Version</p>
                    <p className="font-mono text-text-primary">{verification.compilerVersion}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">EVM Version</p>
                    <p className="font-mono text-text-primary">{verification.evmVersion}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Optimization</p>
                    <p className="font-mono text-text-primary">
                      {verification.optimizationUsed ? `Yes (${verification.runs} runs)` : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">License</p>
                    <p className="font-mono text-text-primary">{verification.license}</p>
                  </div>
                </div>
                {verification.verifiedAt && (
                  <div className="text-xs text-text-muted">
                    Verified on {new Date(verification.verifiedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-text-muted/20">
                <svg
                  className="h-4 w-4 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Contract Not Verified</p>
                <p className="text-xs text-text-muted">
                  Source code has not been submitted for verification
                </p>
              </div>
            </div>
            <p className="text-xs text-text-secondary">
              Contract verification allows users to view and audit the source code.
              If you are the contract owner, you can verify your contract to increase transparency.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
