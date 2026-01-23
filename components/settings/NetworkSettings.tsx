'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useNetworkStore, selectCustomNetworks, selectCurrentNetwork } from '@/stores/networkStore'
import { PRESET_NETWORKS, MAX_CUSTOM_NETWORKS, NETWORK_TYPE_LABELS } from '@/config/networks.config'
import { TIMEOUTS } from '@/lib/config/constants'
import type { NetworkConfig, NetworkType } from '@/lib/config/networks.types'

// ============================================================================
// Types & Constants
// ============================================================================

const SUCCESS_MESSAGE_DURATION = TIMEOUTS.IMPORT_SUCCESS_DURATION

interface NetworkFormData {
  name: string
  graphqlEndpoint: string
  wsEndpoint: string
  jsonRpcEndpoint: string
  chainName: string
  chainId: string
  currencySymbol: string
  description: string
}

const initialFormData: NetworkFormData = {
  name: '',
  graphqlEndpoint: '',
  wsEndpoint: '',
  jsonRpcEndpoint: '',
  chainName: '',
  chainId: '',
  currencySymbol: '',
  description: '',
}

type FormErrors = Partial<Record<keyof NetworkFormData, string>>

// ============================================================================
// Helper Functions
// ============================================================================

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function validateFormData(data: NetworkFormData): { valid: boolean; errors: FormErrors } {
  const errors: FormErrors = {}
  if (!data.name.trim()) {errors.name = 'Network name is required'}
  if (!data.graphqlEndpoint.trim()) {
    errors.graphqlEndpoint = 'GraphQL endpoint is required'
  } else if (!isValidUrl(data.graphqlEndpoint)) {
    errors.graphqlEndpoint = 'Invalid URL format'
  }
  if (!data.wsEndpoint.trim()) {
    errors.wsEndpoint = 'WebSocket endpoint is required'
  } else if (!isValidUrl(data.wsEndpoint.replace(/^ws/, 'http'))) {
    errors.wsEndpoint = 'Invalid WebSocket URL format'
  }
  if (!data.jsonRpcEndpoint.trim()) {
    errors.jsonRpcEndpoint = 'JSON-RPC endpoint is required'
  } else if (!isValidUrl(data.jsonRpcEndpoint)) {
    errors.jsonRpcEndpoint = 'Invalid URL format'
  }
  if (!data.chainName.trim()) {errors.chainName = 'Chain name is required'}
  if (!data.chainId.trim()) {
    errors.chainId = 'Chain ID is required'
  } else if (!/^\d+$/.test(data.chainId)) {
    errors.chainId = 'Chain ID must be a number'
  }
  if (!data.currencySymbol.trim()) {errors.currencySymbol = 'Currency symbol is required'}
  return { valid: Object.keys(errors).length === 0, errors }
}

function getNetworkTypeStyle(type: NetworkType): string {
  switch (type) {
    case 'mainnet':
      return 'bg-success/10 text-success'
    case 'testnet':
      return 'bg-warning/10 text-warning'
    case 'custom':
      return 'bg-accent-blue/10 text-accent-blue'
    default:
      return 'bg-text-muted/10 text-text-muted'
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

function FormInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = true,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  error?: string | undefined
  required?: boolean | undefined
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="font-mono text-xs text-text-secondary">
        {label} {required && '*'}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border bg-bg-secondary px-3 py-2 font-mono text-sm text-text-primary transition-colors focus:outline-none ${
          error ? 'border-error' : 'border-bg-tertiary focus:border-accent-blue'
        }`}
      />
      {error && <p className="font-mono text-xs text-error">{error}</p>}
    </div>
  )
}

function CurrentNetworkDisplay({ network }: { network: NetworkConfig | null }) {
  if (!network) {
    return <p className="font-mono text-xs text-text-muted">No network selected</p>
  }
  return (
    <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-sm text-text-primary">{network.name}</p>
          <p className="font-mono text-xs text-text-muted">
            Chain ID: {network.chain.id} · {network.chain.currencySymbol}
          </p>
        </div>
        <span className={`rounded px-2 py-1 font-mono text-xs ${getNetworkTypeStyle(network.type)}`}>
          {NETWORK_TYPE_LABELS[network.type]}
        </span>
      </div>
    </div>
  )
}

function PresetNetworkCard({
  network,
  isSelected,
  onSelect,
}: {
  network: NetworkConfig
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center justify-between rounded border p-3 text-left transition-colors ${
        isSelected
          ? 'border-accent-blue bg-accent-blue/5'
          : 'border-bg-tertiary bg-bg-secondary hover:border-accent-blue/50'
      }`}
    >
      <div>
        <p className="font-mono text-sm text-text-primary">{network.name}</p>
        <p className="font-mono text-xs text-text-muted">
          Chain ID: {network.chain.id} · {network.chain.currencySymbol}
        </p>
      </div>
      <span className="font-mono text-xs text-text-muted">{NETWORK_TYPE_LABELS[network.type]}</span>
    </button>
  )
}

