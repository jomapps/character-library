import { NextRequest, NextResponse } from 'next/server'

/**
 * Health check endpoint for Character Library service
 */
export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'ok',
      service: 'Character Library',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        service: 'Character Library',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
