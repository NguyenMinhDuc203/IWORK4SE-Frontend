"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ApplicantContactButton } from "@/components/applicant-contact-button"
import { api, type SavedApplicantList } from "@/lib/api"
import { ArrowLeft, Users, Calendar, Trash2 } from "lucide-react"

export default function ApplicantListDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const listId = params?.id
  const [list, setList] = useState<SavedApplicantList | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [showApplicantDialog, setShowApplicantDialog] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null)

  useEffect(() => {
    const role = localStorage.getItem("userType")
    if (role !== "EMPLOYER") {
      router.push("/login")
      return
    }
    if (listId) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, page])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError("")
      const [listRes, itemsRes] = await Promise.all([
        api.getApplicantListById(listId!),
        api.getApplicantsInList(listId!, page, size),
      ])
      setList(listRes.data)
      const pageData = itemsRes.data
      // SavedApplicantPageResponse structure
      setItems(pageData.savedApplicants || [])
      setTotalPages(pageData.totalPages || 0)
    } catch (e: any) {
      setError(e?.message || "Không thể tải danh sách")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (savedApplicantId: string) => {
    if (!confirm("Xóa ứng viên này khỏi danh sách?")) return
    try {
      await api.removeApplicantFromList(savedApplicantId)
      setItems(prev => prev.filter((x: any) => x.id !== savedApplicantId))
    } catch (e: any) {
      setError(e?.message || "Không thể xóa ứng viên khỏi danh sách")
    }
  }

  const openApplicant = async (applicantId: string) => {
    try {
      setError("")
      const res = await api.getApplicantById(applicantId)
      setSelectedApplicant(res.data)
      setShowApplicantDialog(true)
    } catch (e: any) {
      setError(e?.message || "Không thể tải thông tin ứng viên")
    }
  }

  const markContacted = async (savedApplicantId: string) => {
    try {
      await api.updateSavedApplicantContactStatus(savedApplicantId, true)
      setItems(prev =>
        prev.map((x: any) => (x.id === savedApplicantId ? { ...x, isContacted: true } : x)),
      )
    } catch (e: any) {
      setError(e?.message || "Không thể cập nhật trạng thái liên hệ")
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 px-20">
      <div className="max-w-6xl mx-auto">
        <Link href="/employer/applicants/lists" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {list && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {list.listName}
                {list.isDefault && <Badge variant="secondary" className="text-xs">Mặc định</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Số ứng viên: <span className="font-medium">{list.applicantCount ?? items.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ngày tạo: <span className="font-medium">{formatDate(list.createdDate)}</span>
                </div>
                <div>
                  Mô tả: {list.description || "Không có mô tả"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {items.map((item: any) => (
            <Card key={item.id} className="hover:shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="cursor-pointer" onClick={() => openApplicant(item.applicantId)}>
                  <div className="font-medium flex items-center gap-2">
                    {item.applicantName || "Ứng viên"}
                    {item.isContacted && <Badge variant="secondary">Đã liên hệ</Badge>}
                  </div>
                  <div className="text-sm text-gray-600">{item.applicantEmail}</div>
                  <div className="text-sm text-gray-600 mt-1">Ngày lưu: {formatDate(item.savedDate)}</div>
                  {item.notes && <div className="text-sm mt-1">Ghi chú: {item.notes}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <ApplicantContactButton
                    applicantId={item.applicantId}
                    applicantName={item.applicantName || "Ứng viên"}
                    applicantEmail={item.applicantEmail}
                    onContact={() => markContacted(item.id)}
                  />
                  <Button variant="outline" className="text-red-600" onClick={() => handleRemove(item.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa khỏi danh sách
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
              Trước
            </Button>
            <div className="px-3 py-2 text-sm">Trang {page + 1} / {totalPages}</div>
            <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Sau
            </Button>
          </div>
        )}
      </div>
      <ApplicantDetailDialog open={showApplicantDialog} onOpenChange={setShowApplicantDialog} applicant={selectedApplicant} />
    </div>
  )
}

// Applicant detail dialog
// Rendered at the bottom to avoid layout shift
export function ApplicantDetailDialog({ open, onOpenChange, applicant }: { open: boolean; onOpenChange: (v: boolean) => void; applicant: any | null }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thông tin ứng viên</DialogTitle>
        </DialogHeader>
        {applicant ? (
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Họ tên:</span> {applicant.firstName} {applicant.lastName}</div>
            <div><span className="font-medium">Email:</span> {applicant.email}</div>
            <div><span className="font-medium">SĐT:</span> {applicant.phone}</div>
            <div><span className="font-medium">Địa chỉ:</span> {applicant.address}</div>
            <div><span className="font-medium">Giới tính:</span> {applicant.gender}</div>
            <div><span className="font-medium">Kinh nghiệm:</span> {applicant.yearsOfExperience} năm</div>
            <div><span className="font-medium">Trường:</span> {applicant.universityName}</div>
            <div><span className="font-medium">Chuyên ngành:</span> {applicant.major}</div>
            <div><span className="font-medium">Bằng cấp:</span> {applicant.degreeLevel}</div>
            <div><span className="font-medium">GPA:</span> {applicant.gpa}</div>
            {Array.isArray(applicant.skills) && applicant.skills.length > 0 && (
              <div>
                <div className="font-medium">Kỹ năng:</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {applicant.skills.map((s: string, i: number) => (
                    <Badge key={i} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-600">Đang tải...</div>
        )}
      </DialogContent>
    </Dialog>
  )
}


