"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Search,
  Plus,
  FolderOpen,
  UserPlus,
  Eye,
  Calendar,
  Loader2,
  MapPin,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { api, Application, PageMeta, normalizePageResponse } from "@/lib/api"
import { ApplicantContactButton } from "@/components/applicant-contact-button"

type StatusFilter = "ALL" | Application["status"]

const STATUS_OPTIONS: Array<{ label: string; value: StatusFilter }> = [
  { label: "Tất cả trạng thái", value: "ALL" },
  { label: "Chờ xem xét", value: "PENDING" },
  { label: "Đã xem", value: "VIEWED" },
  { label: "Đã chấp nhận", value: "APPROVED" },
  { label: "Đã từ chối", value: "REJECTED" },
  { label: "Đã rút đơn", value: "WITHDRAWN" },
]

const PAGE_SIZE = 10

const statusLabels: Record<Application["status"], string> = {
  PENDING: "Chờ xem xét",
  VIEWED: "Đã xem",
  APPROVED: "Đã chấp nhận",
  REJECTED: "Đã từ chối",
  WITHDRAWN: "Đã rút đơn",
}

const statusStyles: Record<Application["status"], string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  VIEWED: "bg-blue-50 text-blue-700 border border-blue-200",
  APPROVED: "bg-green-50 text-green-700 border border-green-200",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
  WITHDRAWN: "bg-gray-50 text-gray-600 border border-gray-200",
}

