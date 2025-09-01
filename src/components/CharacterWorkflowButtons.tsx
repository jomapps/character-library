'use client'

import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'
import { useDocumentInfo } from '@payloadcms/ui'

interface CharacterWorkflowButtonsProps {
  // Payload UI field props
  path?: string
  name?: string
  label?: string
  // Custom props (optional for backward compatibility)
  characterId?: string
  characterName?: string
  masterReferenceProcessed?: boolean
  coreSetGenerated?: boolean
  onRefresh?: () => void
}

export const CharacterWorkflowButtons: React.FC<CharacterWorkflowButtonsProps> = (props) => {
  // Get document data from Payload context
  const { id: docId, data: docData } = useDocumentInfo()

  // Use props or document data
  const characterId = props.characterId || docId
  const characterName = props.characterName || docData?.name || 'Unknown Character'
  const masterReferenceProcessed =
    props.masterReferenceProcessed || docData?.masterReferenceProcessed || false
  const coreSetGenerated = props.coreSetGenerated || docData?.coreSetGenerated || false
  const onRefresh = props.onRefresh
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApiCall = async (endpoint: string, method: string = 'POST', body?: any) => {
    try {
      setError(null)
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    }
  }

  const generateCoreSet = async () => {
    if (!masterReferenceProcessed) {
      setError('Master reference image must be processed first')
      return
    }

    setLoading('core-set')
    try {
      const result = await handleApiCall(`/api/characters/${characterId}/generate-core-set`)
      setResults(result)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Core set generation failed:', err)
    } finally {
      setLoading(null)
    }
  }

  const validateConsistency = async () => {
    setLoading('validate')
    try {
      const result = await handleApiCall(`/api/characters/${characterId}/validate-consistency`)
      setResults(result)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Consistency validation failed:', err)
    } finally {
      setLoading(null)
    }
  }

  const generateOnDemandImage = async () => {
    const prompt = window.prompt(
      'Enter a prompt for the on-demand image generation:',
      `${characterName} in a cinematic scene`,
    )

    if (!prompt) return

    setLoading('on-demand')
    try {
      const result = await handleApiCall(`/api/characters/${characterId}/generate-image`, 'POST', {
        prompt,
        style: 'character_production',
        shotType: 'on_demand_custom',
        tags: 'custom generation, on-demand',
      })
      setResults(result)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('On-demand generation failed:', err)
    } finally {
      setLoading(null)
    }
  }

  const runQualityAssurance = async () => {
    setLoading('qa')
    try {
      // First get the character data to extract asset IDs
      const characterResponse = await fetch(`/api/characters/${characterId}`)
      const characterData = await characterResponse.json()

      if (!characterData.imageGallery || characterData.imageGallery.length === 0) {
        throw new Error('No images in gallery to validate')
      }

      const assetIds = characterData.imageGallery
        .filter((item: any) => item.dinoAssetId)
        .map((item: any) => item.dinoAssetId)

      if (assetIds.length === 0) {
        throw new Error('No processed images found for QA')
      }

      const masterRefId = characterData.masterReferenceImage?.dinoAssetId

      const result = await handleApiCall('/api/qa', 'POST', {
        assetIds,
        masterReferenceAssetId: masterRefId,
      })
      setResults(result)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('QA failed:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <h3 style={{ marginBottom: '16px', color: '#333' }}>Character Workflow Actions</h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <Button onClick={generateCoreSet} disabled={!masterReferenceProcessed || loading !== null}>
          {loading === 'core-set'
            ? 'Generating...'
            : coreSetGenerated
              ? 'Regenerate 360° Core Set'
              : 'Generate 360° Core Set'}
        </Button>

        <Button onClick={validateConsistency} disabled={loading !== null}>
          {loading === 'validate' ? 'Validating...' : 'Validate Consistency'}
        </Button>

        <Button
          onClick={generateOnDemandImage}
          disabled={!masterReferenceProcessed || loading !== null}
        >
          {loading === 'on-demand' ? 'Generating...' : 'Generate Custom Image'}
        </Button>

        <Button onClick={runQualityAssurance} disabled={loading !== null}>
          {loading === 'qa' ? 'Running QA...' : 'Run Quality Assurance'}
        </Button>
      </div>

      {/* Status indicators */}
      <div style={{ marginBottom: '16px', fontSize: '14px' }}>
        <div style={{ color: masterReferenceProcessed ? '#28a745' : '#dc3545' }}>
          ● Master Reference: {masterReferenceProcessed ? 'Processed' : 'Not Processed'}
        </div>
        <div style={{ color: coreSetGenerated ? '#28a745' : '#6c757d' }}>
          ● 360° Core Set: {coreSetGenerated ? 'Generated' : 'Not Generated'}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
            marginBottom: '16px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results display */}
      {results && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            color: '#155724',
            marginBottom: '16px',
          }}
        >
          <strong>Success:</strong> {results.message}
          {results.data && (
            <details style={{ marginTop: '8px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Details</summary>
              <pre
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                {JSON.stringify(results.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Help text */}
      <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.4' }}>
        <strong>Workflow Steps:</strong>
        <ol style={{ marginTop: '4px', paddingLeft: '20px' }}>
          <li>Upload and process master reference image</li>
          <li>Generate 360° core reference set (8 turnaround angles)</li>
          <li>Validate consistency across all images</li>
          <li>Generate custom images as needed</li>
          <li>Run quality assurance on image collections</li>
        </ol>
      </div>
    </div>
  )
}

export default CharacterWorkflowButtons
