"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Plus, 
  FolderOpen, 
  Users, 
  Calendar, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserPlus
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ApplicantListsPage() {
  const router = useRouter()
  const [lists, setLists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const role = localStorage.getItem("userType")
    if (role !== "EMPLOYER") {
      router.push("/login")
    } else {
      fetchLists()
    }
  }, [router])

  const fetchLists = async () => {
    setIsLoading(true)
    try {
      const employerId = localStorage.getItem("userId")
      if (!employerId) {
        throw new Error("Không tìm thấy thông tin employer")
      }

      // TODO: Implement API call to get lists
      // const response = await api.getApplicantLists(employerId)
      // setLists(response.data)

      // Mock data for now
      setLists([
        {
          id: "LIST001",
          listName: "Java Developers",
          description: "Ứng viên có kinh nghiệm Java và Spring Boot",
          applicantCount: 5,
          createdDate: "2024-01-15",
          isDefault: true
        },
        {
          id: "LIST002", 
          listName: "Senior Candidates",
          description: "Ứng viên senior với kinh nghiệm 5+ năm",
          applicantCount: 3,
          createdDate: "2024-01-10",
          isDefault: false
        }
      ])
    } catch (e: any) {
      setError(e?.message || "Không thể tải danh sách")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh sách này?")) {
      return
    }

    try {
      // TODO: Implement API call to delete list
      // await api.deleteApplicantList(listId)
      
      setLists(lists.filter(list => list.id !== listId))
    } catch (e: any) {
      setError(e?.message || "Xóa danh sách thất bại")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/employer/applicants" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Quản lý Ứng viên
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Danh sách Ứng viên</h1>
              <p className="text-gray-600">Quản lý các danh sách ứng viên đã tạo</p>
            </div>
            <Link href="/employer/applicants/lists/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo danh sách mới
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Lists Grid */}
        {lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <Card key={list.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{list.listName}</CardTitle>
                        {list.isDefault && (
                          <Badge variant="secondary" className="text-xs">Mặc định</Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/employer/applicants/lists/${list.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem danh sách
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteList(list.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {list.description || "Không có mô tả"}
                  </CardDescription>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        Số ứng viên
                      </div>
                      <Badge variant="outline">{list.applicantCount}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        Ngày tạo
                      </div>
                      <span className="text-gray-900">{formatDate(list.createdDate)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link href={`/employer/applicants/lists/${list.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Xem danh sách
                      </Button>
                    </Link>
                    <Link href="/employer/applicants/search" className="flex-1">
                      <Button className="w-full">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Thêm ứng viên
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Chưa có danh sách nào</h3>
              <p className="text-gray-600 mb-6">
                Tạo danh sách đầu tiên để bắt đầu quản lý ứng viên của bạn.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/employer/applicants/lists/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo danh sách mới
                  </Button>
                </Link>
                <Link href="/employer/applicants/search">
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Tìm kiếm ứng viên
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
