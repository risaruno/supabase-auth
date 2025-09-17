'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import ProtectedApiTest from './ProtectedApiTest'

export default function Dashboard() {
  const { user, jwtToken, timeUntilExpiry, signOut, refreshToken } = useAuth()
  const [timeDisplay, setTimeDisplay] = useState('')

  useEffect(() => {
    if (timeUntilExpiry) {
      const minutes = Math.floor(timeUntilExpiry / 60000)
      const seconds = Math.floor((timeUntilExpiry % 60000) / 1000)
      setTimeDisplay(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    } else {
      setTimeDisplay('Expired')
    }
  }, [timeUntilExpiry])

  const handleRefreshToken = async () => {
    await refreshToken()
  }

  const copyTokenToClipboard = () => {
    if (jwtToken) {
      navigator.clipboard.writeText(jwtToken)
      alert('JWT Token copied to clipboard!')
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={signOut}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Sign Out
        </button>
      </div>

      {/* User Information */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">User Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">User ID:</span> {user.id}</p>
            <p><span className="font-medium">Created:</span> {new Date(user.created_at).toLocaleString()}</p>
            <p><span className="font-medium">Last Sign In:</span> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Session Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                timeUntilExpiry && timeUntilExpiry > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {timeUntilExpiry && timeUntilExpiry > 0 ? 'Active' : 'Expired'}
              </span>
            </p>
            <p><span className="font-medium">Time Until Expiry:</span> 
              <span className={`ml-2 font-mono ${
                timeUntilExpiry && timeUntilExpiry > 300000 
                  ? 'text-green-600' 
                  : timeUntilExpiry && timeUntilExpiry > 60000 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
              }`}>
                {timeDisplay}
              </span>
            </p>
            <div className="pt-2">
              <button
                onClick={handleRefreshToken}
                className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                Refresh Token
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* JWT Token Display */}
      <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">JWT Token</h2>
          <button
            onClick={copyTokenToClipboard}
            className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
          >
            Copy Token
          </button>
        </div>
        <div className="bg-white p-3 rounded border">
          <code className="text-xs text-gray-700 break-all">
            {jwtToken || 'No token available'}
          </code>
        </div>
        {jwtToken && (
          <div className="mt-3 text-sm text-gray-600">
            <p>This JWT token contains your user information and expires automatically after the configured timeout period.</p>
            <p className="mt-1">Use this token to authenticate API requests to your backend services.</p>
          </div>
        )}
      </div>

      {/* Auto-logout Warning */}
      {timeUntilExpiry && timeUntilExpiry < 300000 && timeUntilExpiry > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Session Expiring Soon</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your session will expire in less than 5 minutes. You will be automatically logged out when the timer reaches zero.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Protected API Test */}
      <div className="mt-8">
        <ProtectedApiTest />
      </div>
    </div>
  )
}
