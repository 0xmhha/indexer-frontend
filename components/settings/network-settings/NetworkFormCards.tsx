'use client'

import { NETWORK_TYPE_LABELS } from '@/config/networks.config'
import type { NetworkConfig } from '@/lib/config/networks.types'
import { getNetworkTypeStyle, type NetworkFormData, type FormErrors } from './types'

export function FormInput({
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

export function CurrentNetworkDisplay({ network }: { network: NetworkConfig | null }) {
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

export function PresetNetworkCard({
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

export function CustomNetworkCard({
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

export function NetworkForm({
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
