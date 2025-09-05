'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Clock, 
  CheckCircle, 
  XCircle,
  Terminal,
  Code
} from 'lucide-react'
import { ApiResponse, ApiRequest } from '@/lib/api-client'

interface RequestResponseDisplayProps {
  request?: ApiRequest
  response?: ApiResponse
  curlCommand?: string
}

export function RequestResponseDisplay({ request, response, curlCommand }: RequestResponseDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['request', 'response'])
  )
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const formatJson = (obj: any): string => {
    return JSON.stringify(obj, null, 2)
  }

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400'
    if (status >= 400 && status < 500) return 'text-yellow-600 dark:text-yellow-400'
    if (status >= 500) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  if (!request && !response) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Request Made Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Select an endpoint and execute a request to see the results here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Request Section */}
      {request && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('request')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {expandedSections.has('request') ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Request
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                request.endpoint.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                request.endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                request.endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                request.endpoint.method === 'PATCH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {request.endpoint.method}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(request.timestamp).toLocaleTimeString()}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(formatJson(request.data), 'request')
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {copiedSection === 'request' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </button>

          {expandedSections.has('request') && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Endpoint
                  </h4>
                  <code className="block p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                    {request.endpoint.method} {request.endpoint.path}
                  </code>
                </div>

                {Object.keys(request.data).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Parameters
                    </h4>
                    <SyntaxHighlighter
                      language="json"
                      style={vscDarkPlus}
                      className="rounded text-sm"
                    >
                      {formatJson(request.data)}
                    </SyntaxHighlighter>
                  </div>
                )}

                {curlCommand && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        cURL Command
                      </h4>
                      <button
                        onClick={() => copyToClipboard(curlCommand, 'curl')}
                        className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {copiedSection === 'curl' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>Copy</span>
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language="bash"
                      style={vscDarkPlus}
                      className="rounded text-sm"
                    >
                      {curlCommand}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Response Section */}
      {response && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('response')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {expandedSections.has('response') ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Response
              </h3>
              {response.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${getStatusColor(response.status)}`}>
                {response.status}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{response.duration}ms</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(formatJson(response.data), 'response')
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {copiedSection === 'response' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </button>

          {expandedSections.has('response') && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-4">
                {response.error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                      Error
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {response.error}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Response Body
                  </h4>
                  <SyntaxHighlighter
                    language="json"
                    style={vscDarkPlus}
                    className="rounded text-sm"
                  >
                    {formatJson(response.data)}
                  </SyntaxHighlighter>
                </div>

                {Object.keys(response.headers).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Response Headers
                    </h4>
                    <SyntaxHighlighter
                      language="json"
                      style={vscDarkPlus}
                      className="rounded text-sm"
                    >
                      {formatJson(response.headers)}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