function CustomNetworkCard({
  network,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  network: NetworkConfig
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`rounded border p-3 ${
        isSelected ? 'border-accent-blue bg-accent-blue/5' : 'border-bg-tertiary bg-bg-secondary'
      }`}
    >
      <div className="flex items-center justify-between">
        <button onClick={onSelect} className="flex-1 text-left">
          <p className="font-mono text-sm text-text-primary">{network.name}</p>
          <p className="font-mono text-xs text-text-muted">
            Chain ID: {network.chain.id} · {network.chain.currencySymbol}
          </p>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="font-mono text-xs text-text-muted transition-colors hover:text-accent-blue"
            aria-label={`Edit ${network.name}`}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="font-mono text-xs text-text-muted transition-colors hover:text-error"
            aria-label={`Delete ${network.name}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function NetworkForm({
  formData,
  formErrors,
  editingId,
  onInputChange,
  onSave,
  onCancel,
}: {
  formData: NetworkFormData
  formErrors: FormErrors
  editingId: string | null
  onInputChange: (field: keyof NetworkFormData, value: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4 rounded border border-accent-blue bg-accent-blue/5 p-4">
      <h3 className="font-mono text-sm font-medium text-text-primary">
        {editingId ? 'Edit Network' : 'Add Custom Network'}
      </h3>

      <FormInput
        id="network-name"
        label="Network Name"
        value={formData.name}
        onChange={(v) => onInputChange('name', v)}
        placeholder="My Custom Network"
        error={formErrors.name}
      />

      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-wider text-text-muted">Endpoints</p>
        <FormInput
          id="graphql-endpoint"
          label="GraphQL Endpoint"
          value={formData.graphqlEndpoint}
          onChange={(v) => onInputChange('graphqlEndpoint', v)}
          placeholder="http://localhost:8080/graphql"
          error={formErrors.graphqlEndpoint}
        />
        <FormInput
          id="ws-endpoint"
          label="WebSocket Endpoint"
          value={formData.wsEndpoint}
          onChange={(v) => onInputChange('wsEndpoint', v)}
          placeholder="ws://localhost:8080/graphql/ws"
          error={formErrors.wsEndpoint}
        />
        <FormInput
          id="rpc-endpoint"
          label="JSON-RPC Endpoint"
          value={formData.jsonRpcEndpoint}
          onChange={(v) => onInputChange('jsonRpcEndpoint', v)}
          placeholder="http://localhost:8545"
          error={formErrors.jsonRpcEndpoint}
        />
      </div>

      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-wider text-text-muted">Chain Configuration</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormInput
            id="chain-name"
            label="Chain Name"
            value={formData.chainName}
            onChange={(v) => onInputChange('chainName', v)}
            placeholder="My Chain"
            error={formErrors.chainName}
          />
          <FormInput
            id="chain-id"
            label="Chain ID"
            value={formData.chainId}
            onChange={(v) => onInputChange('chainId', v)}
            placeholder="1234"
            error={formErrors.chainId}
          />
          <FormInput
            id="currency-symbol"
            label="Currency Symbol"
            value={formData.currencySymbol}
            onChange={(v) => onInputChange('currencySymbol', v)}
            placeholder="ETH"
            error={formErrors.currencySymbol}
          />
        </div>
      </div>

      <FormInput
        id="description"
        label="Description (optional)"
        value={formData.description}
        onChange={(v) => onInputChange('description', v)}
        placeholder="A brief description of this network"
        required={false}
      />

      <div className="flex gap-2 pt-2">
        <button onClick={onSave} className="btn-hex px-4 py-2 text-xs">
          {editingId ? 'UPDATE NETWORK' : 'ADD NETWORK'}
        </button>
        <button
          onClick={onCancel}
          className="border border-bg-tertiary bg-transparent px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary"
        >
          CANCEL
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function NetworkSettings() {
  const customNetworks = useNetworkStore(selectCustomNetworks)
  const currentNetwork = useNetworkStore(selectCurrentNetwork)
  const addCustomNetwork = useNetworkStore((state) => state.addCustomNetwork)
  const updateCustomNetwork = useNetworkStore((state) => state.updateCustomNetwork)
  const removeCustomNetwork = useNetworkStore((state) => state.removeCustomNetwork)
  const selectNetwork = useNetworkStore((state) => state.selectNetwork)

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<NetworkFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const canAddMore = customNetworks.length < MAX_CUSTOM_NETWORKS
  const isFormVisible = isAdding || editingId !== null

  const handleInputChange = (field: keyof NetworkFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {setFormErrors((prev) => ({ ...prev, [field]: undefined }))}
  }

  const handleStartAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData(initialFormData)
    setFormErrors({})
  }

  const handleStartEdit = (network: NetworkConfig) => {
    setIsAdding(false)
    setEditingId(network.id)
    setFormData({
      name: network.name,
      graphqlEndpoint: network.endpoints.graphqlEndpoint,
      wsEndpoint: network.endpoints.wsEndpoint,
      jsonRpcEndpoint: network.endpoints.jsonRpcEndpoint,
      chainName: network.chain.name,
      chainId: network.chain.id,
      currencySymbol: network.chain.currencySymbol,
      description: network.description ?? '',
    })
    setFormErrors({})
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData(initialFormData)
    setFormErrors({})
  }

  const handleSave = () => {
    const validation = validateFormData(formData)
    if (!validation.valid) {
      setFormErrors(validation.errors)
      return
    }

    const descriptionValue = formData.description.trim()
    const networkData: Omit<NetworkConfig, 'id' | 'type' | 'isCustom'> = {
      name: formData.name.trim(),
      endpoints: {
        graphqlEndpoint: formData.graphqlEndpoint.trim(),
        wsEndpoint: formData.wsEndpoint.trim(),
        jsonRpcEndpoint: formData.jsonRpcEndpoint.trim(),
      },
      chain: {
        name: formData.chainName.trim(),
        id: formData.chainId.trim(),
        currencySymbol: formData.currencySymbol.trim().toUpperCase(),
      },
      ...(descriptionValue ? { description: descriptionValue } : {}),
    }

    const success = editingId
      ? updateCustomNetwork(editingId, networkData)
      : addCustomNetwork(networkData) !== null

    if (success) {
      setSuccessMessage(editingId ? 'Network updated successfully!' : 'Network added successfully!')
      handleCancel()
      setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_DURATION)
    }
  }

  const handleDelete = (networkId: string) => {
    if (confirm('Are you sure you want to delete this network?')) {
      removeCustomNetwork(networkId)
      if (editingId === networkId) {handleCancel()}
    }
  }

  return (
    <Card id="networks">
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>NETWORK SETTINGS</CardTitle>
          {canAddMore && !isFormVisible && (
            <button onClick={handleStartAdd} className="btn-hex px-3 py-1.5 text-xs" aria-label="Add custom network">
              ADD NETWORK
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {successMessage && (
          <div className="rounded border border-success bg-success/10 p-3">
            <p className="font-mono text-xs text-success">{successMessage}</p>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-mono text-sm font-medium text-text-primary">Current Network</h3>
          <CurrentNetworkDisplay network={currentNetwork} />
        </div>

        <div className="space-y-2">
          <h3 className="font-mono text-sm font-medium text-text-primary">Available Networks</h3>
          <div className="space-y-2">
            {PRESET_NETWORKS.map((network) => (
              <PresetNetworkCard
                key={network.id}
                network={network}
                isSelected={currentNetwork?.id === network.id}
                onSelect={() => selectNetwork(network.id)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-mono text-sm font-medium text-text-primary">
            Custom Networks ({customNetworks.length}/{MAX_CUSTOM_NETWORKS})
          </h3>
          {customNetworks.length === 0 && !isAdding ? (
            <p className="font-mono text-xs text-text-muted">No custom networks configured</p>
          ) : (
            <div className="space-y-2">
              {customNetworks.map((network) => (
                <CustomNetworkCard
                  key={network.id}
                  network={network}
                  isSelected={currentNetwork?.id === network.id}
                  onSelect={() => selectNetwork(network.id)}
                  onEdit={() => handleStartEdit(network)}
                  onDelete={() => handleDelete(network.id)}
                />
              ))}
            </div>
          )}
        </div>

        {isFormVisible && (
          <NetworkForm
            formData={formData}
            formErrors={formErrors}
            editingId={editingId}
            onInputChange={handleInputChange}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {!canAddMore && !editingId && (
          <div className="rounded border border-warning bg-warning/10 p-3">
            <p className="font-mono text-xs text-warning">
              Maximum number of custom networks ({MAX_CUSTOM_NETWORKS}) reached. Delete an existing network to add a new
              one.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
