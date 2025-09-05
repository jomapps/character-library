'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Database, Search, Settings, Image, FileText } from 'lucide-react'
import { ApiEndpoint, getAllCategories, getEndpointsByCategory } from '@/lib/api-endpoints'

interface SidebarProps {
  endpoints: ApiEndpoint[]
  selectedEndpoint: string | null
  onEndpointSelect: (endpointId: string) => void
  isOpen: boolean
  onClose: () => void
}

const categoryIcons: Record<string, any> = {
  'Character Management': Database,
  'Character Query': Search,
  'PathRAG Management': Settings,
  'Quality Assurance': FileText,
  'Media Management': Image,
}

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  PATCH: 'bg-orange-100 text-orange-800',
  DELETE: 'bg-red-100 text-red-800',
}

export function Sidebar({ endpoints, selectedEndpoint, onEndpointSelect, isOpen, onClose }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(getAllCategories())
  )

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const categories = getAllCategories()

  const handleEndpointSelect = (endpointId: string) => {
    onEndpointSelect(endpointId)
    onClose() // Close sidebar on mobile after selection
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="shrink-0 p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            API Endpoints
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {endpoints.length} endpoints available
          </p>
        </div>

        {/* Endpoints List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
          {categories.map((category) => {
            const categoryEndpoints = getEndpointsByCategory(category)
            const isExpanded = expandedCategories.has(category)
            const IconComponent = categoryIcons[category] || Database

            return (
              <div key={category} className="mb-2">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {category}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {categoryEndpoints.length}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>

                {/* Category Endpoints */}
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {categoryEndpoints.map((endpoint) => (
                      <button
                        key={endpoint.id}
                        onClick={() => handleEndpointSelect(endpoint.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedEndpoint === endpoint.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {endpoint.name}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${methodColors[endpoint.method]}`}>
                            {endpoint.method}
                          </span>
                        </div>
                        <div className="mb-1 text-xs text-gray-500">
                          {endpoint.path}
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {endpoint.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

        {/* Sidebar Footer */}
        <div className="shrink-0 p-4 border-t border-gray-200">
          <div className="text-xs text-center text-gray-500">
            Character Library API v1.0
          </div>
        </div>
      </div>
    </>
  )
}
