export const TX_PRESETS = [
  { id: 'transfer', label: 'Transfer', gasLimit: 21000, icon: '💸', description: 'Simple native token transfer' },
  { id: 'erc20', label: 'ERC20 Transfer', gasLimit: 65000, icon: '🪙', description: 'Token transfer' },
  { id: 'swap', label: 'DEX Swap', gasLimit: 150000, icon: '🔄', description: 'Decentralized exchange swap' },
  { id: 'nft', label: 'NFT Mint', gasLimit: 120000, icon: '🎨', description: 'Mint NFT token' },
  { id: 'deploy', label: 'Contract Deploy', gasLimit: 500000, icon: '📜', description: 'Deploy smart contract' },
  { id: 'custom', label: 'Custom', gasLimit: 21000, icon: '⚙️', description: 'Custom gas limit' },
] as const

export type TxPresetId = typeof TX_PRESETS[number]['id']
