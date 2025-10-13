"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus } from "lucide-react"
import { api, type JobPost, type JobPostPageResponse } from "@/lib/api"

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const role = localStorage.getItem("userType")
    if (role !== "EMPLOYER") {
      window.location.href = "/login"
      return
    }
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setIsLoading(true)
    setError("")
    try {
      // If backend supports employerId filtering, get it from localStorage
      const employerId = localStorage.getItem("userId") || ""
      const res = await api.searchJobPosts({ employerId, page: 0, size: 20 })
      const page: JobPostPageResponse | undefined = res?.data
      setJobs(page?.content || [])
    } catch (e: any) {
      setError(e?.message || "Không thể tải danh sách việc làm")
    } finally {
      setIsLoading(false)
    }
  }

  const statusColor = (status?: JobPost["jobStatus"]) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-700"
      case "PENDING":
        return "bg-yellow-100 text-yellow-700"
      case "REJECTED":
        return "bg-red-100 text-red-700"
      case "EXPIRED":
        return "bg-gray-200 text-gray-700"
      default:
        return "bg-muted text-foreground"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý việc làm</h1>
        <Link href="/employer/jobs/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Đăng tin tuyển dụng
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="mb-4">Bạn chưa có tin tuyển dụng nào</p>
          <Link href="/employer/jobs/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Đăng tin đầu tiên
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base line-clamp-2">{job.title}</CardTitle>
                <Badge className={statusColor(job.jobStatus)}>{job.jobStatus}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground line-clamp-3 mb-4">{job.description}</div>
                <div className="flex justify-between items-center">
                  <Link href={`/jobs/${job.id}`}>
                    <Button size="sm" variant="outline">Xem chi tiết</Button>
                  </Link>
                  <Link href={`/employer/jobs/${job.id}/edit`}>
                    <Button size="sm" variant="ghost">Chỉnh sửa</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


