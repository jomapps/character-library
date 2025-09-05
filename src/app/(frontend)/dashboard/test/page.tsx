'use client'

import { apiEndpoints, getAllCategories, getEndpointsByCategory } from '@/lib/api-endpoints'

export default function DashboardTestPage() {
  const categories = getAllCategories()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard Configuration Test
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            API Endpoints Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{apiEndpoints.length}</div>
              <div className="text-sm text-blue-800">Total Endpoints</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{categories.length}</div>
              <div className="text-sm text-green-800">Categories</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {apiEndpoints.filter(e => e.method === 'GET').length}
              </div>
              <div className="text-sm text-purple-800">GET Endpoints</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {categories.map((category) => {
            const categoryEndpoints = getEndpointsByCategory(category)
            return (
              <div key={category} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {category} ({categoryEndpoints.length} endpoints)
                </h3>
                <div className="space-y-3">
                  {categoryEndpoints.map((endpoint) => (
                    <div key={endpoint.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{endpoint.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          endpoint.method === 'PATCH' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {endpoint.method}
                        </span>
                      </div>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded block mb-2">
                        {endpoint.path}
                      </code>
                      <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
                      {endpoint.fields.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            Fields ({endpoint.fields.length}):
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {endpoint.fields.map((field) => (
                              <span
                                key={field.name}
                                className={`text-xs px-2 py-1 rounded ${
                                  field.required 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {field.name} ({field.type})
                                {field.required && ' *'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
