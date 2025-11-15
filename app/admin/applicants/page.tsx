"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Users, 
  Search,
  Filter,
  Eye,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  User,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Ban,
  Trash2,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { api, Applicant } from "@/lib/api"

export default function AdminApplicantsPage() {
  const [applicants, setApplicants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  // const [statusFilter, setStatusFilter] = useState("ALL") // TODO: Implement later
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchApplicants()
  }, [currentPage]) // Removed statusFilter dependency

  const fetchApplicants = async (retryCount = 0) => {
    try {
      setIsLoading(true)
      const requestParams = {
        keyword: searchKeyword || undefined,
        page: currentPage,
        size: 20
      }
      
      console.log(`Fetching applicants with params (attempt ${retryCount + 1}):`, requestParams)
      
      const response = await api.getAllApplicants(requestParams)
      
      console.log("Applicants response:", response)
      
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        // If data is directly an array
        setApplicants(response.data)
        setTotalPages(1)
      } else if (response.data && response.data.applicants) {
        // If data has applicants property (paged response)
        setApplicants(response.data.applicants || [])
        setTotalPages(response.data.totalPages || 0)
      } else if (response.data && response.data.content) {
        // If data has content property (alternative paged response)
        setApplicants(response.data.content || [])
        setTotalPages(response.data.totalPages || 0)
      } else {
        console.log("Unexpected response structure:", response)
        setApplicants([])
        setTotalPages(0)
      }
    } catch (error: any) {
      console.error("Error fetching applicants:", error)
      
      // Retry logic for timeout errors
      if (error?.message?.includes("timeout") && retryCount < 2) {
        console.log(`Retrying in 2 seconds... (attempt ${retryCount + 1})`)
        setTimeout(() => {
          fetchApplicants(retryCount + 1)
        }, 2000)
        return
      }
      
      setApplicants([])
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    fetchApplicants()
  }

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    try {
      await api.updateApplicantStatus(applicantId, newStatus as any)
      fetchApplicants()
    } catch (error: any) {
      console.error("Error updating applicant status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default" className="bg-green-500 text-white hover:bg-green-600">Hoạt động</Badge>
      case "INACTIVE":
        return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">Không hoạt động</Badge>
      case "BANNED":
        return <Badge variant="outline" className="bg-black text-white hover:bg-gray-800 border-black">Bị cấm</Badge>
      case "DELETED":
        return <Badge variant="destructive" className="bg-red-500 text-white hover:bg-red-600">Đã xóa</Badge>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý ứng viên</h1>
        <p className="text-gray-600 mt-2">Quản lý thông tin các ứng viên đã đăng ký</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm ứng viên..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {/* TODO: Implement status filter later */}
            {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                <SelectItem value="BANNED">Bị cấm</SelectItem>
                <SelectItem value="DELETED">Đã xóa</SelectItem>
              </SelectContent>
            </Select> */}
            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applicants List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Đang tải danh sách ứng viên...</span>
                </div>
              </CardContent>
            </Card>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : applicants.length > 0 ? (
          applicants.map((applicant, idx) => (
            <Card key={applicant.id || applicant.email || idx} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {applicant.firstName} {applicant.lastName}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {applicant.email}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          {applicant.phoneNumber && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {applicant.phoneNumber}
                            </div>
                          )}
                          {applicant.address && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {applicant.address}
                            </div>
                          )}
                          {applicant.gender && (
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {getGenderText(applicant.gender)}
                            </div>
                          )}
                          {applicant.dateOfBirth && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(applicant.dateOfBirth).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {applicant.experience && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Kinh nghiệm: </span>
                              <span className="text-sm text-gray-600">{applicant.experience}</span>
                            </div>
                          )}
                          {applicant.skills && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Kỹ năng: </span>
                              <span className="text-sm text-gray-600">{applicant.skills}</span>
                            </div>
                          )}
                          {applicant.education && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Học vấn: </span>
                              <span className="text-sm text-gray-600">{applicant.education}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 ml-4">
                    {getStatusBadge(applicant.userStatus || applicant.status || "ACTIVE")}
                    
                    <div className="flex gap-2">
                      {/* TODO: Implement statistics later */}
                      {/* <Link href={`/admin/applicants/${applicant.id}`}>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Thống kê
                        </Button>
                      </Link> */}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(applicant.id, "ACTIVE")}>
                            <Shield className="h-4 w-4 mr-2" />
                            Kích hoạt
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(applicant.id, "INACTIVE")}>
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Vô hiệu hóa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(applicant.id, "BANNED")}>
                            <Ban className="h-4 w-4 mr-2" />
                            Cấm
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(applicant.id, "DELETED")}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có ứng viên nào</h3>
              <p className="text-gray-500">Chưa có ứng viên nào phù hợp với bộ lọc của bạn</p>
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
