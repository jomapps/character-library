import { ApiEndpoint } from './api-endpoints'

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  status: number
  headers: Record<string, string>
  duration: number
}

export interface ApiRequest {
  endpoint: ApiEndpoint
  data: Record<string, any>
  timestamp: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  }

  private buildUrl(endpoint: ApiEndpoint, data: Record<string, any>): string {
    let url = endpoint.path

    // Replace path parameters
    Object.entries(data).forEach(([key, value]) => {
      if (url.includes(`{${key}}`)) {
        url = url.replace(`{${key}}`, encodeURIComponent(String(value)))
        delete data[key]
      }
    })

    // Add query parameters for GET requests
    if (endpoint.method === 'GET' && Object.keys(data).length > 0) {
      const searchParams = new URLSearchParams()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`
      }
    }

    return `${this.baseUrl}${url}`
  }

  private prepareRequestBody(endpoint: ApiEndpoint, data: Record<string, any>): any {
    if (endpoint.method === 'GET') {
      return undefined
    }

    // Remove path parameters from body data
    const bodyData = { ...data }
    endpoint.fields.forEach(field => {
      if (endpoint.path.includes(`{${field.name}}`)) {
        delete bodyData[field.name]
      }
    })

    // Handle special cases
    if (Object.keys(bodyData).length === 0) {
      return undefined
    }

    // For endpoints that expect nested structure
    if (endpoint.id === 'characters-query') {
      const { query, responseType, topK, onlyContext, ...rest } = bodyData
      return {
        query,
        options: {
          responseType,
          topK,
          onlyContext,
          ...rest
        }
      }
    }

    if (endpoint.id === 'qa-run') {
      const { assetIds, masterReferenceAssetId, qualityThreshold, consistencyThreshold, strictMode } = bodyData
      return {
        assetIds: Array.isArray(assetIds) ? assetIds : [assetIds],
        masterReferenceAssetId,
        thresholds: {
          qualityThreshold,
          consistencyThreshold,
          strictMode
        }
      }
    }

    return bodyData
  }

  async executeRequest(endpoint: ApiEndpoint, data: Record<string, any>): Promise<ApiResponse> {
    const startTime = Date.now()
    
    try {
      const url = this.buildUrl(endpoint, { ...data })
      const body = this.prepareRequestBody(endpoint, data)

      console.log(`Making ${endpoint.method} request to:`, url)
      if (body) {
        console.log('Request body:', body)
      }

      const requestOptions: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (body !== undefined) {
        requestOptions.body = JSON.stringify(body)
      }

      const response = await fetch(url, requestOptions)
      const duration = Date.now() - startTime

      // Extract response headers
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      let responseData: any
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json()
        } catch (error) {
          responseData = { error: 'Failed to parse JSON response' }
        }
      } else {
        responseData = await response.text()
      }

      const apiResponse: ApiResponse = {
        success: response.ok,
        data: responseData,
        status: response.status,
        headers,
        duration,
      }

      if (!response.ok) {
        apiResponse.error = responseData?.error || responseData?.message || `HTTP ${response.status}: ${response.statusText}`
      }

      console.log('API Response:', apiResponse)
      return apiResponse

    } catch (error) {
      const duration = Date.now() - startTime
      console.error('API Request failed:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
        status: 0,
        headers: {},
        duration,
      }
    }
  }

  // Helper method to format request for display
  formatRequest(endpoint: ApiEndpoint, data: Record<string, any>): ApiRequest {
    return {
      endpoint,
      data,
      timestamp: new Date().toISOString(),
    }
  }

  // Helper method to get curl command equivalent
  getCurlCommand(endpoint: ApiEndpoint, data: Record<string, any>): string {
    const url = this.buildUrl(endpoint, { ...data })
    const body = this.prepareRequestBody(endpoint, data)

    let curl = `curl -X ${endpoint.method} "${url}"`
    
    if (body !== undefined) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body, null, 2)}'`
    }

    return curl
  }
}

export const apiClient = new ApiClient()
