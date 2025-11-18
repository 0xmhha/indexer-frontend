export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="grid-overlay min-h-screen">
          {/* Header Section */}
          <header className="mb-16 pt-16 text-center">
            <div className="annotation mb-4">CRYSTALLINE INFRASTRUCTURE v0.1.0</div>
            <h1 className="mb-4 font-mono text-4xl font-bold text-accent-blue">
              STABLE-ONE EXPLORER
            </h1>
            <p className="text-sm text-text-secondary">
              BLOCKCHAIN INDEXER • REAL-TIME SYNC • GRAPHQL API
            </p>
          </header>

          {/* Coming Soon Notice */}
          <div className="card-bordered mx-auto max-w-2xl p-8">
            <div className="mb-6 flex items-center justify-between border-b border-bg-tertiary pb-4">
              <span className="annotation">SYSTEM STATUS</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-accent-blue"></div>
                <span className="font-mono text-xs text-accent-blue">INITIALIZING</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-mono text-sm text-text-primary">
                Frontend initialization in progress...
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-success"></div>
                  <span className="font-mono text-xs text-text-secondary">
                    Next.js 14+ with TypeScript
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-success"></div>
                  <span className="font-mono text-xs text-text-secondary">
                    Tailwind CSS + Design System
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-text-muted"></div>
                  <span className="font-mono text-xs text-text-secondary">
                    Apollo Client + GraphQL
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-text-muted"></div>
                  <span className="font-mono text-xs text-text-secondary">
                    shadcn/ui Components
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-text-muted"></div>
                  <span className="font-mono text-xs text-text-secondary">
                    Real-time WebSocket Integration
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-bg-tertiary pt-6">
              <p className="annotation mb-2">ENDPOINT CONFIGURATION</p>
              <div className="space-y-1 font-mono text-xs text-text-secondary">
                <div>GraphQL: http://localhost:8080/graphql</div>
                <div>WebSocket: ws://localhost:8080/ws</div>
                <div>JSON-RPC: http://localhost:8080/rpc</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-16 pb-8 text-center">
            <p className="font-mono text-xs text-text-muted">
              BLOCK_MATRIX • HEIGHT: 0x000000 → 0xFFFFFF
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}
