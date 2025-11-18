import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton, SkeletonTable } from '@/components/common/Skeleton'

export function ListPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* List Card */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <div className="flex items-center justify-between">
            <CardTitle>
              <Skeleton className="h-5 w-32" />
            </CardTitle>
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6">
            <SkeletonTable rows={20} />
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  )
}
