"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Search, 
  Plus, 
  FolderOpen, 
  UserPlus, 
  Eye,
  Calendar,
  Filter,
  Star
} from "lucide-react"
import { api } from "@/lib/api"

export default function ApplicantManagementPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<string | null>(null)
  const [stats, setStats] = useState({ savedApplicants: 0, listsCreated: 0, contacted: 0 })

  useEffect(() => {
    const role = localStorage.getItem("userType")
    setUserType(role)
    if (role !== "EMPLOYER") {
      router.push("/login")
    }
    if (role === "EMPLOYER") {
      loadStats()
    }
  }, [router])

  const loadStats = async () => {
    try {
      const employerId = localStorage.getItem("userId")
      if (!employerId) return
      // Get lists
      const listsRes = await api.getApplicantListsByEmployer(employerId)
      const lists = listsRes.data || []
      const listsCount = lists.length
      // Get total saved applicants across employer (page size 1 to read totalElements)
      const totalRes = await api.getAllSavedApplicantsByEmployer(employerId, 0, 1)
      const savedApplicants = totalRes.data?.totalElements ?? 0
      // Sum contacted across lists using page size 1 per list
      const contactedCounts = await Promise.all(
        lists.map((l: any) => api.getApplicantsByListAndContactStatus(l.id, true, 0, 1))
      )
      const contacted = contactedCounts.reduce((sum, r: any) => sum + (r.data?.totalElements ?? 0), 0)
      setStats({ savedApplicants, listsCreated: listsCount, contacted })
    } catch (e) {
      // Silent fail; keep defaults
    }
  }

  if (userType !== "EMPLOYER") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý Ứng viên</h1>
        <p className="text-gray-600">Tìm kiếm, quản lý và theo dõi ứng viên tiềm năng</p>
      </div>

      {/* Main Functions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Tìm kiếm ứng viên */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/employer/applicants/search">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Tìm kiếm Ứng viên</CardTitle>
                  <CardDescription>Tìm kiếm ứng viên phù hợp với yêu cầu</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Sử dụng bộ lọc nâng cao để tìm kiếm ứng viên theo kỹ năng, kinh nghiệm, học vấn...
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Elasticsearch</Badge>
                <Badge variant="outline">Bộ lọc nâng cao</Badge>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Tạo danh sách mới */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/employer/applicants/lists/create">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Tạo Danh sách Mới</CardTitle>
                  <CardDescription>Tạo danh sách ứng viên mới</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Tạo danh sách để tổ chức và quản lý ứng viên theo từng vị trí hoặc dự án.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Tổ chức</Badge>
                <Badge variant="outline">Quản lý</Badge>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Danh sách đã lưu */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/employer/applicants/lists">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Danh sách Đã Lưu</CardTitle>
                  <CardDescription>Xem và quản lý các danh sách ứng viên</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Xem tất cả danh sách ứng viên đã tạo, quản lý và theo dõi tiến trình.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Danh sách</Badge>
                <Badge variant="outline">Theo dõi</Badge>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.savedApplicants}</p>
                <p className="text-sm text-gray-600">Ứng viên đã lưu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.listsCreated}</p>
                <p className="text-sm text-gray-600">Danh sách đã tạo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.contacted}</p>
                <p className="text-sm text-gray-600">Đã liên hệ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có hoạt động</h3>
            <p className="text-gray-600 mb-4">
              Bắt đầu bằng cách tìm kiếm ứng viên hoặc tạo danh sách mới.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/employer/applicants/search">
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm ứng viên
                </Button>
              </Link>
              <Link href="/employer/applicants/lists/create">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo danh sách
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
