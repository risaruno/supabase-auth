import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '1800000') // 30 minutes

export interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

export const generateJWTToken = (userId: string, email: string): string => {
  console.log('JWT_SECRET available:', !!JWT_SECRET)
  console.log('JWT_SECRET type:', typeof JWT_SECRET)
  console.log('JWT_SECRET value:', JWT_SECRET ? 'present' : 'missing')
  console.log('SESSION_TIMEOUT:', SESSION_TIMEOUT)
  
  // Ensure JWT_SECRET is a string
  const secret = String(JWT_SECRET)
  if (!secret || secret === 'undefined' || secret === 'null') {
    throw new Error('JWT_SECRET is not properly configured')
  }
  
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (SESSION_TIMEOUT / 1000)
  }

  console.log('JWT payload:', payload)
  
  try {
    const token = jwt.sign(payload, secret)
    console.log('JWT token generated successfully')
    return token
  } catch (error) {
    console.error('JWT sign error:', error)
    throw error
  }
}

export const verifyJWTToken = (token: string): JWTPayload | null => {
  try {
    // On client side, we can't access JWT_SECRET, so we'll just decode and check expiration
    if (typeof window !== 'undefined') {
      const decoded = jwt.decode(token) as JWTPayload
      if (!decoded || !decoded.exp) return null
      
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        return null
      }
      
      return decoded
    } else {
      // Server side verification with secret
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    }
  } catch (err) {
    console.error('JWT verification failed:', err)
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    if (!decoded || !decoded.exp) return true
    
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    return decoded?.exp ? decoded.exp * 1000 : null
  } catch (err) {
    console.error('Error decoding token:', err)
    return null
  }
}
