import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton, SkeletonTable } from '@/components/common/Skeleton'

export function BlockDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-96 mb-4" />
      </div>

      {/* Block Info Card */}
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Card */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>
            <Skeleton className="h-5 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <SkeletonTable rows={10} />
        </CardContent>
      </Card>
    </div>
  )
}
