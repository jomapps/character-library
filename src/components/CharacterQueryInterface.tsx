'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@payloadcms/ui'

interface QueryResult {
  query: string
  result: string
  timestamp: string
}

interface PathRAGStats {
  total_documents: number
  total_entities: number
  total_relationships: number
  cache_hit_rate: number
}

export const CharacterQueryInterface: React.FC = () => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<QueryResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<PathRAGStats | null>(null)
  const [serviceHealth, setServiceHealth] = useState<boolean | null>(null)

  useEffect(() => {
    checkServiceHealth()
    fetchStats()
  }, [])

  const checkServiceHealth = async () => {
    try {
      const response = await fetch('/api/characters/query?action=health')
      const data = await response.json()
      setServiceHealth(data.data?.healthy || false)
    } catch (err) {
      setServiceHealth(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/characters/query?action=stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data.pathragStats)
      }
    } catch (err) {
      console.error('Failed to fetch PathRAG stats:', err)
    }
  }

  const handleQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/characters/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          options: {
            responseType: 'Multiple Paragraphs',
            topK: 40,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      if (data.success) {
        const newResult: QueryResult = {
          query: data.data.query,
          result: data.data.result,
          timestamp: data.data.timestamp,
        }
        setResults((prev) => [newResult, ...prev])
        setQuery('') // Clear the input
      } else {
        throw new Error(data.error || 'Query failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleQuery()
    }
  }

  const exampleQueries = [
    'Tell me about the character named Jax',
    'What characters have combat skills?',
    'Describe characters with blue eyes',
    'Which characters are motivated by revenge?',
    'Tell me about warrior characters',
  ]

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '8px', color: '#333' }}>Character Knowledge Query</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Ask natural language questions about your characters using the PathRAG knowledge base.
        </p>
      </div>

      {/* Service Status */}
      <div
        style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: serviceHealth ? '#d4edda' : '#f8d7da',
          border: `1px solid ${serviceHealth ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        <strong>PathRAG Service:</strong> {serviceHealth ? '✓ Online' : '✗ Offline'}
        {stats && (
          <span style={{ marginLeft: '16px', color: '#666' }}>
            {stats.total_documents} documents, {stats.total_entities} entities,{' '}
            {stats.total_relationships} relationships
          </span>
        )}
      </div>

      {/* Query Input */}
      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your characters... (e.g., 'Tell me about characters with magical abilities')"
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            resize: 'vertical',
          }}
          disabled={loading || !serviceHealth}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
          }}
        >
          <Button onClick={handleQuery} disabled={loading || !serviceHealth || !query.trim()}>
            {loading ? 'Querying...' : 'Ask Question'}
          </Button>

          <div style={{ fontSize: '12px', color: '#666' }}>
            Press Enter to submit, Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* Example Queries */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ marginBottom: '8px', color: '#333', fontSize: '14px' }}>Example Queries:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleQuery(example)}
              disabled={loading}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#495057',
              }}
            >
              {example}
            </button>
          ))}
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

      {/* Results */}
      <div>
        <h3 style={{ marginBottom: '16px', color: '#333' }}>Query Results</h3>

        {results.length === 0 ? (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
            }}
          >
            No queries yet. Ask a question about your characters to get started!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                }}
              >
                <div
                  style={{
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#495057',
                    fontSize: '14px',
                  }}
                >
                  Q: {result.query}
                </div>

                <div
                  style={{
                    marginBottom: '8px',
                    lineHeight: '1.5',
                    color: '#333',
                  }}
                >
                  {result.result}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: '#6c757d',
                    textAlign: 'right',
                  }}
                >
                  {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Stats Button */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Button
          onClick={() => {
            checkServiceHealth()
            fetchStats()
          }}
        >
          Refresh Service Status
        </Button>
      </div>
    </div>
  )
}
