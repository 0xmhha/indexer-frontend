'use client'

import { Suspense, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAddressPageData } from '@/lib/hooks/useAddressPageData'
import { useTokenBalances } from '@/lib/hooks/useAddress'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { AddressDetailSkeleton } from '@/components/skeletons/AddressDetailSkeleton'
import { ContractVerificationStatus } from '@/components/contract/ContractVerificationStatus'
import { SourceCodeViewer } from '@/components/contract/SourceCodeViewer'
import { ContractInteractionSection } from '@/components/contract/ContractInteractionSection'
import { TokenBalancesTable } from '@/components/address/TokenBalancesTable'
import { InternalTransactionsTable } from '@/components/address/InternalTransactionsTable'
import { ERC20TransfersTable } from '@/components/address/ERC20TransfersTable'
import { ERC721TransfersTable } from '@/components/address/ERC721TransfersTable'
import { ContractCreationInfo } from '@/components/address/ContractCreationInfo'
import { AddressOverviewCard } from '@/components/address/AddressOverviewCard'
import { BalanceHistoryCard } from '@/components/address/BalanceHistoryCard'
import { AddressTransactionsSection } from '@/components/address/AddressTransactionsSection'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { isValidAddress } from '@/lib/utils/validation'

// ============================================================
// Sub-Components
// ============================================================

function AddressHeader({ address }: { address: string }) {
  return (
    <div className="mb-8">
      <div className="annotation mb-2">ADDRESS</div>
      <h1 className="mb-4 break-all font-mono text-xl font-bold text-accent-blue">{address}</h1>
    </div>
  )
}

function InvalidAddressError() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorDisplay title="Invalid Address" message="The provided address is not valid" />
    </div>
  )
}

function TokenBalancesCard({
  balances,
  loading,
}: {
  balances: ReturnType<typeof useTokenBalances>['balances']
  loading: boolean
}) {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>TOKEN BALANCES</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <TokenBalancesTable balances={balances} loading={loading} />
      </CardContent>
    </Card>
  )
}

function TransactionTabs({ address }: { address: string }) {
  return (
    <>
      <TabsContent value="internal">
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>INTERNAL TRANSACTIONS</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <InternalTransactionsTable address={address} limit={20} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="erc20">
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>ERC20 TOKEN TRANSFERS</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ERC20TransfersTable address={address} limit={20} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="erc721">
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>ERC721 NFT TRANSFERS</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ERC721TransfersTable address={address} limit={20} />
          </CardContent>
        </Card>
      </TabsContent>
    </>
  )
}

// ============================================================
// Main Page Content
// ============================================================

function AddressPageContent() {
  const params = useParams()
  const address = params.address as string

  // Controlled tab state to prevent auto-redirect on errors
  const [activeTab, setActiveTab] = useState('transactions')

  // Use extracted data hook
  const {
    balance,
    balanceLoading,
    balanceError,
    history,
    historyLoading,
    historyError,
    balances,
    balancesLoading,
    transactions,
    totalCount,
    txLoading,
    txError,
    activeFilters,
    itemsPerPage,
    currentPage,
    totalPages,
    handleApplyFilters,
    handleResetFilters,
    setPage,
    setItemsPerPage,
  } = useAddressPageData(address)

  // Validation
  if (!isValidAddress(address)) {
    return <InvalidAddressError />
  }

  if (balanceLoading) {
    return <AddressDetailSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AddressHeader address={address} />
      <AddressOverviewCard address={address} balance={balance} error={balanceError} />
      <ContractVerificationStatus address={address} isContract={true} />
      <SourceCodeViewer address={address} isVerified={address.toLowerCase().endsWith('0')} />
      <ContractInteractionSection address={address} />
      <BalanceHistoryCard history={history} loading={historyLoading} error={historyError} />
      <ContractCreationInfo address={address} />
      <TokenBalancesCard balances={balances} loading={balancesLoading} />

      <Tabs
        defaultValue="transactions"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="transactions">Regular Transactions</TabsTrigger>
          <TabsTrigger value="internal">Internal Transactions</TabsTrigger>
          <TabsTrigger value="erc20">ERC20 Transfers</TabsTrigger>
          <TabsTrigger value="erc721">ERC721 Transfers</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <AddressTransactionsSection
            address={address}
            transactions={transactions}
            totalCount={totalCount}
            loading={txLoading}
            error={txError}
            activeFilters={activeFilters}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            onPageChange={setPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </TabsContent>

        <TransactionTabs address={address} />
      </Tabs>
    </div>
  )
}

// ============================================================
// Page Export
// ============================================================

export default function AddressPage() {
  return (
    <Suspense fallback={<AddressDetailSkeleton />}>
      <AddressPageContent />
    </Suspense>
  )
}
