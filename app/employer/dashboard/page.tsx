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
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { api, JobPost, Application } from "@/lib/api"

export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userType, setUserType] = useState<"APPLICANT" | "EMPLOYER" | null>(null)

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
      // Mock data for now
      setJobs([
        {
          id: "1",
          title: "Senior Frontend Developer",
          description: "We are looking for a senior frontend developer...",
          requirements: "5+ years experience with React...",
          responsibilities: "Lead frontend development...",
          location: "Hanoi",
          salary: 30000000,
          jobType: "FULL_TIME",
          status: "ACTIVE",
          employerId: "1",
          categoryId: 1,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z"
        },
        {
          id: "2",
          title: "Backend Developer",
          description: "Join our backend team...",
          requirements: "Experience with Node.js...",
          responsibilities: "Develop APIs...",
          location: "Ho Chi Minh City",
          salary: 25000000,
          jobType: "FULL_TIME",
          status: "ACTIVE",
          employerId: "1",
          categoryId: 1,
          createdAt: "2024-01-05T00:00:00Z",
          updatedAt: "2024-01-05T00:00:00Z"
        }
      ])

      setApplications([
        {
          id: "1",
          applicantId: "1",
          jobPostId: "1",
          cvId: "1",
          coverLetter: "I am very interested in this position...",
          status: "PENDING",
          appliedAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z"
        },
        {
          id: "2",
          applicantId: "2",
          jobPostId: "1",
          cvId: "2",
          coverLetter: "I have relevant experience...",
          status: "APPROVED",
          appliedAt: "2024-01-10T14:30:00Z",
          updatedAt: "2024-01-12T09:15:00Z"
        }
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
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
                  <p className="text-2xl font-bold">{applications.length}</p>
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
                    {applications.filter(app => app.status === "PENDING").length}
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
                  {applications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">Nguyễn Văn A</h3>
                          <p className="text-sm text-muted-foreground mb-2">Senior Frontend Developer</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(application.appliedAt).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              Hà Nội
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              5 năm kinh nghiệm
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
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Xem CV
                        </Button>
                        {application.status === "PENDING" && (
                          <>
                            <Button size="sm">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Chấp nhận
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
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
      </div>
    </div>
  )
}
