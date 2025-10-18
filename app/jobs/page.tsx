"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Briefcase, DollarSign, Building2, Filter, Flag, Loader2 } from "lucide-react"
import { api, type JobPost, type JobCategory } from "@/lib/api"
import { useSavedJobs } from "@/context/saved-jobs-context"

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

  const { isSaved, toggleSaveJob: toggleSaveJobContext } = useSavedJobs()

  useEffect(() => {
    fetchJobs()
  }, [searchParams])

  interface Category {
    id: number
    categoryName: string
  }

  const hardcodedCategories: Category[] = [
    { id: 4, categoryName: "Software Engineer" },
    { id: 5, categoryName: "Backend Developer" },
    { id: 6, categoryName: "Frontend Developer" },
    { id: 7, categoryName: "Mobile Developer" },
    { id: 8, categoryName: "Fullstack Developer" },
    { id: 9, categoryName: "Blockchain Engineer" },
    { id: 10, categoryName: "Software Testing" },
    { id: 11, categoryName: "Software Tester (Automation & Manual)" },
    { id: 12, categoryName: "Automation Tester" },
    { id: 13, categoryName: "Manual Tester" },
    { id: 14, categoryName: "Game Tester" },
    { id: 15, categoryName: "QA Engineer" },
    { id: 16, categoryName: "Process Quality Assurance (PQA)" },
    { id: 17, categoryName: "Artificial Intelligence (AI)" },
    { id: 18, categoryName: "AI Engineer" },
    { id: 19, categoryName: "AI Researcher" },
    { id: 20, categoryName: "Data Labeling (Gán nhãn dữ liệu)" },
    { id: 21, categoryName: "Data Science" },
    { id: 22, categoryName: "Data Analyst" },
    { id: 23, categoryName: "Data Engineer" },
    { id: 24, categoryName: "Data Scientist" },
    { id: 25, categoryName: "IT Infrastructure and Operations" },
    { id: 26, categoryName: "IT Helpdesk/IT support" },
    { id: 27, categoryName: "DevOps Engineer" },
    { id: 28, categoryName: "Network Engineer" },
    { id: 29, categoryName: "System Engineer" },
    { id: 30, categoryName: "System Administrator" },
    { id: 31, categoryName: "Database Administrator (DBA)" },
    { id: 32, categoryName: "Cloud Engineer" },
    { id: 33, categoryName: "Kỹ thuật IT" },
    { id: 34, categoryName: "Information Security" },
    { id: 35, categoryName: "Chuyên viên Cyber Security" },
    { id: 36, categoryName: "Chuyên viên IT Security" },
    { id: 37, categoryName: "Chiến lược và phân tích bảo mật" },
    { id: 38, categoryName: "Quản trị và vận hành bảo mật" },
    { id: 39, categoryName: "Tuân thủ và kiểm toán bảo mật" },
    { id: 40, categoryName: "Phòng chống lừa đảo và an ninh mạng" },
    { id: 41, categoryName: "Bảo mật ứng dụng và phát triển" },
    { id: 42, categoryName: "Mã hóa và bảo mật dữ liệu" },
    { id: 43, categoryName: "Kiểm thử và đánh giá bảo mật" },
    { id: 44, categoryName: "IoT/Embedded Engineer" },
    { id: 45, categoryName: "Kỹ sư IoT (IoT Engineer)" },
    { id: 46, categoryName: "Embedded Engineer/Lập trình nhúng" },
    { id: 47, categoryName: "IT Project Management" },
    { id: 48, categoryName: "IT Project Manager" },
    { id: 49, categoryName: "Scrum Master" },
    { id: 50, categoryName: "Kỹ sư cầu nối BrSE" },
    { id: 51, categoryName: "IT Comtor" },
    { id: 52, categoryName: "IT Management/Specialist" },
    { id: 53, categoryName: "Software Architect" },
    { id: 54, categoryName: "System Architect" },
    { id: 55, categoryName: "Solution Architect" },
    { id: 56, categoryName: "Technical Leader" },
    { id: 57, categoryName: "Technical Manager" },
    { id: 58, categoryName: "Head of Engineering" },
    { id: 59, categoryName: "Technical Director" },
    { id: 60, categoryName: "Chief Technology Officer (CTO)" },
    { id: 61, categoryName: "Chief Information Officer (CIO)" },
    { id: 62, categoryName: "Software Design" },
    { id: 63, categoryName: "UI/UX Design" },
    { id: 64, categoryName: "Thiết kế đồ họa (Graphic Design)" },
    { id: 65, categoryName: "Illustration" },
    { id: 66, categoryName: "Animation Design" },
    { id: 67, categoryName: "Interaction Designer" },
    { id: 68, categoryName: "3D Modeler" },
    { id: 69, categoryName: "Product Management" },
    { id: 70, categoryName: "Product Owner/Product Manager" },
    { id: 71, categoryName: "Business Analyst (Phân tích nghiệp vụ)" },
    { id: 72, categoryName: "Product Analyst/Research" },
    { id: 73, categoryName: "Game Development" },
    { id: 74, categoryName: "Game Developer" },
    { id: 75, categoryName: "Concept Artist" },
    { id: 76, categoryName: "Game Design" },
    { id: 77, categoryName: "AR/VR Developer" },
    { id: 78, categoryName: "Vị trí Game Development khác" },
    { id: 79, categoryName: "Sales IT Phần mềm" },
    { id: 80, categoryName: "Kinh doanh phần mềm" },
    { id: 81, categoryName: "Kinh doanh Domain/Hosting/Server" },
    { id: 82, categoryName: "Sales IT Phần mềm khác" },
    { id: 83, categoryName: "Công nghệ thông tin khác" },
    { id: 84, categoryName: "IT Consultant" },
    { id: 85, categoryName: "GIS Engineer" },
    { id: 86, categoryName: "Bán hàng kỹ thuật IT" },
    { id: 87, categoryName: "Chuyên môn Công nghệ thông tin khác" },
    { id: 88, categoryName: "Business Analyst (BA)" },
  ]

  // useEffect(() => {
  //   fetchCategories()
  // }, [])

  // const fetchCategories = async () => {
  //   setIsCategoriesLoading(true)
  //   try {
  //     const response = await api.getAllJobCategories()
  //     if (response.data) {
  //       setCategories(response.data)
  //     }
  //   } catch (error) {
  //     console.error("Error fetching categories:", error)
  //     setCategories([])
  //   } finally {
  //     setIsCategoriesLoading(false)
  //   }
  // }
  const formatSalaryShort = (salary: number) => {
    if (salary >= 1000000) {
      const millions = salary / 1000000
      return `${Number(millions.toFixed(1))} Triệu`
    }

    return salary.toLocaleString()
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
            : (searchParams.jobType as "INTERNSHIP" | "FRESHER" | "JUNIOR" | "SENIOR" | "MANAGER"),
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

  const toggleSaveJob = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const token = localStorage.getItem("token")
    if (!token) {
      alert("Vui lòng đăng nhập để lưu việc làm")
      return
    }

    try {
      await toggleSaveJobContext(jobId)
    } catch (error) {
      console.error("Error saving job:", error)
      alert("Không thể lưu việc làm. Vui lòng thử lại.")
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
                  <SelectTrigger className="w-[180px] ">
                    <SelectValue placeholder="Loại việc làm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="all"
                      className="focus:bg-transparent hover:bg-transparent focus:text-[#1e7efc] hover:text-[#1e7efc]"
                    >
                      Tất cả
                    </SelectItem>
                    <SelectItem
                      value="INTERNSHIP"
                      className="focus:bg-transparent hover:bg-transparent focus:text-[#1e7efc] hover:text-[#1e7efc]"
                    >
                      Internship
                    </SelectItem>
                    <SelectItem
                      value="FRESHER"
                      className="focus:bg-transparent hover:bg-transparent focus:text-[#1e7efc] hover:text-[#1e7efc]"
                    >
                      Fresher
                    </SelectItem>
                    <SelectItem
                      value="JUNIOR"
                      className="focus:bg-transparent hover:bg-transparent focus:text-[#1e7efc] hover:text-[#1e7efc]"
                    >
                      Junior
                    </SelectItem>
                    <SelectItem
                      value="SENIOR"
                      className="focus:bg-transparent hover:bg-transparent focus:text-[#1e7efc] hover:text-[#1e7efc]"
                    >
                      Senior
                    </SelectItem>
                    <SelectItem
                      value="MANAGER"
                      className="focus:bg-transparent hover:bg-transparent focus:text-[#1e7efc] hover:text-[#1e7efc]"
                    >
                      Manager
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={searchParams.categoryId}
                  onValueChange={(value) => handleFilterChange("categoryId", value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>

                    {hardcodedCategories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                        className="focus:bg-transparent hover:bg-transparent focus:text-[#1e7efc] hover:text-[#1e7efc]"
                      >
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
                  <CardHeader className="pb-3 min-h-[120px]">
                    <div className="flex items-start justify-between gap-3 h-full">
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
                        <div className="w-4/5 min-w-0 flex flex-col">
                          <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors h-12 leading-6">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="mt-1 text-sm">
                            {job.companyName || job.employerName || "Công ty chưa cập nhật"}
                          </CardDescription>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => toggleSaveJob(job.id, e)}
                        className={`flex-shrink-0 h-8 w-8 p-0 ${
                          isSaved(job.id)
                            ? "text-yellow-500 hover:text-yellow-600"
                            : "text-muted-foreground hover:text-yellow-500"
                        }`}
                      >
                        <Flag className={`h-4 w-4 ${isSaved(job.id) ? "fill-yellow-500" : ""}`} />
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
                          ? `${formatSalaryShort(job.minSalary)} - ${formatSalaryShort(job.maxSalary)} VNĐ`
                          : job.minSalary
                            ? `Từ ${formatSalaryShort(job.minSalary)} VNĐ`
                            : job.maxSalary
                              ? `Đến ${formatSalaryShort(job.maxSalary)} VNĐ`
                              : "Thỏa thuận"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        {job.jobType === "INTERNSHIP"
                          ? "Internship"
                          : job.jobType === "FRESHER"
                            ? "Fresher"
                            : job.jobType === "JUNIOR"
                              ? "Junior"
                              : job.jobType === "SENIOR"
                                ? "Senior"
                                : job.jobType === "MANAGER"
                                  ? "Manager"
                                  : "Không xác định"}
                      </span>
                    </div>
                  </CardContent>
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
