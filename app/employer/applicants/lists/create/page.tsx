"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Plus, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CreateApplicantListPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    listName: "",
    description: "",
  })

  useEffect(() => {
    const role = localStorage.getItem("userType")
    if (role !== "EMPLOYER") {
      router.push("/login")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const employerId = localStorage.getItem("userId")
      if (!employerId) {
        throw new Error("Không tìm thấy thông tin employer")
      }

      // TODO: Implement API call to create list
      // const response = await api.createApplicantList({
      //   employerId,
      //   listName: form.listName,
      //   description: form.description
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to lists page
      router.push("/employer/applicants/lists")
    } catch (e: any) {
      setError(e?.message || "Tạo danh sách thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/employer/applicants" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Quản lý Ứng viên
          </Link>
          <h1 className="text-3xl font-bold mb-2">Tạo Danh sách Ứng viên Mới</h1>
          <p className="text-gray-600">Tạo danh sách để tổ chức và quản lý ứng viên theo từng vị trí hoặc dự án</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Thông tin danh sách
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="listName">Tên danh sách *</Label>
                <Input
                  id="listName"
                  placeholder="Ví dụ: Java Developers, Senior Candidates, Internship 2024..."
                  value={form.listName}
                  onChange={(e) => setForm({ ...form, listName: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500">
                  Đặt tên mô tả rõ ràng để dễ dàng nhận biết và quản lý
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả (tùy chọn)</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn về mục đích của danh sách này..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  Thêm mô tả để ghi nhớ mục đích và tiêu chí của danh sách
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo danh sách
                    </>
                  )}
                </Button>
                <Link href="/employer/applicants">
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">💡 Mẹo tạo danh sách hiệu quả</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600">
                <strong>Đặt tên rõ ràng:</strong> Sử dụng tên mô tả vị trí, dự án hoặc tiêu chí cụ thể
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600">
                <strong>Phân loại theo vai trò:</strong> Tạo danh sách riêng cho từng vị trí (Frontend, Backend, Fullstack...)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600">
                <strong>Theo dõi tiến trình:</strong> Sử dụng danh sách để theo dõi trạng thái liên hệ và phỏng vấn
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
