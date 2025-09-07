/**
 * Character Library Service Client
 * 
 * This client handles integration with the external Character Library service
 * for Novel Movie character development workflow.
 */

export interface CharacterLibraryConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  qualityThreshold: number
  consistencyThreshold: number
  defaultStyle: string
  maxRetries: number
}

export interface NovelMovieCharacterData {
  name: string
  status?: string
  role?: string
  archetype?: string
  biography?: string
  personality?: string
  motivations?: string
  backstory?: string
  age?: number
  height?: string
  eyeColor?: string
  hairColor?: string
  description?: string
  voiceDescription?: string
  style?: string
  patterns?: string[]
  vocabulary?: string
  relationships?: any[]
}

export interface SmartImageRequest {
  sceneContext?: string
  sceneType?: 'dialogue' | 'action' | 'emotional' | 'establishing'
  additionalCharacters?: string[]
  environmentContext?: string
  mood?: string
  lightingStyle?: string
  style?: string
  referenceImageAssetId?: string
}

export interface CharacterLibraryResponse {
  success: boolean
  data?: any
  error?: string
  characterId?: string
  status?: string
}

export const CHARACTER_LIBRARY_CONFIG: CharacterLibraryConfig = {
  baseUrl: process.env.CHARACTER_LIBRARY_API_URL || 'https://character.ft.tc',
  timeout: parseInt(process.env.CHARACTER_LIBRARY_TIMEOUT || '60000'),
  retryAttempts: parseInt(process.env.CHARACTER_LIBRARY_RETRY_ATTEMPTS || '3'),
  qualityThreshold: 70,
  consistencyThreshold: 85,
  defaultStyle: 'character_production',
  maxRetries: 5
}

export class CharacterLibraryClient {
  private config: CharacterLibraryConfig
  private retryAttempts: number

  constructor(config?: Partial<CharacterLibraryConfig>) {
    this.config = { ...CHARACTER_LIBRARY_CONFIG, ...config }
    this.retryAttempts = this.config.retryAttempts
  }

  /**
   * Check if Character Library service is available
   */
  async checkHealth(): Promise<{ isHealthy: boolean; error?: string }> {
    try {
      const response = await this.makeRequest('GET', '/api/health')
      return { isHealthy: response.success || response.status === 'ok' }
    } catch (error) {
      return { 
        isHealthy: false, 
        error: error instanceof Error ? error.message : 'Health check failed' 
      }
    }
  }

  /**
   * Create character in Character Library with Novel Movie integration
   */
  async createCharacter(
    characterData: NovelMovieCharacterData,
    projectId: string,
    projectName?: string
  ): Promise<CharacterLibraryResponse> {
    try {
      const response = await this.makeRequest('POST', '/api/v1/characters/novel-movie', {
        novelMovieProjectId: projectId,
        projectName,
        characterData,
        syncSettings: {
          autoSync: true,
          conflictResolution: 'novel-movie-wins'
        }
      })

      return {
        success: true,
        characterId: response.characterId || response.character?.id,
        status: response.syncStatus || 'created',
        data: response
      }
    } catch (error) {
      console.error('Character Library integration failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create character'
      }
    }
  }

  /**
   * Generate smart image with scene context
   */
  async generateSmartImage(
    characterId: string,
    request: SmartImageRequest
  ): Promise<CharacterLibraryResponse> {
    try {
      const response = await this.makeRequest(
        'POST', 
        `/api/v1/characters/${characterId}/generate-scene-image`,
        request
      )

      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate smart image'
      }
    }
  }

  /**
   * Generate initial master reference image
   */
  async generateInitialImage(
    characterId: string,
    prompt: string
  ): Promise<CharacterLibraryResponse> {
    try {
      const response = await this.makeRequest(
        'POST',
        `/api/v1/characters/${characterId}/generate-initial-image`,
        { prompt, style: this.config.defaultStyle }
      )

      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate initial image'
      }
    }
  }

  /**
   * Generate 360° core reference set
   */
  async generateCoreSet(characterId: string): Promise<CharacterLibraryResponse> {
    try {
      const response = await this.makeRequest(
        'POST',
        `/api/v1/characters/${characterId}/generate-core-set`,
        { style: this.config.defaultStyle }
      )

      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate core set'
      }
    }
  }

  /**
   * Query characters using natural language
   */
  async queryCharacters(query: string): Promise<CharacterLibraryResponse> {
    try {
      const response = await this.makeRequest('POST', '/api/v1/characters/query', {
        query,
        options: {
          responseType: 'Multiple Paragraphs',
          topK: 20
        }
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query characters'
      }
    }
  }

  /**
   * Validate project consistency
   */
  async validateProjectConsistency(projectId: string): Promise<CharacterLibraryResponse> {
    try {
      const response = await this.makeRequest(
        'POST',
        '/api/v1/characters/validate-project-consistency',
        {
          projectId,
          includeVisualValidation: true,
          includeNarrativeValidation: true,
          includeRelationshipValidation: true,
          consistencyThreshold: this.config.consistencyThreshold,
          qualityThreshold: this.config.qualityThreshold
        }
      )

      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate project consistency'
      }
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any
  ): Promise<any> {
    const url = `${this.config.baseUrl}${path}`
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(this.config.timeout),
        }

        if (data && method !== 'GET') {
          options.body = JSON.stringify(data)
        }

        const response = await fetch(url, options)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        console.warn(`Character Library request attempt ${attempt} failed:`, error)
        
        if (attempt === this.retryAttempts) {
          throw error
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        )
      }
    }
  }

  /**
   * Map Novel Movie character data to Character Library format
   */
  mapToCharacterLibraryFormat(character: any): NovelMovieCharacterData {
    return {
      name: character.name,
      status: character.status || 'in_development',
      role: character.role,
      archetype: character.archetype,
      biography: character.characterDevelopment?.biography,
      personality: character.characterDevelopment?.personality,
      motivations: character.characterDevelopment?.motivations,
      backstory: character.characterDevelopment?.backstory,
      age: character.physicalDescription?.age,
      height: character.physicalDescription?.height,
      eyeColor: character.physicalDescription?.eyeColor,
      hairColor: character.physicalDescription?.hairColor,
      description: character.physicalDescription?.description,
      voiceDescription: character.dialogueVoice?.voiceDescription,
      style: character.dialogueVoice?.style,
      patterns: character.dialogueVoice?.patterns,
      vocabulary: character.dialogueVoice?.vocabulary,
      relationships: character.relationships || []
    }
  }
}

// Export singleton instance
export const characterLibraryClient = new CharacterLibraryClient()

// Health check utility
export async function checkCharacterLibraryHealth(): Promise<{ isHealthy: boolean; error?: string }> {
  return characterLibraryClient.checkHealth()
}
