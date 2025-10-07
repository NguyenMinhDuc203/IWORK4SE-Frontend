"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function SimpleApiTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState<any>(null)

  const testDirectConnection = async () => {
    setStatus('testing')
    setMessage('')
    setResponse(null)

    try {
      // Test 1: Direct fetch to backend
      console.log('Testing direct connection to:', 'http://localhost:8080/job-post/active?page=0&size=1')
      
      const res = await fetch('http://localhost:8080/job-post/active?page=0&size=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })

      console.log('Response status:', res.status)
      console.log('Response headers:', res.headers)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      console.log('Response data:', data)
      
      setStatus('success')
      setMessage('Kết nối thành công!')
      setResponse(data)
    } catch (error: any) {
      console.error('Connection error:', error)
      setStatus('error')
      setMessage(`Lỗi: ${error.message}`)
    }
  }

  const testSwaggerUI = () => {
    window.open('http://localhost:8080/swagger-ui.html', '_blank')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Simple API Connection Test</CardTitle>
          <CardDescription>
            Test trực tiếp kết nối đến backend
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
                <span className="text-green-600">Thành công!</span>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600">Thất bại!</span>
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
          <div className="flex space-x-2">
            <Button onClick={testDirectConnection} disabled={status === 'testing'}>
              {status === 'testing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test API Connection'
              )}
            </Button>
            <Button variant="outline" onClick={testSwaggerUI}>
              Open Swagger UI
            </Button>
          </div>

          {/* Response */}
          {response && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Response:</h4>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">Debug Info:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>API URL:</strong> http://localhost:8080</div>
              <div><strong>Endpoint:</strong> /job-post/active</div>
              <div><strong>Full URL:</strong> http://localhost:8080/job-post/active?page=0&size=1</div>
              <div><strong>Method:</strong> GET</div>
              <div><strong>Mode:</strong> CORS</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
