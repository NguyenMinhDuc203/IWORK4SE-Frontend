"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Calendar } from "lucide-react"
import { api } from "@/lib/api"

export default function DateParsingTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [results, setResults] = useState<any>(null)

  const testDateParsing = async () => {
    setStatus('testing')
    setMessage('')
    setResults(null)

    try {
      const testResults = []

      // Test 1: Job Categories (có date fields)
      try {
        const categoriesResponse = await api.getAllJobCategories()
        console.log('Categories response:', categoriesResponse)
        
        testResults.push({
          name: "Job Categories",
          endpoint: "/job-category/all",
          success: true,
          data: categoriesResponse.data,
          dateFields: categoriesResponse.data?.map((cat: any) => ({
            id: cat.id,
            createAt: cat.createAt,
            updateAt: cat.updateAt,
            createAtType: typeof cat.createAt,
            updateAtType: typeof cat.updateAt
          })) || []
        })
      } catch (error: any) {
        testResults.push({
          name: "Job Categories",
          endpoint: "/job-category/all",
          success: false,
          error: error.message,
          stack: error.stack
        })
      }

      // Test 2: Active Jobs (có date fields)
      try {
        const jobsResponse = await api.getActiveJobs({ page: 0, size: 2 })
        console.log('Jobs response:', jobsResponse)
        
        testResults.push({
          name: "Active Jobs",
          endpoint: "/job-post/active",
          success: true,
          data: jobsResponse.data,
          dateFields: jobsResponse.data?.content?.map((job: any) => ({
            id: job.id,
            postedDate: job.postedDate,
            closingDate: job.closingDate,
            updateAt: job.updateAt,
            postedDateType: typeof job.postedDate,
            closingDateType: typeof job.closingDate,
            updateAtType: typeof job.updateAt
          })) || []
        })
      } catch (error: any) {
        testResults.push({
          name: "Active Jobs",
          endpoint: "/job-post/active",
          success: false,
          error: error.message,
          stack: error.stack
        })
      }

      console.log('All date parsing test results:', testResults)
      
      setStatus('success')
      setMessage('Date parsing test hoàn thành!')
      setResults(testResults)
    } catch (error: any) {
      console.error('Date parsing test error:', error)
      setStatus('error')
      setMessage(`Lỗi: ${error.message}`)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('vi-VN')
    } catch (error) {
      return `Invalid date: ${dateStr}`
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Date Parsing Test</span>
          </CardTitle>
          <CardDescription>
            Test xử lý date fields từ backend API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center space-x-2">
            {status === 'idle' && <span>Chưa test</span>}
            {status === 'testing' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang test date parsing...</span>
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
          <Button onClick={testDateParsing} disabled={status === 'testing'} className="w-full">
            {status === 'testing' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Date Parsing...
              </>
            ) : (
              'Test Date Parsing'
            )}
          </Button>

          {/* Results */}
          {results && (
            <div className="mt-6">
              <h4 className="font-semibold mb-4">Date Parsing Results:</h4>
              <div className="space-y-4">
                {results.map((result: any, index: number) => (
                  <Card key={index} className={`${
                    result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">{result.name}</span>
                        </div>
                        <div className={`text-sm font-medium ${
                          result.success ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.success ? (
                            <>
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              ✅ Success
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 inline mr-1" />
                              ❌ Failed
                            </>
                          )}
                        </div>
                      </div>
                      
                      {result.error && (
                        <div className="text-xs text-red-600 mb-2">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}

                      {result.dateFields && result.dateFields.length > 0 && (
                        <div className="mt-2">
                          <h5 className="font-medium text-sm mb-2">Date Fields Analysis:</h5>
                          <div className="space-y-2">
                            {result.dateFields.slice(0, 2).map((item: any, idx: number) => (
                              <div key={idx} className="text-xs bg-gray-100 p-2 rounded">
                                <div><strong>ID:</strong> {item.id}</div>
                                {item.createAt && (
                                  <div><strong>createAt:</strong> {item.createAt} ({item.createAtType})</div>
                                )}
                                {item.updateAt && (
                                  <div><strong>updateAt:</strong> {item.updateAt} ({item.updateAtType})</div>
                                )}
                                {item.postedDate && (
                                  <div><strong>postedDate:</strong> {item.postedDate} ({item.postedDateType})</div>
                                )}
                                {item.closingDate && (
                                  <div><strong>closingDate:</strong> {item.closingDate} ({item.closingDateType})</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">Expected Date Formats:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• <strong>LocalDate:</strong> "2024-01-15" (YYYY-MM-DD)</div>
              <div>• <strong>LocalDateTime:</strong> "2024-01-15T10:30:00" (ISO format)</div>
              <div>• <strong>Backend Fields:</strong> createAt, updateAt (LocalDateTime), postedDate, closingDate (LocalDate)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
