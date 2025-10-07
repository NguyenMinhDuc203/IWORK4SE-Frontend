"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Info } from "lucide-react"
import { api } from "@/lib/api"

export default function ApiTestComponent() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking')
  const [errorMessage, setErrorMessage] = useState('')
  const [testData, setTestData] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    testApiConnection()
  }, [])

  const testApiConnection = async () => {
    setConnectionStatus('checking')
    setErrorMessage('')
    setDebugInfo(null)
    
    try {
      // Test basic API connection by fetching active jobs
      const response = await api.getActiveJobs({ page: 0, size: 1 })
      setConnectionStatus('success')
      setTestData(response)
      setDebugInfo({
        apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
        endpoint: "/job-post/active",
        timestamp: new Date().toISOString(),
        responseStatus: response.status
      })
    } catch (error: any) {
      setConnectionStatus('error')
      setErrorMessage(error.message || 'Không thể kết nối với API')
      setDebugInfo({
        apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
        endpoint: "/job-post/active",
        timestamp: new Date().toISOString(),
        error: error.message,
        errorStatus: error.status
      })
      console.error('API Test Error:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
          <CardDescription>
            Kiểm tra kết nối giữa frontend và backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {connectionStatus === 'checking' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang kiểm tra kết nối...</span>
              </>
            )}
            {connectionStatus === 'success' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Kết nối thành công!</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600">Kết nối thất bại</span>
              </>
            )}
          </div>

          {/* Error Message */}
          {connectionStatus === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {connectionStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                API hoạt động bình thường! Đã nhận được {testData?.data?.totalElements || 0} việc làm từ backend.
              </AlertDescription>
            </Alert>
          )}

          {/* Debug Info */}
          {debugInfo && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-blue-500" />
                <h4 className="font-semibold">Thông tin debug:</h4>
              </div>
              <div className="bg-gray-100 p-4 rounded text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div><strong>API URL:</strong> {debugInfo.apiUrl}</div>
                  <div><strong>Endpoint:</strong> {debugInfo.endpoint}</div>
                  <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
                  {debugInfo.responseStatus && (
                    <div><strong>Response Status:</strong> {debugInfo.responseStatus}</div>
                  )}
                  {debugInfo.errorStatus && (
                    <div><strong>Error Status:</strong> {debugInfo.errorStatus}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Test Button */}
          <Button onClick={testApiConnection} disabled={connectionStatus === 'checking'}>
            {connectionStatus === 'checking' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang kiểm tra...
              </>
            ) : (
              'Kiểm tra lại'
            )}
          </Button>

          {/* Troubleshooting Tips */}
          {connectionStatus === 'error' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">Hướng dẫn khắc phục:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Đảm bảo backend đang chạy trên port 8080</li>
                <li>• Kiểm tra IntelliJ IDEA có đang chạy BackendServiceApplication không</li>
                <li>• Thử truy cập trực tiếp: <a href="http://localhost:8080/swagger-ui.html" target="_blank" className="underline">http://localhost:8080/swagger-ui.html</a></li>
                <li>• Kiểm tra CORS configuration trong backend</li>
                <li>• Đảm bảo không có firewall chặn kết nối</li>
              </ul>
            </div>
          )}

          {/* Raw Response Data */}
          {testData && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Raw Response Data:</h4>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(testData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}