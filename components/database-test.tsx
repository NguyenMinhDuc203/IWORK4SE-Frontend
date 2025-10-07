"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Database } from "lucide-react"

export default function DatabaseTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState<any>(null)

  const testDatabaseConnection = async () => {
    setStatus('testing')
    setMessage('')
    setResponse(null)

    try {
      // Test multiple endpoints to isolate the issue
      const endpoints = [
        'http://localhost:8080/job-post/',
        'http://localhost:8080/job-post/active',
        'http://localhost:8080/job-category/',
        'http://localhost:8080/employer/list'
      ]

      const results = []
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Testing endpoint: ${endpoint}`)
          const res = await fetch(`${endpoint}?page=0&size=1`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'cors',
          })

          const data = await res.json()
          results.push({
            endpoint,
            status: res.status,
            success: res.ok,
            data: data,
            error: null
          })
        } catch (error: any) {
          results.push({
            endpoint,
            status: 0,
            success: false,
            data: null,
            error: error.message
          })
        }
      }

      console.log('All test results:', results)
      
      setStatus('success')
      setMessage('Database test completed')
      setResponse(results)
    } catch (error: any) {
      console.error('Database test error:', error)
      setStatus('error')
      setMessage(`Lỗi: ${error.message}`)
    }
  }

  const testSwaggerUI = () => {
    window.open('http://localhost:8080/swagger-ui.html', '_blank')
  }

  const testHealthCheck = async () => {
    try {
      const res = await fetch('http://localhost:8080/actuator/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })
      
      if (res.ok) {
        const data = await res.json()
        alert(`Health Check: ${JSON.stringify(data, null, 2)}`)
      } else {
        alert(`Health Check failed: ${res.status}`)
      }
    } catch (error: any) {
      alert(`Health Check error: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database & API Comprehensive Test</span>
          </CardTitle>
          <CardDescription>
            Test toàn diện database connection và các API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center space-x-2">
            {status === 'idle' && <span>Chưa test</span>}
            {status === 'testing' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang test...</span>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Test hoàn thành!</span>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600">Test thất bại!</span>
              </>
            )}
          </div>

          {/* Message */}
          {message && (
            <Alert variant={status === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={testDatabaseConnection} disabled={status === 'testing'}>
              {status === 'testing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test All Endpoints'
              )}
            </Button>
            <Button variant="outline" onClick={testSwaggerUI}>
              Open Swagger UI
            </Button>
            <Button variant="outline" onClick={testHealthCheck}>
              Health Check
            </Button>
          </div>

          {/* Results */}
          {response && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Test Results:</h4>
              <div className="space-y-2">
                {response.map((result: any, index: number) => (
                  <div key={index} className={`p-3 rounded border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{result.endpoint}</div>
                      <div className={`text-sm ${
                        result.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.success ? `✅ ${result.status}` : `❌ ${result.error}`}
                      </div>
                    </div>
                    {result.data && (
                      <div className="mt-2 text-xs text-gray-600">
                        <strong>Response:</strong> {JSON.stringify(result.data, null, 2).substring(0, 200)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">Test Endpoints:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• <strong>All Jobs:</strong> http://localhost:8080/job-post/</div>
              <div>• <strong>Active Jobs:</strong> http://localhost:8080/job-post/active</div>
              <div>• <strong>Categories:</strong> http://localhost:8080/job-category/</div>
              <div>• <strong>Employers:</strong> http://localhost:8080/employer/list</div>
              <div>• <strong>Health Check:</strong> http://localhost:8080/actuator/health</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
