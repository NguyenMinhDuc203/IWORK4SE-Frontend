"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Clock, DollarSign, Building2, Star, Filter, Heart, Loader2 } from "lucide-react"
import { api, type JobPost, type JobCategory } from "@/lib/api"

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 12,
    totalPages: 0,
    totalElements: 0,
  })
  const [searchParams, setSearchParams] = useState({
    keywords: "",
    location: "",
    jobType: "all",
    categoryId: "all",
    page: 0,
    size: 12,
  })

  useEffect(() => {
    fetchJobs()
  }, [searchParams])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsCategoriesLoading(true)
    try {
      const response = await api.getAllJobCategories()
      if (response.data) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    } finally {
      setIsCategoriesLoading(false)
    }
  }

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const apiParams = {
        keywords: searchParams.keywords || undefined,
        location: searchParams.location || undefined,
        jobType:
          searchParams.jobType === "all"
            ? undefined
            : (searchParams.jobType as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP"),
        categoryId: searchParams.categoryId === "all" ? undefined : Number(searchParams.categoryId),
        jobStatus: "ACCEPTED" as const,
        page: searchParams.page,
        size: searchParams.size,
      }

      const response = await api.searchJobPosts(apiParams)
      console.log("[v0] Search API Response:", response)

      let paginationData
      if (response.data && response.data.content) {
        // Standard ApiResponse format
        paginationData = response.data
      } else if ((response as any).content) {
        // Direct pagination response format
        paginationData = response as any
      } else {
        console.log("[v0] Unexpected response structure:", response)
        setJobs([])
        setPagination({
          pageNumber: 0,
          pageSize: 12,
          totalPages: 0,
          totalElements: 0,
        })
        setIsLoading(false)
        return
      }

      setJobs(paginationData.content)
      setPagination({
        pageNumber: paginationData.number || paginationData.pageNumber || 0,
        pageSize: paginationData.size || paginationData.pageSize || 12,
        totalPages: paginationData.totalPages,
        totalElements: paginationData.totalElements,
      })
      console.log("[v0] Jobs set:", paginationData.content)
      console.log("[v0] Pagination set:", {
        pageNumber: paginationData.number || paginationData.pageNumber || 0,
        pageSize: paginationData.size || paginationData.pageSize || 12,
        totalPages: paginationData.totalPages,
        totalElements: paginationData.totalElements,
      })
    } catch (error) {
      console.error("[v0] Error fetching jobs:", error)
      setJobs([])
      setPagination({
        pageNumber: 0,
        pageSize: 12,
        totalPages: 0,
        totalElements: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams((prev) => ({ ...prev, page: 0 }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [key]: value,
      page: 0,
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
          <p className="text-muted-foreground">Khám phá hàng nghìn cơ hội việc làm từ các công ty công nghệ hàng đầu</p>
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
                    value={searchParams.keywords}
                    onChange={(e) => setSearchParams((prev) => ({ ...prev, keywords: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Địa điểm"
                    value={searchParams.location}
                    onChange={(e) => setSearchParams((prev) => ({ ...prev, location: e.target.value }))}
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

                <Select
                  value={searchParams.categoryId}
                  onValueChange={(value) => handleFilterChange("categoryId", value)}
                  disabled={isCategoriesLoading}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={isCategoriesLoading ? "Đang tải..." : "Danh mục"} />
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
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block group h-full"
              >
                <Card className="h-full flex flex-col justify-between hover:shadow-lg hover:border-primary/50 transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Logo */}
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                          {job.logoUrl ? (
                            <img
                              src={job.logoUrl || "/placeholder.svg"}
                              alt={job.companyName || "Company logo"}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-primary" />
                          )}
                        </div>

                        {/* Job Info */}
                        <div className="flex-1 min-w-0">
                          {/* Cố định chiều cao tiêu đề */}
                          <CardTitle className="text-base font-semibold text-ellipsis overflow-hidden line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem]">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="mt-1 text-sm truncate">
                            {job.companyName || job.employerName || "Công ty chưa cập nhật"}
                          </CardDescription>
                        </div>
                      </div>

                      {/* Save Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleSaveJob(job.id)
                        }}
                        className="text-muted-foreground hover:text-red-500 flex-shrink-0"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {job.minSalary && job.maxSalary
                          ? `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} VNĐ`
                          : job.minSalary
                            ? `Từ ${job.minSalary.toLocaleString()} VNĐ`
                            : job.maxSalary
                              ? `Đến ${job.maxSalary.toLocaleString()} VNĐ`
                              : "Thỏa thuận"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        {job.jobType === "FULL_TIME"
                          ? "Toàn thời gian"
                          : job.jobType === "PART_TIME"
                            ? "Bán thời gian"
                            : job.jobType === "CONTRACT"
                              ? "Hợp đồng"
                              : "Thực tập"}
                      </span>
                    </div>
                  </CardContent>

                  <div className="flex items-center justify-between px-6 pb-4 mt-auto">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm ml-1 font-medium">4.8</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button
              variant="outline"
              disabled={pagination.pageNumber === 0}
              onClick={() => setSearchParams((prev) => ({ ...prev, page: prev.page - 1 }))}
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
                    onClick={() => setSearchParams((prev) => ({ ...prev, page: pageNum }))}
                  >
                    {pageNum + 1}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              disabled={pagination.pageNumber >= pagination.totalPages - 1}
              onClick={() => setSearchParams((prev) => ({ ...prev, page: prev.page + 1 }))}
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
            <Button
              onClick={() =>
                setSearchParams({ keywords: "", location: "", jobType: "all", categoryId: "all", page: 0, size: 12 })
              }
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
