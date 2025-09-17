// Example utility for making authenticated API calls
// This file demonstrates how to use the JWT token for API requests

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export class AuthenticatedApiClient {
  private baseUrl: string
  private getToken: () => string | null

  constructor(baseUrl: string = '', getToken: () => string | null) {
    this.baseUrl = baseUrl
    this.getToken = getToken
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken()
    
    if (!token) {
      return { error: 'No authentication token available' }
    }

    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || `HTTP ${response.status}` }
      }

      return { data }
    } catch (error) {
      return { error: `Network error: ${error}` }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Usage example:
/*
import { useAuth } from '@/contexts/AuthContext'

const MyComponent = () => {
  const { jwtToken } = useAuth()
  
  const apiClient = new AuthenticatedApiClient(
    '/api/protected',
    () => jwtToken
  )

  const fetchUserData = async () => {
    const { data, error } = await apiClient.get('/user-data')
    
    if (error) {
      console.error('API Error:', error)
      return
    }
    
    console.log('User data:', data)
  }

  const updateUserData = async (userData: any) => {
    const { data, error } = await apiClient.post('/user-data', userData)
    
    if (error) {
      console.error('Update failed:', error)
      return
    }
    
    console.log('Update successful:', data)
  }

  return (
    <div>
      <button onClick={fetchUserData}>Fetch Data</button>
      <button onClick={() => updateUserData({ name: 'John Doe' })}>
        Update Data
      </button>
    </div>
  )
}
*/
