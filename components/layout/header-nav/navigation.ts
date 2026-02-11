export interface NavLink {
  href: string
  label: string
  mobileLabel?: string
}

export interface NavSection {
  title: string
  links: NavLink[]
}

export const CORE_NAV_LINKS: NavLink[] = [
  { href: '/blocks', label: 'Blocks' },
  { href: '/txs', label: 'Txs', mobileLabel: 'Transactions' },
  { href: '/stats', label: 'Stats', mobileLabel: 'Statistics' },
]

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Tools',
    links: [
      { href: '/gas', label: 'Gas Tools' },
      { href: '/contract', label: 'Contract' },
      { href: '/contracts', label: 'Contracts List' },
    ],
  },
  {
    title: 'Blockchain',
    links: [
      { href: '/system-contracts', label: 'System Contracts' },
      { href: '/validators', label: 'Validators' },
      { href: '/consensus', label: 'Consensus' },
      { href: '/epochs', label: 'Epochs' },
      { href: '/wbft', label: 'WBFT' },
    ],
  },
  {
    title: 'Other',
    links: [
      { href: '/governance', label: 'Governance' },
      { href: '/settings', label: '\u2699 Settings' },
    ],
  },
]
