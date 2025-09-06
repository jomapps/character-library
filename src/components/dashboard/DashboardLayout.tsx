'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, TestTube } from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'API Testing',
      href: '/dashboard',
      icon: TestTube,
      current: pathname === '/dashboard',
    },
    {
      name: 'Character Profile',
      href: '/dashboard/character-profile',
      icon: User,
      current: pathname.startsWith('/dashboard/character-profile'),
    },
  ]

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="shrink-0 bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-lg font-bold text-gray-900 truncate sm:text-xl">
                Character Library Dashboard
              </h1>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-6">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        item.current
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="hidden text-sm text-gray-500 sm:block">
              {pathname.startsWith('/dashboard/character-profile') ? 'Character Management' : 'API Testing Interface'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
