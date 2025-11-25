"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Edit, Trash2 } from "lucide-react"
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
      // Get current employer's jobs using their userId
      const employerId = localStorage.getItem("userId") || ""
      const res = await api.getJobsByEmployer(employerId, 0, 20)
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

  const getStatusText = (status?: JobPost["jobStatus"]) => {
    switch (status) {
      case "ACCEPTED":
        return "Đã duyệt"
      case "PENDING":
        return "Chờ duyệt"
      case "REJECTED":
        return "Từ chối"
      case "EXPIRED":
        return "Hết hạn"
      default:
        return status || "Không xác định"
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tin tuyển dụng này?")) {
      return
    }
    
    try {
      await api.deleteJobPost(jobId)
      // Refresh the list
      fetchJobs()
    } catch (e: any) {
      alert("Không thể xóa tin tuyển dụng: " + (e?.message || "Lỗi không xác định"))
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 px-20">
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
                <Badge className={statusColor(job.jobStatus)}>{getStatusText(job.jobStatus)}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground line-clamp-3 mb-4">{job.description}</div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{job.location}</span>
                    {job.minSalary && job.maxSalary && (
                      <span>• {job.minSalary.toLocaleString()} - {job.maxSalary.toLocaleString()} VNĐ</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/employer/jobs/${job.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


