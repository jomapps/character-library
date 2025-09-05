'use client'

import { useState } from 'react'
import { ApiEndpoint, getEndpointById } from '@/lib/api-endpoints'
import { apiClient, ApiResponse, ApiRequest } from '@/lib/api-client'
import { DynamicForm } from './DynamicForm'
import { RequestResponseDisplay } from './RequestResponseDisplay'
import { History, FileText, Play } from 'lucide-react'

interface MainContentProps {
  selectedEndpoint: string | null
  endpoints: ApiEndpoint[]
  onRequestComplete: (request: ApiRequest, response: ApiResponse) => void
  requestHistory: any[]
}

export function MainContent({ 
  selectedEndpoint, 
  endpoints, 
  onRequestComplete, 
  requestHistory 
}: MainContentProps) {
  const [currentRequest, setCurrentRequest] = useState<ApiRequest | undefined>()
  const [currentResponse, setCurrentResponse] = useState<ApiResponse | undefined>()
  const [currentCurl, setCurrentCurl] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form')

  const endpoint = selectedEndpoint ? getEndpointById(selectedEndpoint) : null

  const handleFormSubmit = async (data: any) => {
    if (!endpoint) return

    setIsLoading(true)
    
    try {
      // Create request object
      const request = apiClient.formatRequest(endpoint, data)
      setCurrentRequest(request)

      // Generate curl command
      const curl = apiClient.getCurlCommand(endpoint, data)
      setCurrentCurl(curl)

      // Execute the request
      const response = await apiClient.executeRequest(endpoint, data)
      setCurrentResponse(response)

      // Notify parent component
      onRequestComplete(request, response)
    } catch (error) {
      console.error('Request failed:', error)
      setCurrentResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 0,
        headers: {},
        duration: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadHistoryItem = (historyItem: any) => {
    setCurrentRequest(historyItem)
    setCurrentResponse(historyItem.response)
    setCurrentCurl(apiClient.getCurlCommand(historyItem.endpoint, historyItem.request.data))
    setActiveTab('form')
  }

  if (!selectedEndpoint) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
            Welcome to the API Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Select an API endpoint from the sidebar to start testing. You can explore all available 
            endpoints, fill out forms with the required parameters, and see the responses in real-time.
          </p>
        </div>
      </div>
    )
  }

  if (!endpoint) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
            Endpoint Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            The selected endpoint could not be found. Please select a different endpoint.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
      {/* Content Header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {endpoint.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {endpoint.description}
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                endpoint.method === 'PATCH' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {endpoint.method}
              </span>
              <code className="px-2 py-1 text-sm bg-gray-100 rounded">
                {endpoint.path}
              </code>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex p-1 space-x-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'form'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Test API
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center px-3 py-1 space-x-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="h-4 w-4" />
              <span>History</span>
              {requestHistory.length > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full">
                  {requestHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'form' ? (
          <div className="flex flex-col h-full lg:flex-row">
            {/* Form Panel */}
            <div className="flex flex-col flex-1 overflow-hidden lg:w-1/2 lg:border-r border-gray-200">
              <div className="shrink-0 p-4 border-b border-gray-200 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Request Parameters
                </h3>
              </div>
              <div className="flex-1 p-4 overflow-y-auto sm:p-6">
                <DynamicForm
                  endpoint={endpoint}
                  onSubmit={handleFormSubmit}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Response Panel */}
            <div className="flex flex-col flex-1 overflow-hidden border-t lg:w-1/2 lg:border-t-0 border-gray-200">
              <div className="shrink-0 p-4 border-b border-gray-200 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Request & Response
                </h3>
              </div>
              <div className="flex-1 p-4 overflow-y-auto sm:p-6">
                <RequestResponseDisplay
                  request={currentRequest}
                  response={currentResponse}
                  curlCommand={currentCurl}
                />
              </div>
            </div>
          </div>
        ) : (
          /* History Panel */
          <div className="flex flex-col h-full overflow-hidden">
            <div className="shrink-0 p-4 border-b border-gray-200 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Request History
              </h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto sm:p-6">
              {requestHistory.length === 0 ? (
                <div className="py-12 text-center">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="mb-2 text-lg font-medium text-gray-900">
                    No History Yet
                  </h4>
                  <p className="text-gray-500">
                    Execute some API requests to see them appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requestHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => loadHistoryItem(item)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            item.request.endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                            item.request.endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            item.request.endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            item.request.endpoint.method === 'PATCH' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.request.endpoint.method}
                          </span>
                          <span className="font-medium text-gray-900">
                            {item.request.endpoint.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className={`${
                            item.response.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.response.status}
                          </span>
                          <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <code className="block text-xs text-gray-600">
                        {item.request.endpoint.path}
                      </code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
