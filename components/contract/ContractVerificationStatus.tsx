'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useContractVerification } from '@/lib/hooks/useContractVerification'
import { getSystemContractInfo, GAS } from '@/lib/config/constants'

interface ContractVerificationStatusProps {
  address: string
  isContract: boolean
}

export function ContractVerificationStatus({ address, isContract }: ContractVerificationStatusProps) {
  const [showDetails, setShowDetails] = useState(false)
  const { verification, isVerified, loading, error, isSystemContract } = useContractVerification(address)
  const systemInfo = getSystemContractInfo(address)

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
          <div className="flex items-center gap-2">
            <span>CONTRACT VERIFICATION</span>
            {isSystemContract && systemInfo && (
              <span
                className="rounded bg-accent-cyan/20 px-2 py-0.5 text-xs text-accent-cyan"
                title={systemInfo.description}
              >
                System Contract
              </span>
            )}
          </div>
          {isVerified && (
            <span className="flex items-center gap-1 text-xs font-normal text-accent-green">
              <span className="h-2 w-2 rounded-full bg-accent-green" />
              VERIFIED
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isVerified ? (
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
                <p className="text-sm font-medium text-text-primary">
                  {verification?.name || 'Contract'} Source Code Verified
                </p>
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

            {showDetails && verification && (
              <div className="mt-4 space-y-3 border-t border-bg-tertiary pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {verification.compilerVersion && (
                    <div>
                      <p className="text-xs text-text-muted">Compiler Version</p>
                      <p className="font-mono text-text-primary">{verification.compilerVersion}</p>
                    </div>
                  )}
                  {verification.licenseType && (
                    <div>
                      <p className="text-xs text-text-muted">License</p>
                      <p className="font-mono text-text-primary">{verification.licenseType}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-text-muted">Optimization</p>
                    <p className="font-mono text-text-primary">
                      {verification.optimizationEnabled
                        ? `Yes (${verification.optimizationRuns ?? GAS.DEFAULT_OPTIMIZATION_RUNS} runs)`
                        : 'No'}
                    </p>
                  </div>
                  {verification.name && (
                    <div>
                      <p className="text-xs text-text-muted">Contract Name</p>
                      <p className="font-mono text-text-primary">{verification.name}</p>
                    </div>
                  )}
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
              If you are the contract owner, you can verify your contract using Forge:
            </p>
            <pre className="rounded bg-bg-secondary p-3 text-xs font-mono text-text-muted overflow-x-auto">
{`forge verify-contract \\
  --verifier-url <INDEXER_URL>/api \\
  --etherscan-api-key any \\
  <CONTRACT_ADDRESS> \\
  <CONTRACT_NAME>`}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
