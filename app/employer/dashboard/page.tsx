"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Briefcase, 
  Users, 
  TrendingUp,
  Eye,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { api, JobPost, Application, normalizePageResponse, PageMeta } from "@/lib/api"

export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userType, setUserType] = useState<"APPLICANT" | "EMPLOYER" | null>(null)
  const [actioning, setActioning] = useState<Record<string, boolean>>({})
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    withdrawn: 0,
  })
  const [applicationPageInfo, setApplicationPageInfo] = useState<PageMeta>({
    pageNumber: 0,
    pageSize: 0,
    totalPages: 0,
    totalElements: 0,
  })

  useEffect(() => {
    const userTypeFromStorage = localStorage.getItem("userType") as "APPLICANT" | "EMPLOYER" | null
    setUserType(userTypeFromStorage)
    
    if (userTypeFromStorage === "EMPLOYER") {
      fetchEmployerData()
    } else if (userTypeFromStorage === "APPLICANT") {
      // Redirect to applicant dashboard
      window.location.href = "/dashboard"
    } else {
      // Redirect to login
      window.location.href = "/login"
    }
  }, [])

  const fetchEmployerData = async () => {
    setIsLoading(true)
    try {
      const employerId = localStorage.getItem("userId")
      if (!employerId) throw new Error("Không tìm thấy thông tin employer")

      const [
        jobsRes,
        recentAppsRes,
        pendingRes,
        approvedRes,
        rejectedRes,
        withdrawnRes,
      ] = await Promise.all([
        api.getJobsByEmployer(employerId, 0, 10).catch(() => null),
        api.getApplicationsByEmployer(employerId, { page: 0, size: 5 }).catch(() => null),
        api.getApplicationsByEmployer(employerId, { page: 0, size: 1, status: "PENDING" }).catch(() => null),
        api.getApplicationsByEmployer(employerId, { page: 0, size: 1, status: "APPROVED" }).catch(() => null),
        api.getApplicationsByEmployer(employerId, { page: 0, size: 1, status: "REJECTED" }).catch(() => null),
        api.getApplicationsByEmployer(employerId, { page: 0, size: 1, status: "WITHDRAWN" }).catch(() => null),
      ])

      const jobsData = jobsRes?.data as any
      const jobsList: JobPost[] = Array.isArray(jobsData?.content)
        ? jobsData.content
        : Array.isArray(jobsData)
        ? jobsData
        : []
      setJobs(jobsList)

      const recentAppsPage = normalizePageResponse<Application>(recentAppsRes)
      const pendingPage = normalizePageResponse<Application>(pendingRes)
      const approvedPage = normalizePageResponse<Application>(approvedRes)
      const rejectedPage = normalizePageResponse<Application>(rejectedRes)
      const withdrawnPage = normalizePageResponse<Application>(withdrawnRes)

      setApplications(recentAppsPage.content)
      setApplicationPageInfo({
        pageNumber: recentAppsPage.pageNumber,
        pageSize: recentAppsPage.pageSize,
        totalPages: recentAppsPage.totalPages,
        totalElements: recentAppsPage.totalElements,
      })
      setApplicationStats({
        total: recentAppsPage.totalElements,
        pending: pendingPage.totalElements,
        approved: approvedPage.totalElements,
        rejected: rejectedPage.totalElements,
        withdrawn: withdrawnPage.totalElements,
      })
    } catch (error) {
      console.error("Error fetching employer dashboard data:", error)
      setJobs([])
      setApplications([])
      setApplicationStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        withdrawn: 0,
      })
      setApplicationPageInfo({
        pageNumber: 0,
        pageSize: 0,
        totalPages: 0,
        totalElements: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const setLoadingFor = (id: string, value: boolean) => {
    setActioning(prev => ({ ...prev, [id]: value }))
  }

  const handleViewCV = async (app: Application) => {
    try {
      if (app.cvUrl) {
        window.open(app.cvUrl, "_blank")
        return
      }
      const res = await api.getApplicationById(app.id)
      const url = res?.data?.cvUrl
      if (url) {
        window.open(url, "_blank")
      } else {
        alert("Không tìm thấy CV cho ứng viên này")
      }
    } catch (e) {
      alert("Không thể mở CV. Vui lòng thử lại sau.")
    }
  }

  const handleApprove = async (id: string) => {
    try {
      setLoadingFor(id, true)
      await api.approveApplication(id)
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "APPROVED" } as Application : a))
    } catch (e) {
      alert("Không thể chấp nhận ứng tuyển. Vui lòng thử lại.")
    } finally {
      setLoadingFor(id, false)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setLoadingFor(id, true)
      await api.rejectApplication(id)
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "REJECTED" } as Application : a))
    } catch (e) {
      alert("Không thể từ chối ứng tuyển. Vui lòng thử lại.")
    } finally {
      setLoadingFor(id, false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xem xét"
      case "APPROVED":
        return "Đã chấp nhận"
      case "REJECTED":
        return "Đã từ chối"
      case "WITHDRAWN":
        return "Đã rút đơn"
      default:
        return status
    }
  }

  const formatDate = (value?: string | null) => {
    if (!value) return "-"
    const date = new Date(value)
    if (isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("vi-VN")
  }

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 5)

  const responseRate =
    applicationStats.total > 0
      ? Math.round(((applicationStats.approved + applicationStats.rejected) / applicationStats.total) * 100)
      : 0

  const totalApplicationsDisplay = applicationStats.total
  const totalPendingDisplay = applicationStats.pending
  const totalRecentApplicants = applicationPageInfo.totalElements

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Nhà tuyển dụng</h1>
          <p className="text-muted-foreground">
            Quản lý việc làm và ứng viên của bạn
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                  <p className="text-sm text-muted-foreground">Việc làm đang tuyển</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalApplicationsDisplay}</p>
                  <p className="text-sm text-muted-foreground">Ứng viên</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPendingDisplay}</p>
                  <p className="text-sm text-muted-foreground">Chờ xem xét</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{responseRate}%</p>
                  <p className="text-sm text-muted-foreground">Tỷ lệ phản hồi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Ứng viên mới nhất</CardTitle>
                  <CardDescription>
                    Các ứng viên đã ứng tuyển vào việc làm của bạn
                    {totalRecentApplicants > 0 && ` · Tổng ${totalRecentApplicants} đơn`}
                  </CardDescription>
                </div>
                <Link href="/employer/applicants">
                  <Button variant="outline" size="sm">
                    Xem tất cả
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentApplications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="font-semibold mb-2">Chưa có ứng viên nào</p>
                    <p className="text-sm">Khi có ứng viên ứng tuyển, bạn sẽ thấy thông tin tại đây.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{application.applicantName}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{application.jobTitle}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(application.appliedDate)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {application.location || "Không xác định"}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {application.jobPosition || "Chưa cập nhật"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(application.status)}
                            <span className="text-sm font-medium">
                              {getStatusText(application.status)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewCV(application)}>
                            <Eye className="h-3 w-3 mr-1" />
                            Xem CV
                          </Button>
                          {application.status === "PENDING" && (
                            <>
                              <Button size="sm" onClick={() => handleApprove(application.id)} disabled={!!actioning[application.id]}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Chấp nhận
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(application.id)} disabled={!!actioning[application.id]}>
                                <XCircle className="h-3 w-3 mr-1" />
                                Từ chối
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/employer/jobs/create" className="block">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Đăng việc làm mới
                  </Button>
                </Link>
                <Link href="/employer/jobs" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Quản lý việc làm
                  </Button>
                </Link>
                <Link href="/employer/applicants" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Quản lý Ứng viên
                  </Button>
                </Link>
                <Link href="/employer/statistics" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Thống kê tuyển dụng
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Active Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Việc làm đang tuyển</CardTitle>
                <CardDescription>
                  Các việc làm đang được đăng tuyển
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="font-semibold mb-1">{job.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/jobs/${job.id}`}>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Link href={`/employer/jobs/${job.id}/edit`}>
                            <Button size="sm" variant="ghost">
                              Chỉnh sửa
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
