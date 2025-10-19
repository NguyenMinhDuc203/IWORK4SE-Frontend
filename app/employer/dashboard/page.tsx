"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { api, JobPost, Application } from "@/lib/api"

export default function EmployerDashboardPage() {
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userType, setUserType] = useState<"APPLICANT" | "EMPLOYER" | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const userTypeFromStorage = localStorage.getItem("userType") as "APPLICANT" | "EMPLOYER" | null
    setUserType(userTypeFromStorage)
    
    // Check URL parameters for navigation from notifications
    const tab = searchParams.get('tab')
    const applicationId = searchParams.get('application')
    
    if (tab) {
      setActiveTab(tab)
    }
    
    if (userTypeFromStorage === "EMPLOYER") {
      fetchEmployerData()
    } else if (userTypeFromStorage === "APPLICANT") {
      // Redirect to applicant dashboard
      window.location.href = "/dashboard"
    } else {
      // Redirect to login
      window.location.href = "/login"
    }
  }, [searchParams])

  const fetchEmployerData = async () => {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) return

      // Fetch employer's jobs
      const jobsResponse = await api.getJobsByEmployer(userId, 0, 10)
      if (jobsResponse.data) {
        setJobs(jobsResponse.data.content || [])
      }

      // Fetch applications for employer
      const applicationsResponse = await api.getApplicationsByEmployer(userId, 0, 20)
      console.log("Applications response:", applicationsResponse)
      if (applicationsResponse.data) {
        // Ensure applications is always an array
        const appsData = Array.isArray(applicationsResponse.data) 
          ? applicationsResponse.data 
          : (applicationsResponse.data as any).content || []
        setApplications(appsData)
      } else {
        setApplications([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setApplications([])
    } finally {
      setIsLoading(false)
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

  const handleApproveApplication = async (applicationId: string) => {
    try {
      await api.approveApplication(applicationId)
      // Refresh data
      fetchEmployerData()
    } catch (error) {
      console.error("Error approving application:", error)
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await api.rejectApplication(applicationId)
      // Refresh data
      fetchEmployerData()
    } catch (error) {
      console.error("Error rejecting application:", error)
    }
  }

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Nhà tuyển dụng</h1>
          <p className="text-muted-foreground">
            Quản lý việc làm và ứng viên của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "applications"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Ứng viên ứng tuyển ({Array.isArray(applications) ? applications.length : 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <>
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
                  <p className="text-2xl font-bold">{Array.isArray(applications) ? applications.length : 0}</p>
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
                  <p className="text-2xl font-bold">
                    {Array.isArray(applications) ? applications.filter(app => app.status === "PENDING").length : 0}
                  </p>
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
                  <p className="text-2xl font-bold">95%</p>
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
                  </CardDescription>
                </div>
                <Link href="/employer/applications">
                  <Button variant="outline" size="sm">
                    Xem tất cả
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!Array.isArray(applications) || applications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Chưa có ứng viên nào ứng tuyển</p>
                    </div>
                  ) : (
                    applications.slice(0, 5).map((application) => (
                      <div key={application.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{application.applicantName || 'Ứng viên'}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{application.jobTitle}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(application.appliedDate).toLocaleDateString('vi-VN')}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {application.location}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {application.minSalary && application.maxSalary 
                                  ? `${(application.minSalary / 1000000).toFixed(0)}M - ${(application.maxSalary / 1000000).toFixed(0)}M`
                                  : 'Lương thỏa thuận'
                                }
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
                        <div className="mt-3 flex space-x-2">
                          {application.cvUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-3 w-3 mr-1" />
                                Xem CV
                              </a>
                            </Button>
                          )}
                          {application.status === "PENDING" && (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => handleApproveApplication(application.id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Chấp nhận
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRejectApplication(application.id)}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Từ chối
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
          </>
        )}

        {activeTab === "applications" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách ứng viên ứng tuyển</CardTitle>
                <CardDescription>
                  Tất cả ứng viên đã ứng tuyển vào các tin tuyển dụng của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!Array.isArray(applications) || applications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có ứng viên nào ứng tuyển</h3>
                      <p className="text-gray-600">Khi có ứng viên ứng tuyển vào tin tuyển dụng của bạn, họ sẽ xuất hiện ở đây.</p>
                    </div>
                  ) : (
                    applications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{application.applicantName || 'Ứng viên'}</h3>
                            <p className="text-muted-foreground mb-3">{application.jobTitle}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                <span>Ứng tuyển: {new Date(application.appliedDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{application.location}</span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                                <span>
                                  {application.minSalary && application.maxSalary 
                                    ? `${(application.minSalary / 1000000).toFixed(0)}M - ${(application.maxSalary / 1000000).toFixed(0)}M`
                                    : 'Lương thỏa thuận'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(application.status)}
                              <span className="font-medium">
                                {getStatusText(application.status)}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              {application.cvUrl && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Xem CV
                                  </a>
                                </Button>
                              )}
                              {application.status === "PENDING" && (
                                <>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleApproveApplication(application.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Chấp nhận
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleRejectApplication(application.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Từ chối
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
