#!/usr/bin/env node

/**
 * Character Library Integration Test Script
 *
 * Tests the Character Library integration to verify all components work correctly
 * when the Character Library service is deployed.
 */

import { fileURLToPath } from 'url'
import { dirname } from 'path'

const CHARACTER_LIBRARY_URL = process.env.CHARACTER_LIBRARY_API_URL || 'https://character.ft.tc'

async function testCharacterLibraryIntegration() {
  console.log('🧪 Testing Character Library Integration')
  console.log(`📡 Target URL: ${CHARACTER_LIBRARY_URL}`)
  console.log('=' .repeat(60))

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  }

  // Test 1: Health Check
  await runTest('Health Check', async () => {
    const response = await fetch(`${CHARACTER_LIBRARY_URL}/api/health`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    return { success: true, data }
  }, results)

  // Test 2: Create Novel Movie Character
  await runTest('Create Novel Movie Character', async () => {
    const characterData = {
      novelMovieProjectId: 'test-project-' + Date.now(),
      projectName: 'Test Movie Project',
      characterData: {
        name: 'Test Character',
        status: 'in_development',
        role: 'protagonist',
        age: 25,
        height: '5 feet 8 inches',
        eyeColor: 'blue',
        hairColor: 'brown',
        description: 'A brave and determined protagonist'
      },
      syncSettings: {
        autoSync: true,
        conflictResolution: 'novel-movie-wins'
      }
    }

    const response = await fetch(`${CHARACTER_LIBRARY_URL}/api/v1/characters/novel-movie`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(characterData)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.success || !data.characterId) {
      throw new Error('Character creation failed or missing characterId')
    }

    return { success: true, characterId: data.characterId, data }
  }, results)

  // Test 3: Character Query
  await runTest('Character Query', async () => {
    const queryData = {
      query: 'Tell me about characters in the database',
      options: {
        responseType: 'Multiple Paragraphs',
        topK: 10
      }
    }

    const response = await fetch(`${CHARACTER_LIBRARY_URL}/api/v1/characters/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryData)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error('Query failed: ' + (data.error || 'Unknown error'))
    }

    return { success: true, data }
  }, results)

  // Test 4: Get Characters List
  await runTest('Get Characters List', async () => {
    const response = await fetch(`${CHARACTER_LIBRARY_URL}/api/v1/characters?limit=5`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return { success: true, count: data.docs?.length || 0, data }
  }, results)

  // Test 5: Project Consistency Validation
  await runTest('Project Consistency Validation', async () => {
    const validationData = {
      projectId: 'test-project-' + Date.now(),
      includeVisualValidation: true,
      includeNarrativeValidation: true,
      includeRelationshipValidation: true,
      consistencyThreshold: 85,
      qualityThreshold: 80
    }

    const response = await fetch(`${CHARACTER_LIBRARY_URL}/api/v1/characters/validate-project-consistency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validationData)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error('Validation failed: ' + (data.error || 'Unknown error'))
    }

    return { success: true, data }
  }, results)

  // Print Results
  console.log('\n' + '=' .repeat(60))
  console.log('📊 TEST RESULTS')
  console.log('=' .repeat(60))
  console.log(`Total Tests: ${results.total}`)
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`)

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:')
    results.tests
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`  • ${test.name}: ${test.error}`)
      })
  }

  if (results.passed === results.total) {
    console.log('\n🎉 All tests passed! Character Library integration is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Check the Character Library service deployment.')
  }

  return results.passed === results.total
}

async function runTest(name, testFn, results) {
  results.total++
  console.log(`🧪 ${name}...`)

  try {
    const result = await testFn()
    results.passed++
    results.tests.push({ name, success: true, result })
    console.log(`  ✅ PASSED`)
    
    // Log relevant data
    if (result.characterId) {
      console.log(`     Character ID: ${result.characterId}`)
    }
    if (result.count !== undefined) {
      console.log(`     Characters found: ${result.count}`)
    }
  } catch (error) {
    results.failed++
    results.tests.push({ name, success: false, error: error.message })
    console.log(`  ❌ FAILED: ${error.message}`)
  }
}

// Run tests if called directly
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

if (import.meta.url === `file://${process.argv[1]}`) {
  testCharacterLibraryIntegration()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('Test runner error:', error)
      process.exit(1)
    })
}

export { testCharacterLibraryIntegration }
