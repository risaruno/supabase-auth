import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

const verifyJWTToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (err) {
    console.error('JWT verification failed:', err)
    return null
  }
}

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    if (!decoded || !decoded.exp) return true
    
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function middleware(request: NextRequest) {
  // Only run middleware on API routes that require authentication
  if (request.nextUrl.pathname.startsWith('/api/protected/')) {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    if (isTokenExpired(token)) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 401 }
      )
    }

    const payload = verifyJWTToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Add user info to headers for the API route to use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-email', payload.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/protected/:path*']
}
