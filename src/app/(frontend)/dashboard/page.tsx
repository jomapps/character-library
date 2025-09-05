'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MainContent } from '@/components/dashboard/MainContent'
import { apiEndpoints } from '@/lib/api-endpoints'

export default function DashboardPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [requestHistory, setRequestHistory] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleEndpointSelect = (endpointId: string) => {
    setSelectedEndpoint(endpointId)
  }

  const handleRequestComplete = (request: any, response: any) => {
    setRequestHistory(prev => [
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        endpoint: selectedEndpoint,
        request,
        response,
      },
      ...prev.slice(0, 9) // Keep last 10 requests
    ])
  }

  return (
    <DashboardLayout>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-md shadow-lg lg:hidden hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {sidebarOpen ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600" />
        )}
      </button>

      <Sidebar
        endpoints={apiEndpoints}
        selectedEndpoint={selectedEndpoint}
        onEndpointSelect={handleEndpointSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <MainContent
        selectedEndpoint={selectedEndpoint}
        endpoints={apiEndpoints}
        onRequestComplete={handleRequestComplete}
        requestHistory={requestHistory}
      />
    </DashboardLayout>
  )
}
