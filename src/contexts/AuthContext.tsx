'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { isTokenExpired, getTokenExpirationTime } from '@/lib/jwt'

// Generate JWT token using server-side API
const generateJWTTokenAPI = async (userId: string, email: string): Promise<string> => {
  const response = await fetch('/api/generate-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, email }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate JWT token')
  }

  const data = await response.json()
  return data.token
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  jwtToken: string | null
  timeUntilExpiry: number | null
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [jwtToken, setJwtToken] = useState<string | null>(null)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null)

  const supabase = createClient()

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setJwtToken(null)
    setTimeUntilExpiry(null)
    localStorage.removeItem('jwt_token')
  }, [supabase.auth])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)
          
          // Generate JWT token with debugging
          console.log('Generating JWT token for user:', initialSession.user.id, initialSession.user.email)
          try {
            const token = await generateJWTTokenAPI(initialSession.user.id, initialSession.user.email!)
            console.log('JWT token generated successfully:', token.substring(0, 50) + '...')
            setJwtToken(token)
            localStorage.setItem('jwt_token', token)
          } catch (error) {
            console.error('Error generating JWT token:', error)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('Auth state changed - generating new JWT token')
          try {
            const token = await generateJWTTokenAPI(session.user.id, session.user.email!)
            console.log('New JWT token generated:', token.substring(0, 50) + '...')
            setJwtToken(token)
            localStorage.setItem('jwt_token', token)
          } catch (error) {
            console.error('Error generating JWT token on auth change:', error)
          }
        } else {
          console.log('No session - clearing JWT token')
          setJwtToken(null)
          localStorage.removeItem('jwt_token')
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // JWT token timeout management
  useEffect(() => {
    if (!jwtToken) {
      setTimeUntilExpiry(null)
      return
    }

    const updateTimeUntilExpiry = () => {
      const expirationTime = getTokenExpirationTime(jwtToken)
      if (expirationTime) {
        const timeLeft = expirationTime - Date.now()
        setTimeUntilExpiry(timeLeft > 0 ? timeLeft : 0)
        
        // Auto-logout if token expired
        if (timeLeft <= 0) {
          signOut()
        }
      }
    }

    // Update immediately
    updateTimeUntilExpiry()

    // Update every second
    const interval = setInterval(updateTimeUntilExpiry, 1000)

    return () => clearInterval(interval)
  }, [jwtToken, signOut])

  // Check for existing JWT token on mount - but don't rely on it for auth state
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token')
    if (storedToken && !isTokenExpired(storedToken)) {
      // For client-side, we'll trust the stored token if it's not expired
      // The server-side verification will happen when making API calls
      setJwtToken(storedToken)
    } else if (storedToken) {
      // Remove expired token
      localStorage.removeItem('jwt_token')
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const refreshToken = async () => {
    console.log('Refresh token called, user:', user?.id, user?.email)
    if (user?.id && user?.email) {
      try {
        const newToken = await generateJWTTokenAPI(user.id, user.email)
        console.log('New token generated on refresh:', newToken.substring(0, 50) + '...')
        setJwtToken(newToken)
        localStorage.setItem('jwt_token', newToken)
      } catch (error) {
        console.error('Error refreshing token:', error)
      }
    } else {
      console.error('Cannot refresh token: user data not available')
    }
  }

  const value = {
    user,
    session,
    loading,
    jwtToken,
    timeUntilExpiry,
    signIn,
    signUp,
    signOut,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
