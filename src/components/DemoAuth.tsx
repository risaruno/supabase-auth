'use client'

import { useState } from 'react'
import { generateJWTToken } from '@/lib/jwt'

export default function DemoAuth() {
  const [jwtToken, setJwtToken] = useState<string | null>(null)
  const [userData, setUserData] = useState<{ id: string; email: string } | null>(null)

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@example.com'
    }
    
    const token = generateJWTToken(demoUser.id, demoUser.email)
    setJwtToken(token)
    setUserData(demoUser)
    localStorage.setItem('jwt_token', token)
  }

  const handleDemoLogout = () => {
    setJwtToken(null)
    setUserData(null)
    localStorage.removeItem('jwt_token')
  }

  const copyTokenToClipboard = () => {
    if (jwtToken) {
      navigator.clipboard.writeText(jwtToken)
      alert('JWT Token copied to clipboard!')
    }
  }

  const testProtectedApi = async () => {
    if (!jwtToken) {
      alert('Please login first')
      return
    }

    try {
      const response = await fetch('/api/protected/user-data', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      alert(`API Response: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      alert(`API Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            JWT Demo - Supabase Auth Project
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Demo version showing JWT functionality without Supabase setup
          </p>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Setup Required:</p>
            <p className="text-sm">To use full Supabase authentication, please set up your Supabase project and update the environment variables in .env.local</p>
          </div>
        </div>

        {!userData ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-center">Demo Login</h2>
              <button
                onClick={handleDemoLogin}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Login with Demo User
              </button>
              <p className="text-sm text-gray-600 mt-3 text-center">
                This will create a demo JWT token for testing
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* User Info */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Demo Dashboard</h2>
                <button
                  onClick={handleDemoLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">User Information</h3>
                  <p><span className="font-medium">Email:</span> {userData.email}</p>
                  <p><span className="font-medium">User ID:</span> {userData.id}</p>
                  <p><span className="font-medium">Status:</span> <span className="text-green-600">Demo User</span></p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">JWT Token Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={copyTokenToClipboard}
                      className="w-full bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 text-sm"
                    >
                      Copy JWT Token
                    </button>
                    <button
                      onClick={testProtectedApi}
                      className="w-full bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 text-sm"
                    >
                      Test Protected API
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* JWT Token Display */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">JWT Token</h3>
              <div className="bg-gray-100 p-3 rounded border">
                <code className="text-xs text-gray-700 break-all">
                  {jwtToken}
                </code>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                This JWT token contains your user information and can be used to authenticate API requests.
              </p>
            </div>

            {/* Setup Instructions */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md mt-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">Setup Instructions</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>1. Create a Supabase project:</strong></p>
                <p className="ml-4">• Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></p>
                <p className="ml-4">• Create a new project</p>
                <p className="ml-4">• Get your project URL and API keys</p>
                
                <p className="pt-2"><strong>2. Update .env.local:</strong></p>
                <p className="ml-4">• Replace NEXT_PUBLIC_SUPABASE_URL with your project URL</p>
                <p className="ml-4">• Replace NEXT_PUBLIC_SUPABASE_ANON_KEY with your anon key</p>
                <p className="ml-4">• Replace SUPABASE_SERVICE_ROLE_KEY with your service role key</p>
                
                <p className="pt-2"><strong>3. Restart the development server</strong></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
