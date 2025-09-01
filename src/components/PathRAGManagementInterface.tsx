'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@payloadcms/ui'

interface PathRAGStats {
  total_documents: number
  total_entities: number
  total_relationships: number
  cache_hit_rate: number
}

interface SyncResult {
  characterId: string
  characterName: string
  status: 'success' | 'error' | 'skipped'
  documentsInserted?: number
  error?: string
  reason?: string
}

export const PathRAGManagementInterface: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null)
  const [stats, setStats] = useState<PathRAGStats | null>(null)
  const [serviceHealth, setServiceHealth] = useState<boolean | null>(null)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchManagementInfo()
  }, [])

  const fetchManagementInfo = async () => {
    try {
      setError(null)
      const response = await fetch('/api/pathrag/manage')
      const data = await response.json()

      if (data.success) {
        setServiceHealth(data.data.serviceHealth.healthy)
        setStats(data.data.statistics)
      }
    } catch (err) {
      setError('Failed to fetch management info')
      setServiceHealth(false)
    }
  }

  const handleManagementAction = async (action: string, params: any = {}) => {
    setLoading(action)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/pathrag/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...params,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      setResults(data)

      // Refresh stats after successful operations
      if (data.success && ['sync_all', 'sync_character'].includes(action)) {
        setTimeout(fetchManagementInfo, 1000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(null)
    }
  }

  const handleSyncAll = (force: boolean = false) => {
    const confirmMessage = force
      ? 'This will resync ALL characters to PathRAG, even if already synced. Continue?'
      : 'This will sync all unsynced characters to PathRAG. Continue?'

    if (window.confirm(confirmMessage)) {
      handleManagementAction('sync_all', { force })
    }
  }

  const handleSyncCharacter = () => {
    const characterId = window.prompt('Enter Character ID to sync:')
    if (characterId) {
      handleManagementAction('sync_character', { characterId })
    }
  }

  const handleDeleteEntity = () => {
    const entityName = window.prompt('Enter Entity Name to delete:')
    if (entityName) {
      const confirmMessage = `This will permanently delete the entity "${entityName}" and all its relationships from PathRAG. Continue?`
      if (window.confirm(confirmMessage)) {
        handleManagementAction('delete_entity', { entityName })
      }
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '8px', color: '#333' }}>PathRAG Knowledge Base Management</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Manage the PathRAG knowledge base, sync character data, and monitor system health.
        </p>
      </div>

      {/* Service Status */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: serviceHealth ? '#d4edda' : '#f8d7da',
          border: `1px solid ${serviceHealth ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '8px',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Service Status</h3>
        <div style={{ fontSize: '14px' }}>
          <div style={{ marginBottom: '4px' }}>
            <strong>PathRAG Service:</strong> {serviceHealth ? '✓ Online' : '✗ Offline'}
          </div>
          {stats && (
            <>
              <div>
                <strong>Documents:</strong> {stats.total_documents.toLocaleString()}
              </div>
              <div>
                <strong>Entities:</strong> {stats.total_entities.toLocaleString()}
              </div>
              <div>
                <strong>Relationships:</strong> {stats.total_relationships.toLocaleString()}
              </div>
              <div>
                <strong>Cache Hit Rate:</strong> {(stats.cache_hit_rate * 100).toFixed(1)}%
              </div>
            </>
          )}
        </div>
      </div>

      {/* Management Actions */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#333' }}>Management Actions</h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          <Button
            onClick={() => handleManagementAction('health_check')}
            disabled={loading !== null}
          >
            {loading === 'health_check' ? 'Checking...' : 'Check Health'}
          </Button>

          <Button onClick={() => handleManagementAction('get_stats')} disabled={loading !== null}>
            {loading === 'get_stats' ? 'Loading...' : 'Refresh Stats'}
          </Button>

          <Button
            onClick={() => handleSyncAll(false)}
            disabled={loading !== null || !serviceHealth}
          >
            {loading === 'sync_all' ? 'Syncing...' : 'Sync All Characters'}
          </Button>

          <Button onClick={() => handleSyncAll(true)} disabled={loading !== null || !serviceHealth}>
            {loading === 'sync_all' ? 'Syncing...' : 'Force Resync All'}
          </Button>

          <Button onClick={handleSyncCharacter} disabled={loading !== null || !serviceHealth}>
            {loading === 'sync_character' ? 'Syncing...' : 'Sync Character'}
          </Button>

          <Button onClick={handleDeleteEntity} disabled={loading !== null || !serviceHealth}>
            {loading === 'delete_entity' ? 'Deleting...' : 'Delete Entity'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
            marginBottom: '20px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px', color: '#333' }}>Operation Results</h3>

          <div
            style={{
              padding: '16px',
              backgroundColor: results.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${results.success ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              {results.success ? '✓ Success' : '✗ Failed'}: {results.message}
            </div>

            {results.data && (
              <div style={{ fontSize: '14px' }}>
                {results.data.totalCharacters && (
                  <div>
                    <strong>Summary:</strong> {results.data.successCount}/
                    {results.data.totalCharacters} characters synced
                  </div>
                )}

                {results.data.documentsInserted && (
                  <div>
                    <strong>Documents Inserted:</strong> {results.data.documentsInserted}
                  </div>
                )}

                {results.data.relationshipsDeleted && (
                  <div>
                    <strong>Relationships Deleted:</strong> {results.data.relationshipsDeleted}
                  </div>
                )}

                {results.data.timestamp && (
                  <div style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                    {new Date(results.data.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detailed Results */}
          {results.data?.results && (
            <details style={{ marginTop: '12px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
                View Detailed Results ({results.data.results.length} items)
              </summary>
              <div
                style={{
                  maxHeight: '300px',
                  overflow: 'auto',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa',
                }}
              >
                {results.data.results.map((result: SyncResult, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      borderBottom:
                        index < results.data.results.length - 1 ? '1px solid #dee2e6' : 'none',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>
                      {result.characterName} ({result.characterId})
                    </div>
                    <div
                      style={{
                        color:
                          result.status === 'success'
                            ? '#28a745'
                            : result.status === 'error'
                              ? '#dc3545'
                              : '#6c757d',
                      }}
                    >
                      Status: {result.status}
                      {result.documentsInserted && ` (${result.documentsInserted} docs)`}
                      {result.reason && ` - ${result.reason}`}
                      {result.error && ` - ${result.error}`}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ textAlign: 'center' }}>
        <Button onClick={fetchManagementInfo}>Refresh Management Info</Button>
      </div>
    </div>
  )
}
