"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Briefcase, 
  Building2, 
  Users, 
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

interface DashboardStats {
  totalJobs: number
  totalCompanies: number
  totalApplicants: number
  totalApplications: number
  pendingJobs: number
  activeJobs: number
  recentJobs: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalCompanies: 0,
    totalApplicants: 0,
    totalApplications: 0,
    pendingJobs: 0,
    activeJobs: 0,
    recentJobs: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch jobs data
      const jobsResponse = await api.getJobs({ page: 0, size: 100 })
      const allJobs = jobsResponse.data.content || []
      
      // Fetch companies data
      const companiesResponse = await api.getAllEmployers({ page: 0, size: 100 })
      const allCompanies = companiesResponse.data.content || []
      
      // Calculate stats
      const totalJobs = allJobs.length
      const activeJobs = allJobs.filter((job: any) => job.jobStatus === "ACCEPTED").length
      const pendingJobs = allJobs.filter((job: any) => job.jobStatus === "PENDING").length
      
      // Get recent jobs (last 5)
      const recentJobs = allJobs
        .sort((a: any, b: any) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
        .slice(0, 5)

      setStats({
        totalJobs,
        totalCompanies: allCompanies.length,
        totalApplicants: 0, // This would need a separate API call
        totalApplications: 0, // This would need a separate API call
        pendingJobs,
        activeJobs,
        recentJobs
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
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
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-600 mt-2">Chào mừng bạn đến với bảng điều khiển quản trị</p>
      </div>

      {/* Stats Cards */}
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
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{stats.activeJobs} hoạt động</span>
              <span className="text-gray-500 mx-2">•</span>
              <span className="text-yellow-600">{stats.pendingJobs} chờ duyệt</span>
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
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              Đã đăng ký
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
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              Đã đăng ký
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ứng tuyển</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              Tổng số
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Việc làm gần đây
            </CardTitle>
            <CardDescription>
              Các việc làm được đăng gần đây nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentJobs.length > 0 ? (
                stats.recentJobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-500">{job.companyName || job.employerName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getJobStatusBadge(job.jobStatus)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có việc làm nào</p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/admin/jobs">
                <Button variant="outline" className="w-full">
                  Xem tất cả việc làm
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Thao tác nhanh
            </CardTitle>
            <CardDescription>
              Các chức năng quản lý chính
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/jobs">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <Briefcase className="h-6 w-6 mb-2" />
                  <span className="text-sm">Quản lý việc làm</span>
                </Button>
              </Link>
              
              <Link href="/admin/companies">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <Building2 className="h-6 w-6 mb-2" />
                  <span className="text-sm">Quản lý công ty</span>
                </Button>
              </Link>
              
              <Link href="/admin/applicants">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">Quản lý ứng viên</span>
                </Button>
              </Link>
              
              <Link href="/admin/statistics">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span className="text-sm">Thống kê</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
