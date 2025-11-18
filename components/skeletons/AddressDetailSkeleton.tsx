import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton, SkeletonTable } from '@/components/common/Skeleton'

export function AddressDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-full max-w-2xl mb-4" />
      </div>

      {/* Balance Card */}
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>
            <Skeleton className="h-5 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-10 w-64" />
        </CardContent>
      </Card>

      {/* Balance History Chart */}
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>

      {/* Transactions Card */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <SkeletonTable rows={20} />
        </CardContent>
      </Card>
    </div>
  )
}
