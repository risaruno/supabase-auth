'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedApiTest() {
  const { jwtToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [testData, setTestData] = useState('{"message": "Hello from client!"}')

  const testProtectedApi = async (method: 'GET' | 'POST') => {
    if (!jwtToken) {
      setResponse('No JWT token available')
      return
    }

    setLoading(true)
    setResponse('')

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      }

      if (method === 'POST') {
        options.body = testData
      }

      const res = await fetch('/api/protected/user-data', options)
      const data = await res.json()
      
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  if (!jwtToken) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Protected API Test</h3>
        <p className="text-gray-600">Please sign in to test protected API endpoints.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Protected API Test</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => testProtectedApi('GET')}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            Test GET
          </button>
          <button
            onClick={() => testProtectedApi('POST')}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Test POST
          </button>
        </div>

        <div>
          <label htmlFor="testData" className="block text-sm font-medium text-gray-700 mb-1">
            POST Data (JSON):
          </label>
          <textarea
            id="testData"
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono text-gray-800"
            rows={3}
          />
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto text-gray-800"></div>
            <p className="mt-2 text-sm text-gray-600">Testing API...</p>
          </div>
        )}

        {response && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">API Response:</h4>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto text-gray-800">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
