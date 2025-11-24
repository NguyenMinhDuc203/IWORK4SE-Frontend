"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ApiError } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, MapPin, Mail, Phone, Briefcase, Users, ArrowLeft, Globe } from "lucide-react"
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

  const fetchCompanyDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCompanyDetailByName(companyName);
      if (response.data) {
        setCompany(response.data);
      } else {
        setError("Không tìm thấy công ty này");
      }

    } catch (err: any) {
      console.error("Error fetching company detail:", err);


      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Có lỗi xảy ra khi tải thông tin công ty");
      }
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-background px-20">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/companies">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách công ty
          </Button>
        </Link>
      </div>

      {/* Company Hero Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {company.logoUrl ? (
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-white shadow-lg flex items-center justify-center border">
                  <Image
                    src={company.logoUrl || "/placeholder.svg"}
                    alt={`${company.companyName} logo`}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center shadow-lg">
                  <Building2 className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{company.companyName}</h1>

              <div className="flex flex-wrap gap-6 mb-4">
                {company.industry && (
                  <div className="flex items-center text-base text-muted-foreground">
                    <Briefcase className="w-5 h-5 mr-2 text-primary" />
                    <span>{company.industry}</span>
                  </div>
                )}
                {company.location && (
                  <div className="flex items-center text-base text-muted-foreground">
                    <MapPin className="w-5 h-5 mr-2 text-primary" />
                    <span>{company.location}</span>
                  </div>
                )}
                <div className="flex items-center text-base text-muted-foreground">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  <span>{company.totalEmployers} người liên hệ</span>
                </div>
                <div className="flex items-center text-base text-muted-foreground">
                  <Globe className="w-5 h-5 mr-2 text-primary" />
                  <span>{company.totalJobPosts} công việc</span>
                </div>
              </div>

              {company.description && (
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">{company.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Employers & Jobs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Persons Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-primary" />
                Người liên hệ ({company.employers.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.employers.map((employer) => (
                  <Card key={employer.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {employer.firstName} {employer.lastName}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {employer.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                            <a href={`mailto:${employer.email}`} className="text-primary hover:underline truncate">
                              {employer.email}
                            </a>
                          </div>
                        )}
                        {employer.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                            <a href={`tel:${employer.phone}`} className="text-primary hover:underline">
                              {employer.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {employer.jobPosts.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">{employer.jobPosts.length} công việc đã đăng</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Job Listings Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Briefcase className="w-6 h-6 mr-3 text-primary" />
                Danh sách công việc ({company.totalJobPosts})
              </h2>

              <div className="space-y-4">
                {company.employers.flatMap((employer) =>
                  employer.jobPosts.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg text-primary hover:underline">{job.title}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {employer.firstName} {employer.lastName}
                              </p>
                            </div>
                            {job.logoUrl && (
                              <div className="w-12 h-12 rounded ml-4 bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                                <Image
                                  src={job.logoUrl || "/placeholder.svg"}
                                  alt={job.companyName}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span className="text-muted-foreground">{job.location}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-muted-foreground">
                                {job.minSalary && job.maxSalary
                                  ? `${(job.minSalary / 1000000).toFixed(0)}tr - ${(job.maxSalary / 1000000).toFixed(0)}tr`
                                  : "Thỏa thuận"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )),
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin công ty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tên công ty</p>
                  <p className="font-semibold">{company.companyName}</p>
                </div>
                {company.industry && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Ngành nghề</p>
                    <p className="font-semibold">{company.industry}</p>
                  </div>
                )}
                {company.location && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Địa chỉ</p>
                    <p className="font-semibold">{company.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tổng số công việc</p>
                  <p className="font-semibold">{company.totalJobPosts}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Người liên hệ</p>
                  <p className="font-semibold">{company.totalEmployers}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
