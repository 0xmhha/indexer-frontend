import Link from 'next/link'
import { NetworkSelector } from '@/components/common/NetworkSelector'
import { WalletButton } from '@/components/common/WalletButton'
import { CORE_NAV_LINKS, NAV_SECTIONS } from './navigation'

interface MobileNavProps {
  onClose: () => void
}

export function MobileNav({ onClose }: MobileNavProps) {
  return (
    <nav id="mobile-menu" className="border-t border-bg-tertiary py-4 md:hidden" aria-label="Mobile navigation">
      <div className="space-y-1">
        {CORE_NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
          >
            {link.mobileLabel ?? link.label}
          </Link>
        ))}

        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="border-t border-bg-tertiary mt-2 pt-2">
            <div className="px-4 py-2 font-mono text-xs text-text-muted uppercase tracking-wider">
              {section.title}
            </div>
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}

        {/* Network & Wallet */}
        <div className="border-t border-bg-tertiary mt-2 pt-2">
          <div className="px-4 py-2 font-mono text-xs text-text-muted uppercase tracking-wider">
            Network & Wallet
          </div>
          <div className="flex flex-col gap-2 px-4 py-2">
            <NetworkSelector />
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
