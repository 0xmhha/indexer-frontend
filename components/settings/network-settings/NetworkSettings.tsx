'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useNetworkStore, selectCustomNetworks, selectCurrentNetwork } from '@/stores/networkStore'
import { PRESET_NETWORKS, MAX_CUSTOM_NETWORKS } from '@/config/networks.config'
import type { NetworkConfig } from '@/lib/config/networks.types'
import {
  SUCCESS_MESSAGE_DURATION,
  initialFormData,
  validateFormData,
  type NetworkFormData,
  type FormErrors,
} from './types'
import {
  CurrentNetworkDisplay,
  PresetNetworkCard,
  CustomNetworkCard,
  NetworkForm,
} from './NetworkFormCards'

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
