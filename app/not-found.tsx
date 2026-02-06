import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="card-bordered max-w-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 font-mono text-6xl text-text-muted">404</div>
          <h2 className="mb-2 font-mono text-lg font-bold text-text-primary">NOT FOUND</h2>
          <p className="annotation">RESOURCE UNAVAILABLE</p>
        </div>

        <p className="mb-6 font-mono text-xs text-text-secondary">
          The page or resource you are looking for does not exist in the current block matrix.
        </p>

        <Link href="/">
          <Button>RETURN HOME</Button>
        </Link>
      </div>
    </div>
  )
}
