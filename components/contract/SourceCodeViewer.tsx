'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UI, getSystemContractInfo } from '@/lib/config/constants'

interface SourceFile {
  name: string
  content: string
  isMain?: boolean
}

interface SourceCodeViewerProps {
  address: string
  isVerified: boolean
}

/**
 * Mock source code files for system contracts
 * TODO: Replace with actual API call when backend implements contract verification
 */
const SYSTEM_CONTRACT_SOURCES: Record<string, SourceFile[]> = {
  '0x0000000000000000000000000000000000001000': [
    {
      name: 'NativeCoinAdapter.sol',
      isMain: true,
      content: `// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.14;

import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { AbstractFiatToken } from "../abstracts/AbstractFiatToken.sol";
import { Mintable } from "../abstracts/Mintable.sol";
import { EIP712Domain } from "../abstracts/eip/EIP712Domain.sol";
import { EIP3009 } from "../abstracts/eip/EIP3009.sol";
import { EIP2612 } from "../abstracts/eip/EIP2612.sol";

/**
 * @title NativeCoinAdapter
 * @dev ERC20 Token backed by fiat reserves (Native Coin Wrapper)
 */
contract NativeCoinAdapter is AbstractFiatToken, Mintable, EIP3009, EIP2612 {
    using SafeMath for uint256;

    address private __coinManager;
    address private __accountManager;

    string public name;
    string public symbol;
    uint8 public decimals;
    string public currency;

    mapping(address => mapping(address => uint256)) private __allowed;
    uint256 private __totalSupply = 0;

    function totalSupply() external view override returns (uint256) {
        return __totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return account.balance;
    }

    // ... (truncated for display)
}`,
    },
    {
      name: 'AbstractFiatToken.sol',
      content: `// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.14;

/**
 * @title AbstractFiatToken
 * @dev Abstract base contract for fiat-backed tokens
 */
abstract contract AbstractFiatToken {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed minter, address indexed to, uint256 amount);
    event Burn(address indexed burner, uint256 amount);

    function totalSupply() external view virtual returns (uint256);
    function balanceOf(address account) external view virtual returns (uint256);
    function transfer(address to, uint256 value) external virtual returns (bool);
    function transferFrom(address from, address to, uint256 value) external virtual returns (bool);
    function approve(address spender, uint256 value) external virtual returns (bool);
    function allowance(address owner, address spender) external view virtual returns (uint256);

    function _transfer(address from, address to, uint256 value) internal virtual;
    function _approve(address owner, address spender, uint256 value) internal virtual;
}`,
    },
    {
      name: 'Mintable.sol',
      content: `// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.14;

/**
 * @title Mintable
 * @dev Minting functionality for tokens
 */
abstract contract Mintable {
    address public masterMinter;
    mapping(address => bool) internal _minters;
    mapping(address => uint256) internal _minterAllowed;

    event MinterConfigured(address indexed minter, uint256 minterAllowedAmount);
    event MinterRemoved(address indexed oldMinter);
    event MasterMinterChanged(address indexed newMasterMinter);

    modifier onlyMinters() {
        require(_minters[msg.sender], "Mintable: caller is not a minter");
        _;
    }

    modifier onlyMasterMinter() {
        require(msg.sender == masterMinter, "Mintable: caller is not the masterMinter");
        _;
    }

    function mint(address to, uint256 amount) external virtual returns (bool);
    function burn(uint256 amount) external virtual;
}`,
    },
    {
      name: 'EIP712Domain.sol',
      content: `// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.14;

/**
 * @title EIP712Domain
 * @dev EIP-712 Domain Separator implementation
 */
abstract contract EIP712Domain {
    bytes32 internal _DEPRECATED_CACHED_DOMAIN_SEPARATOR;

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparator();
    }

    function _domainSeparator() internal view virtual returns (bytes32);
}`,
    },
  ],
}

/**
 * Get contract source code files
 * Mock implementation - replace with actual API call when backend is ready
 */
function getContractSourceCode(address: string, isVerified: boolean): {
  files: SourceFile[]
  loading: boolean
  error: string | null
  isSystemContract: boolean
} {
  if (!isVerified) {
    return { files: [], loading: false, error: null, isSystemContract: false }
  }

  const normalizedAddress = address.toLowerCase()

  // Check if this is a known system contract
  for (const [contractAddress, files] of Object.entries(SYSTEM_CONTRACT_SOURCES)) {
    if (contractAddress.toLowerCase() === normalizedAddress) {
      return {
        files,
        loading: false,
        error: null,
        isSystemContract: true,
      }
    }
  }

  // Default mock for other verified contracts
  const defaultMockCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Contract
 * @dev Contract source code not available
 * @notice Backend API integration pending
 */
contract UnverifiedContract {
    // Source code will be available after backend API integration
}`

  return {
    files: [{ name: 'Contract.sol', content: defaultMockCode, isMain: true }],
    loading: false,
    error: null,
    isSystemContract: false,
  }
}

export function SourceCodeViewer({ address, isVerified }: SourceCodeViewerProps) {
  const [selectedFile, setSelectedFile] = useState(0)
  const [copied, setCopied] = useState(false)
  const { files, loading, error, isSystemContract } = getContractSourceCode(address, isVerified)
  const systemInfo = getSystemContractInfo(address)

  if (!isVerified || files.length === 0) {
    return null
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>SOURCE CODE</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
            <span className="text-sm text-text-muted">Loading source code...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>SOURCE CODE</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-error">Failed to load source code</p>
        </CardContent>
      </Card>
    )
  }

  const currentFile = files[selectedFile]

  if (!currentFile) {
    return null
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.content)
      setCopied(true)
      setTimeout(() => setCopied(false), UI.COPY_TIMEOUT)
    } catch {
      // Clipboard API not available
    }
  }

  const lineCount = currentFile.content.split('\n').length

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>SOURCE CODE</span>
            {isSystemContract && systemInfo && (
              <span
                className="rounded bg-accent-cyan/20 px-2 py-0.5 text-xs text-accent-cyan"
                title={systemInfo.description}
              >
                System Contract
              </span>
            )}
          </div>
          <span className="text-xs font-normal text-text-muted">
            {files.length} file{files.length > 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* File Tabs */}
        {files.length > 1 && (
          <div className="flex flex-wrap border-b border-bg-tertiary bg-bg-secondary">
            {files.map((file, index) => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(index)}
                className={`px-4 py-2 text-xs font-mono transition-colors ${
                  index === selectedFile
                    ? 'bg-bg-primary text-accent-blue border-b-2 border-accent-blue'
                    : 'text-text-secondary hover:text-text-primary'
                } ${file.isMain ? 'font-bold' : ''}`}
                aria-selected={index === selectedFile}
                role="tab"
              >
                {file.name}
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-bg-tertiary bg-bg-secondary px-4 py-2">
          <span className="text-xs text-text-muted">
            {currentFile.name} • {lineCount} lines
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            aria-label={copied ? 'Copied to clipboard' : 'Copy source code'}
          >
            {copied ? 'COPIED!' : 'COPY'}
          </Button>
        </div>

        {/* Code Display */}
        <div className="overflow-x-auto">
          <pre className="p-4 text-sm leading-relaxed">
            <code className="font-mono text-text-primary">
              {currentFile.content.split('\n').map((line, index) => (
                <div key={index} className="flex">
                  <span className="mr-4 select-none text-right text-text-muted" style={{ minWidth: '3ch' }}>
                    {index + 1}
                  </span>
                  <span className="flex-1 whitespace-pre">{line || ' '}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
