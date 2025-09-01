'use client'

import React, { useState, useEffect } from 'react'

interface DashboardStats {
  totalCharacters: number
  charactersWithMasterRef: number
  charactersWithCoreSet: number
  totalImages: number
  validatedImages: number
  averageQuality: number
  averageConsistency: number
}

export const CharacterLibraryDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch characters data
      const charactersResponse = await fetch('/api/characters?limit=1000')
      const charactersData = await charactersResponse.json()

      if (!charactersResponse.ok) {
        throw new Error('Failed to fetch characters data')
      }

      const characters = charactersData.docs || []
      
      // Calculate statistics
      const totalCharacters = characters.length
      const charactersWithMasterRef = characters.filter((c: any) => c.masterReferenceProcessed).length
      const charactersWithCoreSet = characters.filter((c: any) => c.coreSetGenerated).length
      
      let totalImages = 0
      let validatedImages = 0
      let totalQuality = 0
      let totalConsistency = 0
      let qualityCount = 0
      let consistencyCount = 0

      characters.forEach((character: any) => {
        if (character.imageGallery) {
          character.imageGallery.forEach((image: any) => {
            totalImages++
            
            if (image.dinoProcessingStatus === 'validation_success') {
              validatedImages++
            }
            
            if (image.qualityScore) {
              totalQuality += image.qualityScore
              qualityCount++
            }
            
            if (image.consistencyScore) {
              totalConsistency += image.consistencyScore
              consistencyCount++
            }
          })
        }
      })

      const dashboardStats: DashboardStats = {
        totalCharacters,
        charactersWithMasterRef,
        charactersWithCoreSet,
        totalImages,
        validatedImages,
        averageQuality: qualityCount > 0 ? totalQuality / qualityCount : 0,
        averageConsistency: consistencyCount > 0 ? totalConsistency / consistencyCount : 0,
      }

      setStats(dashboardStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#dc3545' }}>
        <strong>Error:</strong> {error}
        <button 
          onClick={fetchDashboardStats}
          style={{ marginLeft: '10px', padding: '4px 8px' }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!stats) {
    return <div style={{ padding: '20px' }}>No data available</div>
  }

  const masterRefProgress = stats.totalCharacters > 0 ? (stats.charactersWithMasterRef / stats.totalCharacters) * 100 : 0
  const coreSetProgress = stats.totalCharacters > 0 ? (stats.charactersWithCoreSet / stats.totalCharacters) * 100 : 0
  const validationProgress = stats.totalImages > 0 ? (stats.validatedImages / stats.totalImages) * 100 : 0

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '24px', color: '#333' }}>Character Library Dashboard</h2>
      
      {/* Overview Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#495057' }}>Characters</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
            {stats.totalCharacters}
          </div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>Total characters</div>
        </div>

        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#495057' }}>Images</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {stats.totalImages}
          </div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>Total images</div>
        </div>

        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#495057' }}>Quality</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fd7e14' }}>
            {stats.averageQuality.toFixed(1)}
          </div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>Average quality score</div>
        </div>

        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#495057' }}>Consistency</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1' }}>
            {stats.averageConsistency.toFixed(1)}
          </div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>Average consistency score</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#333' }}>Workflow Progress</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', color: '#495057' }}>Master References Processed</span>
            <span style={{ fontSize: '14px', color: '#6c757d' }}>
              {stats.charactersWithMasterRef}/{stats.totalCharacters} ({masterRefProgress.toFixed(1)}%)
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e9ecef', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${masterRefProgress}%`, 
              height: '100%', 
              backgroundColor: '#007bff',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', color: '#495057' }}>360° Core Sets Generated</span>
            <span style={{ fontSize: '14px', color: '#6c757d' }}>
              {stats.charactersWithCoreSet}/{stats.totalCharacters} ({coreSetProgress.toFixed(1)}%)
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e9ecef', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${coreSetProgress}%`, 
              height: '100%', 
              backgroundColor: '#28a745',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', color: '#495057' }}>Images Validated</span>
            <span style={{ fontSize: '14px', color: '#6c757d' }}>
              {stats.validatedImages}/{stats.totalImages} ({validationProgress.toFixed(1)}%)
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e9ecef', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${validationProgress}%`, 
              height: '100%', 
              backgroundColor: '#17a2b8',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 style={{ marginBottom: '16px', color: '#333' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchDashboardStats}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Refresh Dashboard
          </button>
          
          <button
            onClick={() => window.open('/admin/collections/characters', '_blank')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Manage Characters
          </button>
          
          <button
            onClick={() => window.open('/admin/collections/media', '_blank')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            View Media Library
          </button>
        </div>
      </div>
    </div>
  )
}
