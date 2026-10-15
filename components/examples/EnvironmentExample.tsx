'use client'

import { useEffect, useState } from 'react'
import { 
  isBrowser, 
  isServer, 
  isProduction, 
  browserOnly, 
  productionOnly,
  safeLocalStorage,
  safeWindow,
  logger,
  safeApiCall
} from '@/lib/utils/environment'

export function EnvironmentExample() {
  const [clientData, setClientData] = useState<string>('')
  const [serverData, setServerData] = useState<string>('')

  useEffect(() => {
    // Browser-only logic
    if (typeof window !== 'undefined') {
      // Safe localStorage access
      const storage = safeLocalStorage()
      if (storage) {
        const savedData = storage.getItem('example-data')
        setClientData(savedData || 'No saved data')
      }

      // Safe window access
      const window = safeWindow()
      if (window) {
        logger.info('Window dimensions:', {
          width: window.innerWidth,
          height: window.innerHeight
        })
      }
    }

    // Production-only logic
    if (process.env.NODE_ENV === 'production') {
      logger.info('Running in production mode')
      // Production-specific analytics, monitoring, etc.
    }

    // Browser-only function execution
    const browserResult = browserOnly(() => {
      return 'This only runs in browser'
    })

    // Production-only function execution
    const productionResult = productionOnly(() => {
      return 'This only runs in production'
    })

    setClientData(prev => `${prev} | Browser: ${browserResult || 'null'}`)
    setServerData(`Production: ${productionResult || 'null'}`)

  }, [])

  const handleApiCall = async () => {
    try {
      // Safe API call with environment checks
      const result = await safeApiCall('/api/access/rationale', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer token' // In real app, get from auth context
        }
      })

      if (result) {
        logger.info('API call successful:', result)
      } else {
        logger.warn('API call returned null')
      }
    } catch (error) {
      logger.error('API call failed:', error)
    }
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Environment Detection Example</h3>
      
      <div className="space-y-4">
        <div>
          <strong>Environment Status:</strong>
          <ul className="ml-4 space-y-1">
            <li>Browser: {isBrowser ? '✅' : '❌'}</li>
            <li>Server: {isServer ? '✅' : '❌'}</li>
            <li>Production: {isProduction ? '✅' : '❌'}</li>
          </ul>
        </div>

        <div>
          <strong>Client Data:</strong>
          <p className="text-sm text-gray-600">{clientData}</p>
        </div>

        <div>
          <strong>Server Data:</strong>
          <p className="text-sm text-gray-600">{serverData}</p>
        </div>

        <button 
          onClick={handleApiCall}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Safe API Call
        </button>
      </div>
    </div>
  )
}
