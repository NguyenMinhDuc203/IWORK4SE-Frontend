"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ApiError } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, MapPin, Briefcase, ArrowLeft, Mail, Phone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"

interface EmployerWithJobs {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
  location: string
  industry: string
  description: string
  logoUrl: string
  userStatus: string
  jobPosts: any[]
}

interface CompanyDetail {
  companyName: string
  industry: string
  location: string
  logoUrl: string
  description: string
  employers: EmployerWithJobs[]
  totalEmployers: number
  totalJobPosts: number
}

export default function CompanyDetailPage() {
  const params = useParams()
  const companyName = decodeURIComponent(params.id as string)

  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [jobsDisplayCount, setJobsDisplayCount] = useState(4)

  const fetchCompanyDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getCompanyDetailByName(companyName)
      if (response.data) {
        setCompany(response.data)
      } else {
        setError("Không tìm thấy công ty này")
      }
    } catch (err: any) {
      console.error("Error fetching company detail:", err)

      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Có lỗi xảy ra khi tải thông tin công ty")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (companyName) {
      fetchCompanyDetail()
    }
  }, [companyName])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải thông tin công ty...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link href="/companies">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách công ty
          </Button>
        </Link>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy công ty</h3>
          <p className="text-muted-foreground mb-6">Công ty bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <Link href="/companies">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách công ty
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get all job posts from all employers
  const allJobs = company.employers.flatMap((employer) =>
    employer.jobPosts.map((job) => ({ ...job, employerName: `${employer.firstName} ${employer.lastName}` })),
  )

  const displayedJobs = allJobs.slice(0, jobsDisplayCount)

  return (
    <div className="min-h-screen bg-background px-20">
      {/* Back Button */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/companies">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        </div>
      </div>

      {/* Company Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-6 items-start">
            {/* Logo */}
            <div className="flex-shrink-0">
              {company.logoUrl ? (
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-white shadow-md flex items-center justify-center border">
                  <Image
                    src={company.logoUrl || "/placeholder.svg"}
                    alt={`${company.companyName} logo`}
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center shadow-md">
                  <Building2 className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Company Info & Actions */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{company.companyName}</h1>
                  <p className="text-muted-foreground text-lg">{company.industry}</p>
                </div>
              </div>

              {/* Location and Field */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">{company.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">{company.industry}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Listings */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Việc đang tuyển ({company.totalJobPosts})</h2>

            {allJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {displayedJobs.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-l-4 border-l-blue-600">
                        <CardContent className="p-5">
                          {/* Job Header */}
                          <div className="flex gap-3 mb-4">
                            {job.logoUrl && (
                              <div className="w-12 h-12 rounded flex-shrink-0 bg-muted flex items-center justify-center overflow-hidden">
                                <Image
                                  src={job.logoUrl || "/placeholder.svg"}
                                  alt={job.companyName}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base line-clamp-2 text-blue-600 hover:underline">
                                {job.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {job.minSalary && job.maxSalary
                                  ? `${(job.minSalary / 1000000).toFixed(0)} - ${(job.maxSalary / 1000000).toFixed(0)} triệu VND`
                                  : "Thỏa thuận"}
                              </p>
                            </div>
                          </div>

                          {/* Location and Tags */}
                          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>{job.location}</span>
                          </div>

                          {/* Job Details Tags */}
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {job.jobType || "Toàn thời gian"}
                            </span>
                            {job.experience && (
                              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {job.experience}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {jobsDisplayCount < allJobs.length && (
                  <div className="mt-8 text-center">
                    <Button
                      onClick={() => setJobsDisplayCount((prev) => prev + 4)}
                      variant="outline"
                      className="w-full py-6 text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      ▼ Xem thêm việc làm
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="py-12 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Công ty này hiện không có việc tuyển dụng</p>
              </Card>
            )}
          </div>

          {/* Right Column - Company Info */}
          <div className="space-y-6 mt-14">
            {/* Company Information Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Thông tin công ty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                <div>
                  <div className="flex items-start gap-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Giới thiệu công ty</p>
                      <p className="text-sm font-medium">{company.description}</p>
                    </div>
                  </div>
                </div>

                {company.employers && company.employers.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">Người liên hệ</p>
                    <div className="space-y-4">
                      {company.employers.map((employer, index) => (
                        <div key={employer.id} className="pb-3 last:pb-0 last:border-b-0 border-b">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {employer.firstName} {employer.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <a href={`mailto:${employer.email}`} className="hover:text-blue-600 break-all">
                                {employer.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <a href={`tel:${employer.phone}`} className="hover:text-blue-600">
                                {employer.phone}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Office Locations */}
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">Danh sách chi nhánh:</p>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p className="font-medium">Địa chỉ tại Việt Nam:</p>
                      <p className="text-muted-foreground">{company.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