const formatDate = (value?: string | null) => {
  if (!value) return "-"
  const date = new Date(value)
  if (isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("vi-VN")
}

const formatSalaryRange = (minSalary?: number, maxSalary?: number) => {
  if (typeof minSalary !== "number" || typeof maxSalary !== "number" || (!minSalary && !maxSalary)) {
    return "Thoả thuận"
  }
  const toMillions = (value: number) => Math.round(value / 1_000_000)
  return `${toMillions(minSalary)} - ${toMillions(maxSalary)} triệu`
}

// Wrapper component to handle lazy email fetching for ApplicantContactButton
function ApplicantContactButtonWrapper({
  applicantId,
  applicantName,
  cachedEmail,
  onFetchEmail,
}: {
  applicantId: string
  applicantName: string
  cachedEmail?: string
  onFetchEmail: () => Promise<string | null>
}) {
  const [email, setEmail] = useState<string | null>(cachedEmail || null)
  const [isLoadingEmail, setIsLoadingEmail] = useState(false)

  // Update email when cachedEmail changes
  useEffect(() => {
    if (cachedEmail && !email) {
      setEmail(cachedEmail)
    }
  }, [cachedEmail, email])

  // Fetch email proactively when component mounts if not cached
  useEffect(() => {
    if (!email && !isLoadingEmail) {
      setIsLoadingEmail(true)
      onFetchEmail().then((fetchedEmail) => {
        if (fetchedEmail) {
          setEmail(fetchedEmail)
        }
        setIsLoadingEmail(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  if (!email && isLoadingEmail) {
    return (
      <Button variant="outline" size="sm" disabled className="w-full">
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        Đang tải...
      </Button>
    )
  }

  if (!email) {
    return (
      <Button variant="outline" size="sm" disabled className="w-full">
        Không có email
      </Button>
    )
  }

  return (
    <ApplicantContactButton
      applicantId={applicantId}
      applicantName={applicantName}
      applicantEmail={email}
      triggerSize="sm"
      triggerVariant="outline"
    />
  )
}

export default function ApplicantManagementPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<string | null>(null)
  const [stats, setStats] = useState({ savedApplicants: 0, listsCreated: 0, contacted: 0 })
  const [applications, setApplications] = useState<Application[]>([])
  const [applicationsPage, setApplicationsPage] = useState<PageMeta>({
    pageNumber: 0,
    pageSize: PAGE_SIZE,
    totalPages: 0,
    totalElements: 0,
  })
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAppLoading, setIsAppLoading] = useState(true)
  const [applicationsError, setApplicationsError] = useState<string | null>(null)
  const [actioning, setActioning] = useState<Record<string, boolean>>({})
  const [applicantEmails, setApplicantEmails] = useState<Record<string, string>>({})
  const [loadingEmails, setLoadingEmails] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const role = localStorage.getItem("userType")
    setUserType(role)
    if (role !== "EMPLOYER") {
      router.push("/login")
      return
    }
    loadStats()
  }, [router])

  const loadStats = async () => {
    try {
      const employerId = localStorage.getItem("userId")
      if (!employerId) return
      const listsRes = await api.getApplicantListsByEmployer(employerId)
      const lists = listsRes.data || []
      const listsCount = lists.length
      const totalRes = await api.getAllSavedApplicantsByEmployer(employerId, 0, 1)
      const savedApplicants = totalRes.data?.totalElements ?? 0
      const contactedCounts = await Promise.all(
        lists.map((l: any) => api.getApplicantsByListAndContactStatus(l.id, true, 0, 1)),
      )
      const contacted = contactedCounts.reduce((sum, r: any) => sum + (r.data?.totalElements ?? 0), 0)
      setStats({ savedApplicants, listsCreated: listsCount, contacted })
    } catch (e) {
      // ignore stats error
    }
  }

  const fetchApplications = useCallback(
    async (page = 0) => {
      if (userType !== "EMPLOYER") return
      setIsAppLoading(true)
      setApplicationsError(null)
      try {
        const employerId = localStorage.getItem("userId")
        if (!employerId) throw new Error("Không tìm thấy thông tin employer")

        const response = await api.getApplicationsByEmployer(employerId, {
          page,
          size: PAGE_SIZE,
          status: statusFilter === "ALL" ? undefined : statusFilter,
        })

        const parsed = normalizePageResponse<Application>(response)
        setApplications(parsed.content)
        setApplicationsPage({
          pageNumber: parsed.pageNumber,
          pageSize: parsed.pageSize || PAGE_SIZE,
          totalPages: parsed.totalPages,
          totalElements: parsed.totalElements,
        })
      } catch (error) {
        console.error("Failed to load applications:", error)
        setApplications([])
        setApplicationsError(
          error instanceof Error ? error.message : "Không thể tải danh sách ứng viên. Vui lòng thử lại.",
        )
      } finally {
        setIsAppLoading(false)
      }
    },
    [statusFilter, userType],
  )

  useEffect(() => {
    if (userType === "EMPLOYER") {
      fetchApplications(0)
    }
  }, [userType, statusFilter, fetchApplications])

  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) {
      return applications
    }
    const keyword = searchTerm.trim().toLowerCase()
    return applications.filter((application) => {
      const candidateName = application.applicantName?.toLowerCase() || ""
      const jobTitle = application.jobTitle?.toLowerCase() || ""
      const jobPosition = application.jobPosition?.toLowerCase() || ""
      return (
        candidateName.includes(keyword) ||
        jobTitle.includes(keyword) ||
        jobPosition.includes(keyword)
      )
    })
  }, [applications, searchTerm])

  const totalPages = Math.max(applicationsPage.totalPages, Math.ceil(applicationsPage.totalElements / PAGE_SIZE) || 1)
  const canPrev = applicationsPage.pageNumber > 0
  const canNext = applicationsPage.pageNumber < totalPages - 1

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && canPrev) {
      fetchApplications(applicationsPage.pageNumber - 1)
    }
    if (direction === "next" && canNext) {
      fetchApplications(applicationsPage.pageNumber + 1)
    }
  }

  const handleViewCV = async (app: Application) => {
    try {
      if (app.cvUrl) {
        window.open(app.cvUrl, "_blank")
        return
      }
      const res = await api.getApplicationById(app.id)
      const url = res?.data?.cvUrl
      if (url) {
        window.open(url, "_blank")
      } else {
        alert("Không tìm thấy CV cho ứng viên này")
      }
    } catch {
      alert("Không thể mở CV. Vui lòng thử lại sau.")
    }
  }

  const setLoadingFor = (id: string, value: boolean) => {
    setActioning((prev) => ({ ...prev, [id]: value }))
  }

  const fetchApplicantEmail = async (applicantId: string): Promise<string | null> => {
    // Return cached email if available
    if (applicantEmails[applicantId]) {
      return applicantEmails[applicantId]
    }

    // Return null if already loading
    if (loadingEmails[applicantId]) {
      return null
    }

    try {
      setLoadingEmails((prev) => ({ ...prev, [applicantId]: true }))
      const response = await api.getApplicantById(applicantId)
      const email = response.data?.email || ""
      if (email) {
        setApplicantEmails((prev) => ({ ...prev, [applicantId]: email }))
      }
      return email || null
    } catch (error) {
      console.error("Failed to fetch applicant email:", error)
      return null
    } finally {
      setLoadingEmails((prev => {
        const updated = { ...prev }
        delete updated[applicantId]
        return updated
      }))
    }
  }

  const handleApprove = async (id: string) => {
    try {
      setLoadingFor(id, true)
      await api.approveApplication(id)
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: "APPROVED" } : a)))
    } catch {
      alert("Không thể chấp nhận ứng tuyển. Vui lòng thử lại.")
    } finally {
      setLoadingFor(id, false)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setLoadingFor(id, true)
      await api.rejectApplication(id)
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: "REJECTED" } : a)))
    } catch {
      alert("Không thể từ chối ứng tuyển. Vui lòng thử lại.")
    } finally {
      setLoadingFor(id, false)
    }
  }

  if (userType !== "EMPLOYER") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 px-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý Ứng viên</h1>
        <p className="text-gray-600">Tìm kiếm, quản lý và theo dõi ứng viên tiềm năng</p>
      </div>

      {/* Main Functions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

      {/* Applications Table */}
      <Card className="mb-8">
        <CardHeader className="space-y-4 lg:flex lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Ứng viên đã ứng tuyển</CardTitle>
            <CardDescription>
              Theo dõi trạng thái xử lý của tất cả ứng viên ứng tuyển vào việc làm của bạn
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Input
              placeholder="Tìm theo tên, vị trí hoặc việc làm"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full lg:w-64"
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => fetchApplications(applicationsPage.pageNumber)} disabled={isAppLoading}>
              {isAppLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {applicationsError && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {applicationsError}
            </div>
          )}
          <div className="overflow-x-auto">
            {isAppLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tải danh sách ứng viên...
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Users className="mx-auto mb-4 h-12 w-12" />
                <p className="font-medium mb-1">Chưa có ứng viên nào phù hợp</p>
                <p className="text-sm">
                  Thử thay đổi bộ lọc hoặc quay lại khi có ứng viên mới.
                </p>
              </div>
            ) : (
              <div className="min-w-[960px] divide-y">
                <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <div>Ứng viên</div>
                  <div>Việc làm</div>
                  <div>Ngày ứng tuyển</div>
                  <div>Trạng thái</div>
                  <div>Hành động</div>
                </div>
                {filteredApplications.map((application) => (
                  <div key={application.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 py-4">
                    <div>
                      <p className="font-medium">{application.applicantName}</p>
                      <p className="text-sm text-muted-foreground">
                        {application.jobPosition || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{application.jobTitle}</p>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{application.location || "Không xác định"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatSalaryRange(application.minSalary, application.maxSalary)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(application.appliedDate)}</span>
                      </div>
                    </div>
                    <div>
                      <Badge className={`text-xs font-medium ${statusStyles[application.status]}`}>
                        {statusLabels[application.status]}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewCV(application)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Xem CV
                      </Button>
                      <ApplicantContactButtonWrapper
                        applicantId={application.applicantId}
                        applicantName={application.applicantName}
                        onFetchEmail={() => fetchApplicantEmail(application.applicantId)}
                        cachedEmail={applicantEmails[application.applicantId]}
                      />
                      {application.status === "PENDING" && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(application.id)} disabled={!!actioning[application.id]}>
                            {actioning[application.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Chấp nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(application.id)}
                            disabled={!!actioning[application.id]}
                          >
                            {actioning[application.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-1" />
                            )}
                            Từ chối
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>
              Hiển thị {filteredApplications.length} / {applicationsPage.totalElements} ứng viên · Trang{" "}
              {applicationsPage.totalElements === 0 ? 0 : applicationsPage.pageNumber + 1}/{Math.max(totalPages, 1)}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange("prev")}
                disabled={!canPrev || isAppLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange("next")}
                disabled={!canNext || isAppLoading}
              >
                Sau
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
