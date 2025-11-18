import { env } from '@/lib/config/env'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-bg-tertiary bg-bg-primary py-8" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h2 className="annotation mb-3">ABOUT</h2>
            <p className="font-mono text-xs text-text-secondary">
              Crystalline Infrastructure - Production-ready blockchain explorer for {env.chainName}
            </p>
          </div>

          {/* API Endpoints */}
          <div>
            <h2 className="annotation mb-3">API ENDPOINTS</h2>
            <dl className="space-y-1 font-mono text-xs text-text-secondary">
              <div>
                <dt className="inline">GraphQL: </dt>
                <dd className="inline">{env.graphqlEndpoint}</dd>
              </div>
              <div>
                <dt className="inline">WebSocket: </dt>
                <dd className="inline">{env.wsEndpoint}</dd>
              </div>
              <div>
                <dt className="inline">JSON-RPC: </dt>
                <dd className="inline">{env.jsonRpcEndpoint}</dd>
              </div>
            </dl>
          </div>

          {/* Network Info */}
          <div>
            <h2 className="annotation mb-3">NETWORK</h2>
            <dl className="space-y-1 font-mono text-xs text-text-secondary">
              <div>
                <dt className="inline">Chain: </dt>
                <dd className="inline">{env.chainName}</dd>
              </div>
              <div>
                <dt className="inline">Chain ID: </dt>
                <dd className="inline">{env.chainId}</dd>
              </div>
              <div>
                <dt className="inline">Currency: </dt>
                <dd className="inline">{env.currencySymbol}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-bg-tertiary pt-6 text-center">
          <p className="font-mono text-xs text-text-muted">
            © {currentYear} {env.chainName} Explorer • BLOCK_MATRIX • HEIGHT: 0x000000 → 0xFFFFFF
          </p>
        </div>
      </div>
    </footer>
  )
}
