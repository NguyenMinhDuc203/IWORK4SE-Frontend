"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Star,
  Filter,
  Heart,
  ArrowRight,
  Loader2
} from "lucide-react"
import { api, JobPost, JobPostPageResponse, JobCategory } from "@/lib/api"

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 12,
    totalPages: 0,
    totalElements: 0
  })
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    location: "",
    jobType: "all",
    categoryId: "all",
    sort: "postedDate,desc",
    page: 0,
    size: 12
  })

  useEffect(() => {
    fetchJobs()
    fetchCategories()
  }, [searchParams])

  const fetchCategories = async () => {
    try {
      const response = await api.getAllJobCategories()
      if (response.data) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      // Convert "all" values to empty strings for API
      const apiParams = {
        keyword: searchParams.keyword,
        location: searchParams.location,
        jobType: searchParams.jobType === "all" ? "" : searchParams.jobType,
        categoryId: searchParams.categoryId === "all" ? "" : searchParams.categoryId,
        sort: searchParams.sort,
        page: searchParams.page,
        size: searchParams.size
      }

      const response = await api.getActiveJobs(apiParams)
      console.log("API Response:", response)
      
      if (response.data && response.data.content) {
        setJobs(response.data.content)
        setPagination({
          pageNumber: response.data.pageNumber,
          pageSize: response.data.pageSize,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements
        })
      } else {
        console.log("Unexpected response structure:", response)
        setJobs([])
        setPagination({
          pageNumber: 0,
          pageSize: 12,
          totalPages: 0,
          totalElements: 0
        })
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      setJobs([])
      setPagination({
        pageNumber: 0,
        pageSize: 12,
        totalPages: 0,
        totalElements: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(prev => ({ ...prev, page: 0 }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value === "all" ? "" : value,
      page: 0 // Reset to first page when filtering
    }))
  }

  const toggleSaveJob = async (jobId: string) => {
    try {
      await api.saveJob({ jobPostId: jobId })
      // Update UI to show saved state
    } catch (error) {
      console.error("Error saving job:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tìm việc làm IT</h1>
          <p className="text-muted-foreground">
            Khám phá hàng nghìn cơ hội việc làm từ các công ty công nghệ hàng đầu
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm việc làm, công ty, kỹ năng..."
                    value={searchParams.keyword}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Địa điểm"
                    value={searchParams.location}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" className="md:w-auto w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Bộ lọc:</span>
                </div>
                
                <Select value={searchParams.jobType} onValueChange={(value) => handleFilterChange("jobType", value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Loại việc làm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="FULL_TIME">Toàn thời gian</SelectItem>
                    <SelectItem value="PART_TIME">Bán thời gian</SelectItem>
                    <SelectItem value="CONTRACT">Hợp đồng</SelectItem>
                    <SelectItem value="INTERNSHIP">Thực tập</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={searchParams.categoryId} onValueChange={(value) => handleFilterChange("categoryId", value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={searchParams.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postedDate,desc">Mới nhất</SelectItem>
                    <SelectItem value="postedDate,asc">Cũ nhất</SelectItem>
                    <SelectItem value="maxSalary,desc">Lương cao nhất</SelectItem>
                    <SelectItem value="minSalary,asc">Lương thấp nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {isLoading ? "Đang tải..." : `${pagination.totalElements} việc làm được tìm thấy`}
            </h2>
            {!isLoading && pagination.totalPages > 1 && (
              <div className="text-sm text-muted-foreground">
                Trang {pagination.pageNumber + 1} / {pagination.totalPages}
              </div>
            )}
          </div>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          <Link href={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                            {job.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {job.employerName || "Công ty chưa cập nhật"}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSaveJob(job.id)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {job.minSalary && job.maxSalary 
                        ? `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} VNĐ`
                        : job.minSalary 
                          ? `Từ ${job.minSalary.toLocaleString()} VNĐ`
                          : job.maxSalary 
                            ? `Đến ${job.maxSalary.toLocaleString()} VNĐ`
                            : "Thỏa thuận"
                      }
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {job.jobType === "FULL_TIME" ? "Toàn thời gian" :
                       job.jobType === "PART_TIME" ? "Bán thời gian" :
                       job.jobType === "CONTRACT" ? "Hợp đồng" : "Thực tập"}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm ml-1">4.8</span>
                      </div>
                      <Link href={`/jobs/${job.id}`}>
                        <Button size="sm">
                          Xem chi tiết
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button 
              variant="outline" 
              disabled={pagination.pageNumber === 0}
              onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Trước
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(pagination.totalPages - 5, pagination.pageNumber - 2)) + i
                if (pageNum >= pagination.totalPages) return null
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSearchParams(prev => ({ ...prev, page: pageNum }))}
                  >
                    {pageNum + 1}
                  </Button>
                )
              })}
            </div>
            
            <Button 
              variant="outline" 
              disabled={pagination.pageNumber >= pagination.totalPages - 1}
              onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Sau
            </Button>
          </div>
        )}

        {/* No Results */}
        {!isLoading && jobs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy việc làm</h3>
            <p className="text-muted-foreground mb-4">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để có kết quả tốt hơn
            </p>
            <Button onClick={() => setSearchParams({ keyword: "", location: "", jobType: "all", categoryId: "all", sort: "postedDate,desc", page: 0, size: 12 })}>
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
