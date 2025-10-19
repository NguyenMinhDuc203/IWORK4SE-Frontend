"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Briefcase, 
  FileText, 
  Heart, 
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { api, Applicant, JobPost } from "@/lib/api"

export default function DashboardPage() {
  const [applications, setApplications] = useState<Applicant[]>([])
  const [savedJobs, setSavedJobs] = useState<JobPost[]>([])
  const [recentJobs, setRecentJobs] = useState<JobPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userType, setUserType] = useState<"APPLICANT" | "EMPLOYER" | null>(null)

  useEffect(() => {
    const userTypeFromStorage = localStorage.getItem("userType") as "APPLICANT" | "EMPLOYER" | null
    setUserType(userTypeFromStorage)
    
    if (userTypeFromStorage === "APPLICANT") {
      fetchApplicantData()
    } else if (userTypeFromStorage === "EMPLOYER") {
      // Redirect to employer dashboard
      window.location.href = "/employer/dashboard"
    } else {
      // Redirect to login
      window.location.href = "/login"
    }
  }, [])

  const fetchApplicantData = async () => {
    setIsLoading(true)
    try {
      // Fetch applications, saved jobs, and recent jobs
      // For now, using mock data
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
          applicantId: "1",
          jobPostId: "2",
          cvId: "1",
          coverLetter: "I have relevant experience...",
          status: "APPROVED",
          appliedAt: "2024-01-10T14:30:00Z",
          updatedAt: "2024-01-12T09:15:00Z"
        }
      ])

      setSavedJobs([
        {
          id: "3",
          title: "Senior React Developer",
          description: "We are looking for a senior React developer...",
          requirements: "5+ years experience with React...",
          responsibilities: "Lead frontend development...",
          location: "Ho Chi Minh City",
          salary: 30000000,
          jobType: "FULL_TIME",
          status: "ACTIVE",
          employerId: "1",
          categoryId: 1,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z"
        }
      ])

      setRecentJobs([
        {
          id: "4",
          title: "Full Stack Developer",
          description: "Join our dynamic team...",
          requirements: "Experience with React and Node.js...",
          responsibilities: "Develop web applications...",
          location: "Hanoi",
          salary: 25000000,
          jobType: "FULL_TIME",
          status: "ACTIVE",
          employerId: "2",
          categoryId: 1,
          createdAt: "2024-01-20T00:00:00Z",
          updatedAt: "2024-01-20T00:00:00Z"
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
        return "Chờ phản hồi"
      case "APPROVED":
        return "Được chấp nhận"
      case "REJECTED":
        return "Bị từ chối"
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
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Quản lý ứng tuyển và theo dõi tiến trình tìm việc của bạn
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{applications.length}</p>
                  <p className="text-sm text-muted-foreground">Đơn ứng tuyển</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === "APPROVED").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Được chấp nhận</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{savedJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Việc đã lưu</p>
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
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-sm text-muted-foreground">H�� sơ hoàn thiện</p>
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
                  <CardTitle>Đơn ứng tuyển gần đây</CardTitle>
                  <CardDescription>
                    Theo dõi trạng thái các đơn ứng tuyển của bạn
                  </CardDescription>
                </div>
                <Link href="/applications">
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
                          <h3 className="font-semibold mb-1">Senior Frontend Developer</h3>
                          <p className="text-sm text-muted-foreground mb-2">TechCorp Vietnam</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              Hà Nội
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              25-40 triệu
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(application.appliedAt).toLocaleDateString('vi-VN')}
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
                <Link href="/jobs" className="block">
                  <Button className="w-full justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Tìm việc làm
                  </Button>
                </Link>
                <Link href="/profile/cv" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Quản lý CV
                  </Button>
                </Link>
                <Link href="/saved-jobs" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Việc đã lưu
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recommended Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Việc làm gợi ý</CardTitle>
                <CardDescription>
                  Dựa trên hồ sơ của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="font-semibold mb-1">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">TechCorp Vietnam</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </div>
                        <Link href={`/jobs/${job.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </Link>
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
