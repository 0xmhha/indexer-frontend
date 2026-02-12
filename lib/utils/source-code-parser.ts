/**
 * Source Code Parsing Utilities
 *
 * Parses verified contract source code into individual files.
 * Supports Standard JSON Input (forge), custom marker format (system contracts),
 * and plain Solidity source code.
 */

/**
 * Standard JSON Input format from solc
 * Used by forge verify-contract --verifier custom
 */
interface StandardJsonInput {
  language: string
  sources: Record<string, { content: string }>
  settings?: unknown
}

export interface ParsedSourceFile {
  name: string
  content: string
  isMain: boolean
}

/**
 * Check if source code is in Standard JSON Input format
 */
function isStandardJsonInput(sourceCode: string): boolean {
  const trimmed = sourceCode.trim()
  if (!trimmed.startsWith('{')) {
    return false
  }
  return trimmed.includes('"language"') && trimmed.includes('"sources"')
}

/**
 * Parse Standard JSON Input format into separate files
 */
function parseStandardJsonInput(sourceCode: string, contractName: string | null): ParsedSourceFile[] {
  try {
    const json = JSON.parse(sourceCode) as StandardJsonInput

    if (!json.sources || typeof json.sources !== 'object') {
      return []
    }

    const files: ParsedSourceFile[] = []

    for (const [filePath, source] of Object.entries(json.sources)) {
      if (!source.content) {
        continue
      }

      // Extract filename from path (e.g., "src/Contract.sol" -> "Contract.sol")
      const fileName = filePath.split('/').pop() ?? filePath

      // Determine if this is the main contract file
      const isMain = contractName
        ? filePath.toLowerCase().includes(contractName.toLowerCase()) ||
          fileName.toLowerCase().replace('.sol', '') === contractName.toLowerCase()
        : false

      files.push({
        name: filePath,
        content: source.content,
        isMain,
      })
    }

    // If no main contract was identified, mark the first file as main
    if (files.length > 0 && !files.some(f => f.isMain)) {
      const mainIndex = files.findIndex(f =>
        !f.name.includes('lib/') &&
        !f.name.includes('node_modules/') &&
        !f.name.toLowerCase().includes('interface') &&
        !f.name.toLowerCase().includes('abstract')
      )
      if (mainIndex >= 0 && files[mainIndex]) {
        files[mainIndex].isMain = true
      } else if (files[0]) {
        files[0].isMain = true
      }
    }

    // Sort: main contract first, then by path
    return files.sort((a, b) => {
      if (a.isMain && !b.isMain) { return -1 }
      if (!a.isMain && b.isMain) { return 1 }
      return a.name.localeCompare(b.name)
    })
  } catch {
    return []
  }
}

/**
 * Parse source code into separate files if it contains multiple contracts
 * Supports:
 * 1. Standard JSON Input format (from forge verify-contract)
 * 2. Custom marker format (system contracts):
 *    // === Abstract Contracts ===
 *    // --- GovBase.sol ---
 *    ...
 *    // === Main Contract: NativeCoinAdapter ===
 * 3. Plain Solidity source code
 */
export function parseSourceCodeFiles(sourceCode: string, contractName: string | null): ParsedSourceFile[] {
  if (!sourceCode) {
    return []
  }

  // 1. Check for Standard JSON Input format (from forge)
  if (isStandardJsonInput(sourceCode)) {
    const files = parseStandardJsonInput(sourceCode, contractName)
    if (files.length > 0) {
      return files
    }
  }

  // 2. Check for custom marker format (system contracts)
  const hasAbstractMarker = sourceCode.includes('// === Abstract Contracts ===')
  const hasMainMarker = sourceCode.includes('// === Main Contract:')

  if (!hasAbstractMarker && !hasMainMarker) {
    // 3. Plain Solidity source code - single file
    return [{
      name: contractName ? `${contractName}.sol` : 'Contract.sol',
      content: sourceCode,
      isMain: true,
    }]
  }

  const files: ParsedSourceFile[] = []

  // Split by main contract marker first
  const mainContractMarkerRegex = /\/\/ === Main Contract: (\w+) ===/
  const mainMatch = sourceCode.match(mainContractMarkerRegex)

  if (mainMatch) {
    const mainContractIndex = sourceCode.indexOf(mainMatch[0])
    const abstractsSection = sourceCode.substring(0, mainContractIndex)
    const mainSection = sourceCode.substring(mainContractIndex + mainMatch[0].length).trim()

    // Parse main contract
    const mainContractName = mainMatch[1]
    files.push({
      name: `${mainContractName}.sol`,
      content: mainSection,
      isMain: true,
    })

    // Parse abstract contracts section
    const abstractFileRegex = /\/\/ --- ([\w/]+\.sol) ---\n([\s\S]*?)(?=\/\/ ---|\/\/ ===|$)/g
    let match = abstractFileRegex.exec(abstractsSection)
    while (match !== null) {
      const fileName = match[1] ?? 'Unknown.sol'
      const rawContent = match[2] ?? ''
      const content = rawContent.trim()
      if (content) {
        files.push({
          name: fileName,
          content,
          isMain: false,
        })
      }
      match = abstractFileRegex.exec(abstractsSection)
    }
  } else {
    files.push({
      name: contractName ? `${contractName}.sol` : 'Contract.sol',
      content: sourceCode,
      isMain: true,
    })
  }

  // Sort: main contract first, then alphabetically
  return files.sort((a, b) => {
    if (a.isMain && !b.isMain) { return -1 }
    if (!a.isMain && b.isMain) { return 1 }
    return a.name.localeCompare(b.name)
  })
}
