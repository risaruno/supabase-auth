import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '1800000') // 30 minutes

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 })
    }

    const payload = {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (SESSION_TIMEOUT / 1000)
    }

    const token = jwt.sign(payload, JWT_SECRET)

    return NextResponse.json({ 
      token,
      expiresAt: payload.exp * 1000
    })

  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
