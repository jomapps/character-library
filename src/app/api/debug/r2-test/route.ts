/**
 * Debug endpoint to test Cloudflare R2 URL accessibility
 * GET /api/debug/r2-test?url=<encoded-url>
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testUrl = searchParams.get('url')
    
    if (!testUrl) {
      return NextResponse.json({
        error: 'Missing url parameter',
        usage: '/api/debug/r2-test?url=<encoded-url>'
      }, { status: 400 })
    }

    console.log(`Testing R2 URL accessibility: ${testUrl}`)

    // Test if the URL is accessible
    const response = await fetch(testUrl, {
      method: 'HEAD', // Use HEAD to avoid downloading the full image
      headers: {
        'User-Agent': 'Character-Library-Debug/1.0'
      }
    })

    const result = {
      url: testUrl,
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: new Date().toISOString(),
      r2Config: {
        publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
        bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT
      }
    }

    console.log(`R2 URL test result:`, result)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('R2 URL test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * POST endpoint to test multiple URLs at once
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls } = body

    if (!Array.isArray(urls)) {
      return NextResponse.json({
        error: 'Body must contain an array of URLs',
        example: { urls: ['https://media.rumbletv.com/test1', 'https://media.rumbletv.com/test2'] }
      }, { status: 400 })
    }

    console.log(`Testing ${urls.length} R2 URLs`)

    const results = await Promise.all(
      urls.map(async (url: string) => {
        try {
          const response = await fetch(url, {
            method: 'HEAD',
            headers: {
              'User-Agent': 'Character-Library-Debug/1.0'
            }
          })

          return {
            url,
            accessible: response.ok,
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length'),
            lastModified: response.headers.get('last-modified')
          }
        } catch (error) {
          return {
            url,
            accessible: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
    )

    const summary = {
      total: results.length,
      accessible: results.filter(r => r.accessible).length,
      notAccessible: results.filter(r => !r.accessible).length
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        results,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('R2 batch URL test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
