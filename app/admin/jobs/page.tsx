"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Briefcase, 
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  Building2
} from "lucide-react"
import Link from "next/link"
import { api, JobPost } from "@/lib/api"

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchJobs()
  }, [currentPage, statusFilter])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      const response = await api.getJobs({
        keyword: searchKeyword || undefined,
        page: currentPage,
        size: 10
      })
      
      setJobs(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    fetchJobs()
  }

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await api.updateJobPostStatus(jobId, newStatus)
      // Refresh the jobs list
      fetchJobs()
    } catch (error) {
      console.error("Error updating job status:", error)
    }
  }

  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã duyệt</Badge>
      case "PENDING":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Từ chối</Badge>
      case "EXPIRED":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Hết hạn</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getJobTypeText = (jobType: string) => {
    switch (jobType) {
      case "INTERNSHIP": return "Internship"
      case "FRESHER": return "Fresher"
      case "JUNIOR": return "Junior"
      case "SENIOR": return "Senior"
      case "MANAGER": return "Manager"
      default: return jobType
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (statusFilter === "ALL") return true
    return job.jobStatus === statusFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý việc làm</h1>
        <p className="text-gray-600 mt-2">Quản lý và duyệt các việc làm được đăng</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm việc làm..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="ACCEPTED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
                <SelectItem value="EXPIRED">Hết hạn</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {job.companyName || job.employerName}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.minSalary && job.maxSalary
                              ? `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} VNĐ`
                              : "Thỏa thuận"}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {getJobTypeText(job.jobType)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2">
                          {job.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 ml-4">
                    {getJobStatusBadge(job.jobStatus)}
                    
                    <div className="flex gap-2">
                      <Link href={`/jobs/${job.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                      </Link>
                      
                      {job.jobStatus === "PENDING" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(job.id, "ACCEPTED")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(job.id, "REJECTED")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có việc làm nào</h3>
              <p className="text-gray-500">Chưa có việc làm nào phù hợp với bộ lọc của bạn</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            Trước
          </Button>
          <span className="text-sm text-gray-600">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  )
}
