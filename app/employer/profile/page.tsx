"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Industry, Globe, Mail, Phone, Calendar, User, Edit } from "lucide-react"
import { api, Employer } from "@/lib/api"

export default function EmployerProfilePage() {
  const [employer, setEmployer] = useState<Employer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const userId = localStorage.getItem("userId")
      if (userId) {
        const response = await api.getEmployerById(userId)
        if (response.data) {
          setEmployer(response.data)
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setError("Không thể tải thông tin hồ sơ")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadProfile}>Thử lại</Button>
        </div>
      </div>
    )
  }

  if (!employer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin hồ sơ</p>
          <Button onClick={() => window.location.href = "/employer/profile/edit"}>
            Tạo hồ sơ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="text-primary hover:underline">
            Trang chủ
          </Link>
          {" / "}
          <Link href="/employer/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          {" / "}
          <span>Hồ sơ công ty</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Hồ sơ công ty
          </h1>
          <Link href="/employer/profile/edit">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                    {employer.companyName?.charAt(0) || "C"}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{employer.companyName}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {employer.location && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {employer.location}
                        </Badge>
                      )}
                      {employer.industry && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Industry className="h-3 w-3" />
                          {employer.industry}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {employer.description && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Về công ty</h3>
                    <p className="text-gray-700 leading-relaxed">{employer.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin liên hệ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{employer.firstName} {employer.lastName}</p>
                    <p className="text-sm text-gray-600">Người đại diện</p>
                  </div>
                </div>

                {employer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{employer.email}</p>
                      <p className="text-sm text-gray-600">Email</p>
                    </div>
                  </div>
                )}

                {employer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{employer.phone}</p>
                      <p className="text-sm text-gray-600">Điện thoại</p>
                    </div>
                  </div>
                )}

                {employer.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{employer.address}</p>
                      <p className="text-sm text-gray-600">Địa chỉ</p>
                    </div>
                  </div>
                )}

                {employer.birthday && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{new Date(employer.birthday).toLocaleDateString('vi-VN')}</p>
                      <p className="text-sm text-gray-600">Ngày sinh</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
