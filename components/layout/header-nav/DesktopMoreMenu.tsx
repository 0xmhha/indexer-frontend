import Link from 'next/link'
import { NAV_SECTIONS } from './navigation'

interface DesktopMoreMenuProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

export function DesktopMoreMenu({ isOpen, onToggle, onClose }: DesktopMoreMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-blue whitespace-nowrap flex items-center gap-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        More
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 border border-bg-tertiary bg-bg-primary shadow-lg">
          {NAV_SECTIONS.map((section, idx) => (
            <div
              key={section.title}
              className={idx < NAV_SECTIONS.length - 1 ? 'border-b border-bg-tertiary' : ''}
            >
              <div className="px-4 py-2 font-mono text-xs text-text-muted uppercase tracking-wider">
                {section.title}
              </div>
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="block px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
