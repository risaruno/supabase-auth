'use client'

import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'
import DemoAuth from '@/components/DemoAuth'
import { useState, useEffect } from 'react'

export default function Home() {
  const [showDemo, setShowDemo] = useState(false)
  const { user, loading } = useAuth()
  
  // Check if Supabase is properly configured
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Only show demo if URL contains demo keywords or is obviously fake
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('xyzcompany') || 
        supabaseUrl.includes('demo') ||
        supabaseKey.includes('demo')) {
      setShowDemo(true)
    }
  }, [])

  // Show demo if Supabase is not configured
  if (showDemo) {
    return <DemoAuth />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {user ? (
          <Dashboard />
        ) : (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Supabase Auth with JWT
              </h1>
              <p className="text-lg text-gray-600">
                Next.js authentication example with Supabase and JWT tokens featuring session timeout
              </p>
            </div>
            <LoginForm />
          </div>
        )}
      </div>
    </div>
  )
}
