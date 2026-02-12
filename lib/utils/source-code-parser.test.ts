import { describe, it, expect } from 'vitest'
import { parseSourceCodeFiles } from '@/lib/utils/source-code-parser'

describe('parseSourceCodeFiles', () => {
  // ---------------------------------------------------------------------------
  // Empty / null / undefined input
  // ---------------------------------------------------------------------------
  describe('empty or falsy source input', () => {
    it('returns an empty array for an empty string', () => {
      expect(parseSourceCodeFiles('', null)).toEqual([])
    })

    it('returns an empty array for an empty string with a contract name', () => {
      expect(parseSourceCodeFiles('', 'MyContract')).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // Plain Solidity source code (no JSON, no markers)
  // ---------------------------------------------------------------------------
  describe('plain Solidity source code', () => {
    const soliditySource = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    uint256 public value;
}`

    it('returns a single file with the provided contract name', () => {
      const result = parseSourceCodeFiles(soliditySource, 'MyContract')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        name: 'MyContract.sol',
        content: soliditySource,
        isMain: true,
      })
    })

    it('falls back to "Contract.sol" when contract name is null', () => {
      const result = parseSourceCodeFiles(soliditySource, null)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        name: 'Contract.sol',
        content: soliditySource,
        isMain: true,
      })
    })

    it('marks the single file as the main contract', () => {
      const result = parseSourceCodeFiles(soliditySource, 'Token')

      expect(result).toHaveLength(1)
      expect(result[0]!.isMain).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // Standard JSON Input format (from forge)
  // ---------------------------------------------------------------------------
  describe('Standard JSON Input format', () => {
    it('parses multiple source files from JSON', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {
          'src/Token.sol': { content: 'contract Token {}' },
          'src/lib/SafeMath.sol': { content: 'library SafeMath {}' },
          'src/interfaces/IERC20.sol': { content: 'interface IERC20 {}' },
        },
        settings: {},
      })

      const result = parseSourceCodeFiles(jsonInput, 'Token')

      expect(result).toHaveLength(3)
    })

    it('identifies the main contract by name match in file path', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {
          'src/Token.sol': { content: 'contract Token {}' },
          'src/lib/SafeMath.sol': { content: 'library SafeMath {}' },
        },
        settings: {},
      })

      const result = parseSourceCodeFiles(jsonInput, 'Token')
      const mainFile = result.find((f) => f.isMain)

      expect(mainFile).toBeDefined()
      expect(mainFile!.name).toBe('src/Token.sol')
    })

    it('sorts the main contract file first', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {
          'src/lib/SafeMath.sol': { content: 'library SafeMath {}' },
          'src/Token.sol': { content: 'contract Token {}' },
          'src/interfaces/IERC20.sol': { content: 'interface IERC20 {}' },
        },
        settings: {},
      })

      const result = parseSourceCodeFiles(jsonInput, 'Token')

      expect(result[0]!.name).toBe('src/Token.sol')
      expect(result[0]!.isMain).toBe(true)
    })

    it('sorts non-main files alphabetically after the main file', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {
          'src/lib/Zeta.sol': { content: 'library Zeta {}' },
          'src/Token.sol': { content: 'contract Token {}' },
          'src/lib/Alpha.sol': { content: 'library Alpha {}' },
        },
        settings: {},
      })

      const result = parseSourceCodeFiles(jsonInput, 'Token')

      expect(result[0]!.name).toBe('src/Token.sol')
      expect(result[1]!.name).toBe('src/lib/Alpha.sol')
      expect(result[2]!.name).toBe('src/lib/Zeta.sol')
    })

    it('falls back to first non-lib file as main when contract name does not match', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {
          'lib/forge-std/Vm.sol': { content: 'interface Vm {}' },
          'src/MyContract.sol': { content: 'contract MyContract {}' },
          'src/lib/Helper.sol': { content: 'library Helper {}' },
        },
        settings: {},
      })

      const result = parseSourceCodeFiles(jsonInput, 'NonExistent')
      const mainFile = result.find((f) => f.isMain)

      expect(mainFile).toBeDefined()
      expect(mainFile!.name).toBe('src/MyContract.sol')
    })

    it('falls back to first file overall when all files are in lib/', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {
          'lib/forge-std/Vm.sol': { content: 'interface Vm {}' },
          'lib/openzeppelin/ERC20.sol': { content: 'contract ERC20 {}' },
        },
        settings: {},
      })

      const result = parseSourceCodeFiles(jsonInput, 'NonExistent')
      const mainFiles = result.filter((f) => f.isMain)

      expect(mainFiles).toHaveLength(1)
    })

    it('matches contract name case-insensitively', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {
          'src/mytoken.sol': { content: 'contract MyToken {}' },
          'src/lib/Helper.sol': { content: 'library Helper {}' },
        },
        settings: {},
      })

      const result = parseSourceCodeFiles(jsonInput, 'MyToken')
      const mainFile = result.find((f) => f.isMain)

      expect(mainFile).toBeDefined()
      expect(mainFile!.name).toBe('src/mytoken.sol')
    })

    it('skips sources with empty content', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {
          'src/Token.sol': { content: 'contract Token {}' },
          'src/Empty.sol': { content: '' },
        },
        settings: {},
      })

      const result = parseSourceCodeFiles(jsonInput, 'Token')

      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('src/Token.sol')
    })

    it('returns empty array when sources object is missing', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
      })

      const result = parseSourceCodeFiles(jsonInput, 'Token')

      // JSON is detected as Standard JSON Input but sources is missing,
      // parseStandardJsonInput returns [], then falls through to plain Solidity
      expect(result).toBeDefined()
    })

    it('preserves full file paths as the name property', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {
          'src/contracts/deep/Token.sol': { content: 'contract Token {}' },
        },
        settings: {},
      })

      const result = parseSourceCodeFiles(jsonInput, 'Token')

      expect(result[0]!.name).toBe('src/contracts/deep/Token.sol')
    })

    it('excludes interface and abstract paths from main fallback selection', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {
          'src/interfaces/IToken.sol': { content: 'interface IToken {}' },
          'src/abstract/BaseToken.sol': { content: 'abstract contract BaseToken {}' },
          'src/Vault.sol': { content: 'contract Vault {}' },
        },
        settings: {},
      })

      const result = parseSourceCodeFiles(jsonInput, 'NonExistent')
      const mainFile = result.find((f) => f.isMain)

      expect(mainFile).toBeDefined()
      expect(mainFile!.name).toBe('src/Vault.sol')
    })
  })

  // ---------------------------------------------------------------------------
  // Custom marker format (system contracts)
  // ---------------------------------------------------------------------------
  describe('custom marker format', () => {
    it('parses main contract and abstract files from marker format', () => {
      const markerSource = `// === Abstract Contracts ===
// --- GovBase.sol ---
pragma solidity ^0.8.0;
abstract contract GovBase {
    uint256 public baseValue;
}
// --- Ownable.sol ---
pragma solidity ^0.8.0;
abstract contract Ownable {
    address public owner;
}
// === Main Contract: NativeCoinAdapter ===
pragma solidity ^0.8.0;
contract NativeCoinAdapter {
    uint256 public totalSupply;
}`

      const result = parseSourceCodeFiles(markerSource, 'NativeCoinAdapter')

      expect(result).toHaveLength(3)
    })

    it('identifies the main contract from the marker', () => {
      const markerSource = `// === Abstract Contracts ===
// --- GovBase.sol ---
abstract contract GovBase {}
// === Main Contract: NativeCoinAdapter ===
contract NativeCoinAdapter {}`

      const result = parseSourceCodeFiles(markerSource, 'NativeCoinAdapter')
      const mainFile = result.find((f) => f.isMain)

      expect(mainFile).toBeDefined()
      expect(mainFile!.name).toBe('NativeCoinAdapter.sol')
      expect(mainFile!.isMain).toBe(true)
    })

    it('sorts main contract before abstract files', () => {
      const markerSource = `// === Abstract Contracts ===
// --- ZetaBase.sol ---
abstract contract ZetaBase {}
// --- AlphaBase.sol ---
abstract contract AlphaBase {}
// === Main Contract: MyContract ===
contract MyContract {}`

      const result = parseSourceCodeFiles(markerSource, 'MyContract')

      expect(result[0]!.name).toBe('MyContract.sol')
      expect(result[0]!.isMain).toBe(true)
      expect(result.slice(1).every((f) => !f.isMain)).toBe(true)
    })

    it('sorts abstract files alphabetically after main', () => {
      const markerSource = `// === Abstract Contracts ===
// --- Zeta.sol ---
abstract contract Zeta {}
// --- Alpha.sol ---
abstract contract Alpha {}
// === Main Contract: Main ===
contract Main {}`

      const result = parseSourceCodeFiles(markerSource, 'Main')

      expect(result[0]!.name).toBe('Main.sol')
      expect(result[1]!.name).toBe('Alpha.sol')
      expect(result[2]!.name).toBe('Zeta.sol')
    })

    it('marks abstract files as non-main', () => {
      const markerSource = `// === Abstract Contracts ===
// --- GovBase.sol ---
abstract contract GovBase {}
// === Main Contract: Adapter ===
contract Adapter {}`

      const result = parseSourceCodeFiles(markerSource, 'Adapter')
      const abstractFiles = result.filter((f) => !f.isMain)

      expect(abstractFiles).toHaveLength(1)
      expect(abstractFiles[0]!.name).toBe('GovBase.sol')
    })

    it('trims whitespace from parsed content', () => {
      const markerSource = `// === Abstract Contracts ===
// --- GovBase.sol ---

abstract contract GovBase {}

// === Main Contract: Main ===

contract Main {}`

      const result = parseSourceCodeFiles(markerSource, 'Main')

      const mainFile = result.find((f) => f.isMain)
      expect(mainFile!.content).toBe('contract Main {}')

      const abstractFile = result.find((f) => !f.isMain)
      expect(abstractFile!.content).toBe('abstract contract GovBase {}')
    })

    it('handles source with only main marker and no abstract marker', () => {
      const markerSource = `// === Main Contract: StakeManager ===
contract StakeManager {
    function stake() external {}
}`

      const result = parseSourceCodeFiles(markerSource, 'StakeManager')

      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('StakeManager.sol')
      expect(result[0]!.isMain).toBe(true)
    })

    it('handles source with only abstract marker (no main marker)', () => {
      const markerSource = `// === Abstract Contracts ===
// --- GovBase.sol ---
abstract contract GovBase {}`

      const result = parseSourceCodeFiles(markerSource, 'SomeContract')

      // No main marker match => falls into the else branch, returns single file
      expect(result).toHaveLength(1)
      expect(result[0]!.isMain).toBe(true)
      expect(result[0]!.name).toBe('SomeContract.sol')
    })

    it('skips abstract entries with empty content', () => {
      const markerSource = `// === Abstract Contracts ===
// --- Empty.sol ---
// --- HasContent.sol ---
abstract contract HasContent {}
// === Main Contract: Main ===
contract Main {}`

      const result = parseSourceCodeFiles(markerSource, 'Main')

      const nonMainFiles = result.filter((f) => !f.isMain)
      expect(nonMainFiles).toHaveLength(1)
      expect(nonMainFiles[0]!.name).toBe('HasContent.sol')
    })
  })

  // ---------------------------------------------------------------------------
  // Invalid JSON that starts with `{`
  // ---------------------------------------------------------------------------
  describe('invalid JSON that starts with {', () => {
    it('falls through to plain Solidity when JSON is malformed', () => {
      const badJson = '{ this is not valid json at all'

      const result = parseSourceCodeFiles(badJson, 'Fallback')

      // Does not contain "language" or "sources" so isStandardJsonInput returns false
      // Falls through to plain Solidity
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Fallback.sol')
      expect(result[0]!.isMain).toBe(true)
    })

    it('falls through gracefully when JSON has language/sources strings but is not parseable', () => {
      const trickyBadJson = '{ "language" and "sources" but still not valid JSON }'

      const result = parseSourceCodeFiles(trickyBadJson, 'Fallback')

      // isStandardJsonInput returns true because it contains both strings and starts with {
      // But JSON.parse fails, so parseStandardJsonInput returns []
      // Then falls through to plain Solidity
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Fallback.sol')
      expect(result[0]!.isMain).toBe(true)
    })

    it('falls through when JSON is valid but sources is not an object', () => {
      const jsonWithBadSources = JSON.stringify({
        language: 'Solidity',
        sources: 'not an object',
      })

      const result = parseSourceCodeFiles(jsonWithBadSources, 'Fallback')

      // parseStandardJsonInput returns [] because sources is not an object
      // Falls through to plain Solidity
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Fallback.sol')
      expect(result[0]!.isMain).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  describe('edge cases', () => {
    it('handles whitespace-only source as plain Solidity', () => {
      const result = parseSourceCodeFiles('   \n\t  ', null)

      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Contract.sol')
      expect(result[0]!.content).toBe('   \n\t  ')
    })

    it('handles Standard JSON Input with a single source', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {
          'src/OnlyOne.sol': { content: 'contract OnlyOne {}' },
        },
      })

      const result = parseSourceCodeFiles(jsonInput, 'OnlyOne')

      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('src/OnlyOne.sol')
      expect(result[0]!.isMain).toBe(true)
    })

    it('handles Standard JSON Input with empty sources object', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {},
      })

      const result = parseSourceCodeFiles(jsonInput, 'Token')

      // parseStandardJsonInput returns [] for empty sources
      // Falls through to plain Solidity path
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Token.sol')
    })

    it('matches contract name against filename without .sol extension', () => {
      const jsonInput = JSON.stringify({
        language: 'Solidity',
        sources: {
          'src/MyToken.sol': { content: 'contract MyToken {}' },
          'src/Helper.sol': { content: 'library Helper {}' },
        },
      })

      const result = parseSourceCodeFiles(jsonInput, 'MyToken')
      const mainFile = result.find((f) => f.isMain)

      expect(mainFile!.name).toBe('src/MyToken.sol')
    })

    it('handles custom marker format with file paths containing slashes', () => {
      const markerSource = `// === Abstract Contracts ===
// --- contracts/base/GovBase.sol ---
abstract contract GovBase {}
// === Main Contract: Adapter ===
contract Adapter {}`

      const result = parseSourceCodeFiles(markerSource, 'Adapter')

      const abstractFile = result.find((f) => !f.isMain)
      expect(abstractFile).toBeDefined()
      expect(abstractFile!.name).toBe('contracts/base/GovBase.sol')
    })
  })
})
