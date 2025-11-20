"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

export default function AllApisTest() {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    setResults([])

    const tests = [
      { name: "Health Check", method: "GET", endpoint: "/api/health" },
      { name: "Get Jobs", method: "GET", endpoint: "/job-post/active?page=0&size=5" },
      { name: "Get Job Categories", method: "GET", endpoint: "/job-category/all" },
    ]

    for (const test of tests) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${test.endpoint}`, {
          method: test.method,
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()
        setResults((prev) => [
          ...prev,
          {
            name: test.name,
            status: response.ok ? "success" : "error",
            statusCode: response.status,
            data: data,
          },
        ])
      } catch (error) {
        setResults((prev) => [
          ...prev,
          {
            name: test.name,
            status: "error",
            statusCode: 0,
            error: (error as Error).message,
          },
        ])
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>API Test Suite</CardTitle>
          <CardDescription>Test various API endpoints to ensure they are working correctly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={runTests} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              "Run All Tests"
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    result.status === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {result.status === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-semibold text-foreground">{result.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            result.status === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                          }`}
                        >
                          {result.statusCode || "Error"}
                        </span>
                      </div>
                      {result.error && <p className="text-sm text-red-700 mt-2">Error: {result.error}</p>}
                      {result.data && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                            View Response
                          </summary>
                          <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-64 border border-gray-200">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
