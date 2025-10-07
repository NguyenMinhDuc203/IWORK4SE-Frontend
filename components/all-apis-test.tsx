"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Database, Building2, Briefcase } from "lucide-react"
import { api } from "@/lib/api"

export default function AllApisTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [results, setResults] = useState<any>(null)

  const testAllApis = async () => {
    setStatus('testing')
    setMessage('')
    setResults(null)

    try {
      const testResults = []

      // Test 1: Job Posts
      try {
        const jobsResponse = await api.getActiveJobs({ page: 0, size: 2 })
        testResults.push({
          name: "Active Jobs",
          endpoint: "/job-post/active",
          success: true,
          data: jobsResponse.data,
          count: jobsResponse.data?.totalElements || 0
        })
      } catch (error: any) {
        testResults.push({
          name: "Active Jobs",
          endpoint: "/job-post/active",
          success: false,
          error: error.message
        })
      }

      // Test 2: All Jobs
      try {
        const allJobsResponse = await api.getJobs({ page: 0, size: 2 })
        testResults.push({
          name: "All Jobs",
          endpoint: "/job-post/",
          success: true,
          data: allJobsResponse.data,
          count: allJobsResponse.data?.totalElements || 0
        })
      } catch (error: any) {
        testResults.push({
          name: "All Jobs",
          endpoint: "/job-post/",
          success: false,
          error: error.message
        })
      }

      // Test 3: Job Categories
      try {
        const categoriesResponse = await api.getAllJobCategories()
        testResults.push({
          name: "Job Categories",
          endpoint: "/job-category/all",
          success: true,
          data: categoriesResponse.data,
          count: categoriesResponse.data?.length || 0
        })
      } catch (error: any) {
        testResults.push({
          name: "Job Categories",
          endpoint: "/job-category/all",
          success: false,
          error: error.message
        })
      }

      // Test 4: Employers
      try {
        const employersResponse = await api.getAllEmployers({ page: 0, size: 2 })
        testResults.push({
          name: "Employers",
          endpoint: "/employer/list",
          success: true,
          data: employersResponse.data,
          count: employersResponse.data?.totalElements || 0
        })
      } catch (error: any) {
        testResults.push({
          name: "Employers",
          endpoint: "/employer/list",
          success: false,
          error: error.message
        })
      }

      // Test 5: Search Jobs
      try {
        const searchResponse = await api.searchJobsWithCategory({ 
          keyword: "developer", 
          page: 0, 
          size: 2 
        })
        testResults.push({
          name: "Search Jobs",
          endpoint: "/job-post/search",
          success: true,
          data: searchResponse.data,
          count: searchResponse.data?.totalElements || 0
        })
      } catch (error: any) {
        testResults.push({
          name: "Search Jobs",
          endpoint: "/job-post/search",
          success: false,
          error: error.message
        })
      }

      console.log('All API test results:', testResults)
      
      setStatus('success')
      setMessage('Tất cả API tests đã hoàn thành!')
      setResults(testResults)
    } catch (error: any) {
      console.error('API test error:', error)
      setStatus('error')
      setMessage(`Lỗi: ${error.message}`)
    }
  }

  const getIcon = (name: string) => {
    switch (name) {
      case 'Active Jobs':
      case 'All Jobs':
      case 'Search Jobs':
        return <Briefcase className="h-4 w-4" />
      case 'Job Categories':
        return <Database className="h-4 w-4" />
      case 'Employers':
        return <Building2 className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Comprehensive API Test Suite</span>
          </CardTitle>
          <CardDescription>
            Test tất cả các API endpoints đã được mở quyền truy cập
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center space-x-2">
            {status === 'idle' && <span>Chưa test</span>}
            {status === 'testing' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang test tất cả APIs...</span>
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

          {/* Test Button */}
          <Button onClick={testAllApis} disabled={status === 'testing'} className="w-full">
            {status === 'testing' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing All APIs...
              </>
            ) : (
              'Test All APIs'
            )}
          </Button>

          {/* Results */}
          {results && (
            <div className="mt-6">
              <h4 className="font-semibold mb-4">Test Results:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((result: any, index: number) => (
                  <Card key={index} className={`${
                    result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getIcon(result.name)}
                          <span className="font-medium">{result.name}</span>
                        </div>
                        <div className={`text-sm font-medium ${
                          result.success ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.success ? (
                            <>
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              ✅ {result.count} items
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 inline mr-1" />
                              ❌ Failed
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        <strong>Endpoint:</strong> {result.endpoint}
                      </div>
                      {result.error && (
                        <div className="text-xs text-red-600">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                      {result.success && result.data && (
                        <div className="text-xs text-gray-600">
                          <strong>Sample Data:</strong> {JSON.stringify(result.data).substring(0, 100)}...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {results && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">Summary:</h4>
              <div className="text-sm text-blue-700">
                <div>✅ Successful: {results.filter((r: any) => r.success).length} APIs</div>
                <div>❌ Failed: {results.filter((r: any) => !r.success).length} APIs</div>
                <div>📊 Total: {results.length} APIs tested</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
