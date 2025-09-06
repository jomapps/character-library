import React from 'react'
import './globals.css'

export const metadata = {
  description: 'Character Library - AI-powered character management and image generation',
  title: 'Character Library',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
