/**
 * PathRAG Service Integration
 * 
 * This service manages all interactions with the PathRAG knowledge base
 * for character persona management and natural language querying.
 */

export interface PathRAGInsertResponse {
  message: string
  document_count: number
  timestamp: string
}

export interface PathRAGQueryResponse {
  query: string
  result: string
  params: {
    mode: string
    top_k: number
  }
  timestamp: string
}

export interface PathRAGHealthResponse {
  status: string
  message: string
  arangodb_status: string
  timestamp: string
}

export interface PathRAGStatsResponse {
  total_documents: number
  total_entities: number
  total_relationships: number
  cache_hit_rate: number
  timestamp: string
}

export interface CharacterKnowledgeDocument {
  characterId: string
  characterName: string
  content: string
  documentType: 'persona' | 'biography' | 'relationships' | 'skills' | 'physical' | 'complete_profile'
  lastUpdated: string
}

export class PathRAGService {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.PATHRAG_SERVICE_URL || 'http://localhost:5000'
    this.apiKey = process.env.PATHRAG_API_KEY || ''
    
    // PathRAG service might not require API key based on the documentation
    if (!this.baseUrl) {
      console.warn('PATHRAG_SERVICE_URL not set - PathRAG service will not function')
    }
  }

  /**
   * Check PathRAG service health
   */
  async checkHealth(): Promise<{ healthy: boolean; details?: PathRAGHealthResponse; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`)
      }

      const data: PathRAGHealthResponse = await response.json()
      
      return {
        healthy: data.status === 'healthy' && data.arangodb_status === 'connected',
        details: data,
      }
    } catch (error) {
      console.error('PathRAG health check failed:', error)
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown health check error',
      }
    }
  }

  /**
   * Insert character documents into PathRAG knowledge base
   */
  async insertCharacterDocuments(documents: string | string[]): Promise<{
    success: boolean
    documentCount?: number
    error?: string
  }> {
    try {
      console.log(`Inserting ${Array.isArray(documents) ? documents.length : 1} document(s) into PathRAG`)

      const response = await fetch(`${this.baseUrl}/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents: documents,
        }),
      })

      if (!response.ok) {
        throw new Error(`PathRAG insert failed: ${response.status} ${response.statusText}`)
      }

      const data: PathRAGInsertResponse = await response.json()
      
      console.log(`✓ Successfully inserted ${data.document_count} documents into PathRAG`)
      
      return {
        success: true,
        documentCount: data.document_count,
      }
    } catch (error) {
      console.error('PathRAG document insertion failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown insertion error',
      }
    }
  }

  /**
   * Query PathRAG knowledge base with natural language
   */
  async queryCharacterKnowledge(
    query: string,
    options: {
      mode?: 'hybrid'
      responseType?: string
      topK?: number
      onlyContext?: boolean
      maxTokens?: {
        textUnit?: number
        globalContext?: number
        localContext?: number
      }
    } = {}
  ): Promise<{
    success: boolean
    result?: string
    query?: string
    error?: string
  }> {
    try {
      console.log(`Querying PathRAG: "${query.substring(0, 100)}..."`)

      const params = {
        mode: options.mode || 'hybrid',
        only_need_context: options.onlyContext || false,
        response_type: options.responseType || 'Multiple Paragraphs',
        top_k: options.topK || 40,
        ...(options.maxTokens && {
          max_token_for_text_unit: options.maxTokens.textUnit || 4000,
          max_token_for_global_context: options.maxTokens.globalContext || 3000,
          max_token_for_local_context: options.maxTokens.localContext || 5000,
        }),
      }

      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          params,
        }),
      })

      if (!response.ok) {
        throw new Error(`PathRAG query failed: ${response.status} ${response.statusText}`)
      }

      const data: PathRAGQueryResponse = await response.json()
      
      console.log(`✓ PathRAG query completed successfully`)
      
      return {
        success: true,
        result: data.result,
        query: data.query,
      }
    } catch (error) {
      console.error('PathRAG query failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown query error',
      }
    }
  }

  /**
   * Delete entity from PathRAG knowledge base
   */
  async deleteEntity(entityName: string): Promise<{
    success: boolean
    relationshipsDeleted?: number
    error?: string
  }> {
    try {
      console.log(`Deleting entity from PathRAG: ${entityName}`)

      const response = await fetch(`${this.baseUrl}/delete_entity`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_name: entityName,
        }),
      })

      if (!response.ok) {
        throw new Error(`PathRAG entity deletion failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      console.log(`✓ Successfully deleted entity: ${entityName}`)
      
      return {
        success: true,
        relationshipsDeleted: data.relationships_deleted,
      }
    } catch (error) {
      console.error('PathRAG entity deletion failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deletion error',
      }
    }
  }

  /**
   * Get PathRAG system statistics
   */
  async getStats(): Promise<{
    success: boolean
    stats?: PathRAGStatsResponse
    error?: string
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`)
      
      if (!response.ok) {
        throw new Error(`PathRAG stats failed: ${response.status} ${response.statusText}`)
      }

      const data: PathRAGStatsResponse = await response.json()
      
      return {
        success: true,
        stats: data,
      }
    } catch (error) {
      console.error('PathRAG stats failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown stats error',
      }
    }
  }

  /**
   * Sync character to PathRAG knowledge base
   */
  async syncCharacterToKnowledgeBase(character: any): Promise<{
    success: boolean
    documentsInserted?: number
    error?: string
  }> {
    try {
      console.log(`Syncing character to PathRAG: ${character.name}`)

      // Build comprehensive character documents
      const documents = this.buildCharacterDocuments(character)
      
      if (documents.length === 0) {
        return {
          success: true,
          documentsInserted: 0,
        }
      }

      // Insert documents into PathRAG
      const result = await this.insertCharacterDocuments(documents)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to insert character documents')
      }

      console.log(`✓ Successfully synced character ${character.name} to PathRAG`)
      
      return {
        success: true,
        documentsInserted: result.documentCount,
      }
    } catch (error) {
      console.error(`Character sync failed for ${character.name}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error',
      }
    }
  }

  /**
   * Build structured documents from character data
   */
  private buildCharacterDocuments(character: any): string[] {
    const documents: string[] = []
    const characterId = character.characterId || character.id
    const characterName = character.name

    if (!characterName) {
      return documents
    }

    // Complete character profile document
    const profileParts: string[] = []
    profileParts.push(`Character: ${characterName}`)
    
    if (character.age) profileParts.push(`Age: ${character.age}`)
    if (character.height) profileParts.push(`Height: ${character.height}`)
    if (character.weight) profileParts.push(`Weight: ${character.weight}`)
    if (character.eyeColor) profileParts.push(`Eye Color: ${character.eyeColor}`)
    if (character.hairColor) profileParts.push(`Hair Color: ${character.hairColor}`)

    // Add rich text content
    if (character.biography) {
      const bioText = this.extractTextFromRichText(character.biography)
      if (bioText) profileParts.push(`Biography: ${bioText}`)
    }

    if (character.personality) {
      const personalityText = this.extractTextFromRichText(character.personality)
      if (personalityText) profileParts.push(`Personality: ${personalityText}`)
    }

    if (character.motivations) {
      const motivationsText = this.extractTextFromRichText(character.motivations)
      if (motivationsText) profileParts.push(`Motivations: ${motivationsText}`)
    }

    if (character.relationships) {
      const relationshipsText = this.extractTextFromRichText(character.relationships)
      if (relationshipsText) profileParts.push(`Relationships: ${relationshipsText}`)
    }

    if (character.backstory) {
      const backstoryText = this.extractTextFromRichText(character.backstory)
      if (backstoryText) profileParts.push(`Backstory: ${backstoryText}`)
    }

    if (character.physicalDescription) {
      const physicalText = this.extractTextFromRichText(character.physicalDescription)
      if (physicalText) profileParts.push(`Physical Description: ${physicalText}`)
    }

    if (character.voiceDescription) {
      const voiceText = this.extractTextFromRichText(character.voiceDescription)
      if (voiceText) profileParts.push(`Voice & Speech: ${voiceText}`)
    }

    if (character.clothing) {
      const clothingText = this.extractTextFromRichText(character.clothing)
      if (clothingText) profileParts.push(`Clothing & Style: ${clothingText}`)
    }

    // Add skills
    if (character.skills && character.skills.length > 0) {
      const skillsText = character.skills
        .map((skill: any) => `${skill.skill} (${skill.level || 'unknown level'})${skill.description ? ': ' + skill.description : ''}`)
        .join(', ')
      profileParts.push(`Skills: ${skillsText}`)
    }

    if (profileParts.length > 1) { // More than just the name
      documents.push(profileParts.join('. '))
    }

    return documents
  }

  /**
   * Extract plain text from Payload rich text field
   */
  private extractTextFromRichText(richText: any): string {
    if (!richText) return ''
    
    if (typeof richText === 'string') {
      return richText
    }

    // Handle Lexical rich text format
    if (richText.root && richText.root.children) {
      return this.extractTextFromLexicalNodes(richText.root.children)
    }

    return ''
  }

  /**
   * Extract text from Lexical nodes recursively
   */
  private extractTextFromLexicalNodes(nodes: any[]): string {
    let text = ''
    
    for (const node of nodes) {
      if (node.type === 'text') {
        text += node.text || ''
      } else if (node.children) {
        text += this.extractTextFromLexicalNodes(node.children)
      }
      
      // Add space between paragraphs
      if (node.type === 'paragraph') {
        text += ' '
      }
    }
    
    return text.trim()
  }

  /**
   * Get service configuration
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
      isConfigured: !!this.baseUrl,
    }
  }
}

// Export singleton instance
export const pathragService = new PathRAGService()
