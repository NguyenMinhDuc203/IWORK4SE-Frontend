"use client"

import { useState, useEffect } from "react"
import { api, Employer, ApiError } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Building2, MapPin, Users, Globe, Phone, Mail, Eye } from "lucide-react"
import Link from "next/link"

interface EmployerPageResponse {
  employers: Employer[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalElements: number
}

export default function CompaniesPage() {
  const [employers, setEmployers] = useState<Employer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [sortBy, setSortBy] = useState("companyName")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const fetchEmployers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.getAllEmployers({
        keyword: searchKeyword || undefined,
        sort: sortBy,
        page: currentPage,
        size: 12
      })

      if (response.data) {
        setEmployers(response.data.employers || [])
        setTotalPages(response.data.totalPages || 0)
        setTotalElements(response.data.totalElements || 0)
      }
    } catch (err) {
      console.error("Error fetching employers:", err)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Có lỗi xảy ra khi tải danh sách công ty")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployers()
  }, [currentPage, sortBy])

  const handleSearch = () => {
    setCurrentPage(0)
    fetchEmployers()
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(0)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="mx-1"
        >
          {i + 1}
        </Button>
      )
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Trước
        </Button>
        {pages}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          Sau
        </Button>
      </div>
    )
  }

  if (loading && employers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải danh sách công ty...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">Danh sách công ty</h1>
        <p className="text-center text-muted-foreground mb-8">
          Khám phá các công ty hàng đầu và cơ hội việc làm tốt nhất
        </p>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm công ty..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="companyName">Tên công ty</SelectItem>
              <SelectItem value="industry">Ngành nghề</SelectItem>
              <SelectItem value="location">Địa điểm</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} className="w-full md:w-auto">
            <Search className="w-4 h-4 mr-2" />
            Tìm kiếm
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-8">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Hiển thị {employers.length} trong tổng số {totalElements} công ty
        </p>
      </div>

      {/* Companies Grid */}
      {employers.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy công ty nào</h3>
          <p className="text-muted-foreground">
            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem thêm kết quả
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employers.map((employer, index) => (
            <Card key={`${employer.companyName}-${index}`} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{employer.companyName}</CardTitle>
                    {employer.industry && (
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Building2 className="w-4 h-4 mr-2" />
                        {employer.industry}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {employer.description && (
                  <CardDescription className="mb-4 line-clamp-3">
                    {employer.description}
                  </CardDescription>
                )}
                
                <div className="space-y-2 mb-4">
                  {employer.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{employer.location}</span>
                    </div>
                  )}
                  
                  {employer.industry && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4 mr-2" />
                      <span>{employer.industry}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {employer.email && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Mail className="w-3 h-3 mr-1" />
                        <span className="truncate max-w-20">{employer.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link href={`/companies/${encodeURIComponent(employer.email || `company-${index}`)}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  )
}
