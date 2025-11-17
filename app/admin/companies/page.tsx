"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Building2, 
  Search,
  Filter,
  Eye,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Users,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Ban,
  Trash2,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { api, Employer } from "@/lib/api"

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  // const [statusFilter, setStatusFilter] = useState("ALL") // TODO: Implement later
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchCompanies()
  }, [currentPage]) // Removed statusFilter dependency

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching companies with params:", {
        keyword: searchKeyword || undefined,
        page: currentPage,
        size: 10
      })
      
      const response = await api.getAllEmployers({
        keyword: searchKeyword || undefined,
        page: currentPage,
        size: 10
      })
      
      console.log("Companies response:", response)
      
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        // If data is directly an array
        setCompanies(response.data)
        setTotalPages(1)
      } else if (response.data && response.data.employers) {
        // If data has employers property (paged response)
        setCompanies(response.data.employers || [])
        setTotalPages(response.data.totalPages || 0)
      } else if (response.data && response.data.content) {
        // If data has content property (alternative paged response)
        setCompanies(response.data.content || [])
        setTotalPages(response.data.totalPages || 0)
      } else {
        console.log("Unexpected response structure:", response)
        setCompanies([])
        setTotalPages(0)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      setCompanies([])
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    fetchCompanies()
  }

  const handleStatusChange = async (companyId: string, newStatus: string) => {
    try {
      await api.updateEmployerStatus(companyId, newStatus as any)
      fetchCompanies()
    } catch (error) {
      console.error("Error updating company status:", error)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý công ty</h1>
        <p className="text-gray-600 mt-2">Quản lý thông tin các công ty đã đăng ký</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm công ty..."
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

      {/* Companies List */}
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
        ) : companies.length > 0 ? (
          companies.map((company, idx) => (
            <Card key={company.id || company.email || idx} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt={company.companyName}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {company.companyName}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {company.firstName} {company.lastName}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          {company.location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {company.location}
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {company.phone}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {company.email}
                          </div>
                          {company.industry && (
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              {company.industry}
                            </div>
                          )}
                        </div>

                        {company.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {company.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 ml-4">
                    {getStatusBadge(company.userStatus || company.status || "ACTIVE")}
                    
                    <div className="flex gap-2">
                      {/* TODO: Implement statistics later */}
                      {/* <Link href={`/admin/companies/${company.id}`}>
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
                          <DropdownMenuItem onClick={() => handleStatusChange(company.id, "ACTIVE")}>
                            <Shield className="h-4 w-4 mr-2" />
                            Kích hoạt
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(company.id, "INACTIVE")}>
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Vô hiệu hóa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(company.id, "BANNED")}>
                            <Ban className="h-4 w-4 mr-2" />
                            Cấm
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(company.id, "DELETED")}>
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
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có công ty nào</h3>
              <p className="text-gray-500">Chưa có công ty nào phù hợp với bộ lọc của bạn</p>
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
