import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 401 })
    }

    // Verify token
    const payload = verifyJWTToken(token)
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    return NextResponse.json({ 
      valid: true, 
      payload,
      message: 'Token is valid' 
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'JWT verification endpoint',
    usage: 'POST /api/verify-token with { token: "your-jwt-token" }'
  })
}
