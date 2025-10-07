"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { api, Employer, ApiError } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, MapPin, Phone, Mail, Globe, ArrowLeft, Users, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CompanyDetailPage() {
  const params = useParams()
  const companyEmail = decodeURIComponent(params.id as string)
  
  const [employer, setEmployer] = useState<Employer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployerDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Since we don't have a direct API to get employer by email,
      // we'll need to get all employers and find the one with matching email
      const response = await api.getAllEmployers({ page: 0, size: 1000 })
      
      if (response.data && response.data.employers) {
        const foundEmployer = response.data.employers.find(emp => emp.email === companyEmail)
        if (foundEmployer) {
          setEmployer(foundEmployer)
        } else {
          setError("Không tìm thấy công ty với email này")
        }
      }
    } catch (err) {
      console.error("Error fetching employer detail:", err)
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
    if (companyEmail) {
      fetchEmployerDetail()
    }
  }, [companyEmail])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải thông tin công ty...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
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

  if (!employer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy công ty</h3>
          <p className="text-muted-foreground mb-4">
            Công ty bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
          </p>
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
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/companies">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách công ty
          </Button>
        </Link>
      </div>

      {/* Company Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {employer.logoUrl ? (
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <Image
                  src={employer.logoUrl}
                  alt={`${employer.companyName} logo`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Company Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{employer.companyName}</h1>
            {employer.industry && (
              <div className="flex items-center text-lg text-muted-foreground mb-4">
                <Building2 className="w-5 h-5 mr-2" />
                {employer.industry}
              </div>
            )}
            
            {employer.description && (
              <p className="text-muted-foreground text-lg leading-relaxed">
                {employer.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Company Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin công ty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
                <div className="space-y-3">
                  {employer.email && (
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a 
                          href={`mailto:${employer.email}`}
                          className="text-primary hover:underline"
                        >
                          {employer.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {employer.phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Điện thoại</p>
                        <a 
                          href={`tel:${employer.phone}`}
                          className="text-primary hover:underline"
                        >
                          {employer.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Địa chỉ</h3>
                <div className="space-y-3">
                  {employer.address && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 mr-3 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Địa chỉ</p>
                        <p className="text-muted-foreground">{employer.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {employer.location && (
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Khu vực</p>
                        <p className="text-muted-foreground">{employer.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tên công ty</p>
                  <p className="font-semibold">{employer.companyName}</p>
                </div>
                
                {employer.industry && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ngành nghề</p>
                    <p className="font-semibold">{employer.industry}</p>
                  </div>
                )}
                
                {employer.location && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Khu vực</p>
                    <p className="font-semibold">{employer.location}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {employer.email && (
                <Button asChild className="w-full">
                  <a href={`mailto:${employer.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Gửi email
                  </a>
                </Button>
              )}
              
              {employer.phone && (
                <Button asChild variant="outline" className="w-full">
                  <a href={`tel:${employer.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Gọi điện
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
