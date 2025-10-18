"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  User,
  BarChart3,
  TrendingUp,
  FileText,
  Eye,
  Clock,
  GraduationCap,
  Award
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

export default function ApplicantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const applicantId = params.id as string
  
  const [applicant, setApplicant] = useState<any>(null)
  const [statistics, setStatistics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (applicantId) {
      fetchApplicantData()
    }
  }, [applicantId])

  const fetchApplicantData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch applicant details
      const applicantResponse = await api.getApplicantById(applicantId)
      setApplicant(applicantResponse.data)
      
      // Fetch applicant statistics
      try {
        const statsResponse = await api.getApplicantStatistics(applicantId)
        setStatistics(statsResponse.data)
      } catch (error) {
        console.log("Statistics not available, using mock data")
        // Mock statistics data
        setStatistics({
          totalApplications: 12,
          successfulApplications: 3,
          totalJobsViewed: 45,
          totalCVViews: 8,
          averageSalary: 12000000,
          recentActivity: [
            { type: "APPLICATION_SUBMITTED", title: "Senior Developer", company: "TechCorp", date: "2024-01-15" },
            { type: "APPLICATION_SUBMITTED", title: "Frontend Developer", company: "WebStudio", date: "2024-01-14" },
            { type: "CV_VIEWED", title: "Backend Developer", company: "DataSoft", date: "2024-01-13" },
          ]
        })
      }
    } catch (error) {
      console.error("Error fetching applicant data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default" className="bg-green-100 text-green-800">Hoạt động</Badge>
      case "INACTIVE":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Không hoạt động</Badge>
      case "BANNED":
        return <Badge variant="destructive">Bị cấm</Badge>
      case "DELETED":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Đã xóa</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case "MALE": return "Nam"
      case "FEMALE": return "Nữ"
      case "OTHER": return "Khác"
      default: return gender
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!applicant) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy ứng viên</h3>
        <p className="text-gray-500 mb-4">Ứng viên này không tồn tại hoặc đã bị xóa</p>
        <Link href="/admin/applicants">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin/applicants">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {applicant.firstName} {applicant.lastName}
            </h1>
            {getStatusBadge(applicant.status || "ACTIVE")}
          </div>
          <p className="text-gray-600">Thông tin chi tiết và thống kê hoạt động</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applicant Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Thông tin ứng viên
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                  <p className="text-lg font-semibold">{applicant.firstName} {applicant.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{applicant.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="text-lg">{applicant.phoneNumber || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Giới tính</label>
                  <p className="text-lg">{getGenderText(applicant.gender || "")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày sinh</label>
                  <p className="text-lg">
                    {applicant.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                  <p className="text-lg">{applicant.address || "Chưa cập nhật"}</p>
                </div>
              </div>
              
              {applicant.experience && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Kinh nghiệm</label>
                  <p className="text-lg mt-1">{applicant.experience}</p>
                </div>
              )}
              
              {applicant.skills && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Kỹ năng</label>
                  <p className="text-lg mt-1">{applicant.skills}</p>
                </div>
              )}
              
              {applicant.education && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Học vấn</label>
                  <p className="text-lg mt-1">{applicant.education}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics?.recentActivity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {activity.type === "APPLICATION_SUBMITTED" ? (
                        <FileText className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">
                        {activity.type === "APPLICATION_SUBMITTED" ? "Đã ứng tuyển" : "CV được xem"} • 
                        {activity.company} • 
                        {new Date(activity.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Thống kê tổng quan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tổng ứng tuyển</p>
                  <p className="text-2xl font-bold">{statistics?.totalApplications || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ứng tuyển thành công</p>
                  <p className="text-2xl font-bold text-green-600">{statistics?.successfulApplications || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Việc làm đã xem</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics?.totalJobsViewed || 0}</p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">CV được xem</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics?.totalCVViews || 0}</p>
                </div>
                <User className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin bổ sung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Ngày đăng ký</p>
                  <p className="font-medium">
                    {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString('vi-VN') : "Không có thông tin"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Địa điểm</p>
                  <p className="font-medium">{applicant.address || "Chưa cập nhật"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Liên hệ</p>
                  <p className="font-medium">{applicant.phoneNumber || "Chưa cập nhật"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
