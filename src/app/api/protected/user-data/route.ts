import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get user info from headers (set by middleware)
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')

  return NextResponse.json({
    message: 'This is a protected route',
    user: {
      id: userId,
      email: userEmail
    },
    timestamp: new Date().toISOString(),
    data: {
      secretMessage: 'This data is only available to authenticated users!',
      serverTime: new Date().toLocaleString(),
      randomNumber: Math.floor(Math.random() * 1000)
    }
  })
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')
  
  try {
    const body = await request.json()
    
    return NextResponse.json({
      message: 'Data received successfully',
      user: {
        id: userId,
        email: userEmail
      },
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('Error parsing JSON:', err)
    return NextResponse.json(
      { error: 'Invalid JSON data' },
      { status: 400 }
    )
  }
}
