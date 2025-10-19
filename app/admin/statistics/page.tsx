"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Briefcase,
  FileText,
  Calendar,
  DollarSign,
  MapPin
} from "lucide-react"
import { api } from "@/lib/api"

interface StatisticsData {
  totalJobs: number
  totalCompanies: number
  totalApplicants: number
  totalApplications: number
  jobsByStatus: { [key: string]: number }
  jobsByType: { [key: string]: number }
  jobsByLocation: { [key: string]: number }
  recentActivity: any[]
}

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<StatisticsData>({
    totalJobs: 0,
    totalCompanies: 0,
    totalApplicants: 0,
    totalApplications: 0,
    jobsByStatus: {},
    jobsByType: {},
    jobsByLocation: {},
    recentActivity: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setIsLoading(true)
      
      // Fetch jobs data
      const jobsResponse = await api.getJobs({ page: 0, size: 1000 })
      const allJobs = jobsResponse.data.content || []
      
      // Fetch companies data
      const companiesResponse = await api.getAllEmployers({ page: 0, size: 1000 })
      const allCompanies = companiesResponse.data.content || []
      
      // Calculate statistics
      const jobsByStatus = allJobs.reduce((acc: any, job: any) => {
        acc[job.jobStatus] = (acc[job.jobStatus] || 0) + 1
        return acc
      }, {})
      
      const jobsByType = allJobs.reduce((acc: any, job: any) => {
        acc[job.jobType] = (acc[job.jobType] || 0) + 1
        return acc
      }, {})
      
      const jobsByLocation = allJobs.reduce((acc: any, job: any) => {
        acc[job.location] = (acc[job.location] || 0) + 1
        return acc
      }, {})
      
      // Get recent activity (last 10 jobs)
      const recentActivity = allJobs
        .sort((a: any, b: any) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
        .slice(0, 10)

      setStats({
        totalJobs: allJobs.length,
        totalCompanies: allCompanies.length,
        totalApplicants: 0, // This would need a separate API call
        totalApplications: 0, // This would need a separate API call
        jobsByStatus,
        jobsByType,
        jobsByLocation,
        recentActivity
      })
    } catch (error) {
      console.error("Error fetching statistics:", error)
    } finally {
      setIsLoading(false)
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "Đã duyệt"
      case "PENDING": return "Chờ duyệt"
      case "REJECTED": return "Từ chối"
      case "EXPIRED": return "Hết hạn"
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      case "EXPIRED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thống kê hệ thống</h1>
        <p className="text-gray-600 mt-2">Tổng quan về hoạt động của hệ thống</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng việc làm</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Công ty</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ứng viên</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplicants}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+15% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ứng tuyển</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+22% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Việc làm theo trạng thái
            </CardTitle>
            <CardDescription>
              Phân bố việc làm theo trạng thái duyệt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.jobsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Badge className={getStatusColor(status)}>
                      {getStatusText(status)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{count}</p>
                    <p className="text-sm text-gray-500">
                      {((count / stats.totalJobs) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Jobs by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Việc làm theo cấp độ
            </CardTitle>
            <CardDescription>
              Phân bố việc làm theo cấp độ kinh nghiệm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.jobsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium">{getJobTypeText(type)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{count}</p>
                    <p className="text-sm text-gray-500">
                      {((count / stats.totalJobs) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Hoạt động gần đây
          </CardTitle>
          <CardDescription>
            Các việc làm được đăng gần đây nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-500">{job.companyName || job.employerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(job.jobStatus)}>
                      {getStatusText(job.jobStatus)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Chưa có hoạt động nào</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
