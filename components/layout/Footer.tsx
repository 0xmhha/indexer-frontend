import { env } from '@/lib/config/env'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-bg-tertiary bg-bg-primary py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="annotation mb-3">ABOUT</h3>
            <p className="font-mono text-xs text-text-secondary">
              Crystalline Infrastructure - Production-ready blockchain explorer for {env.chainName}
            </p>
          </div>

          {/* API Endpoints */}
          <div>
            <h3 className="annotation mb-3">API ENDPOINTS</h3>
            <div className="space-y-1 font-mono text-xs text-text-secondary">
              <div>GraphQL: {env.graphqlEndpoint}</div>
              <div>WebSocket: {env.wsEndpoint}</div>
              <div>JSON-RPC: {env.jsonRpcEndpoint}</div>
            </div>
          </div>

          {/* Network Info */}
          <div>
            <h3 className="annotation mb-3">NETWORK</h3>
            <div className="space-y-1 font-mono text-xs text-text-secondary">
              <div>Chain: {env.chainName}</div>
              <div>Chain ID: {env.chainId}</div>
              <div>Currency: {env.currencySymbol}</div>
            </div>
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
