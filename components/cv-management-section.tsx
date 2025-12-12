"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Upload,
  Loader2,
  Eye,
  Trash2,
  Download,
  CheckCircle,
  Plus,
  File,
  FileType,
  ImageIcon,
} from "lucide-react"
import { api, type CV } from "@/lib/api"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export function CVManagementSection() {
  const [cvList, setCvList] = useState<CV[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cvToDelete, setCvToDelete] = useState<CV | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadCvList()
  }, [])

  const loadCvList = async () => {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) return

      const response = await api.getCVsByApplicant(userId)
      if (response.data && response.data.content) {
        setCvList(response.data.content)
      }
    } catch (error) {
      console.error("Error loading CVs:", error)
      setError("Không thể tải danh sách CV")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("Kích thước file không được vượt quá 10MB")
      return
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ]
    if (!allowedTypes.includes(file.type)) {
      setError("Chỉ chấp nhận file PDF, DOC, DOCX, PNG, JPG")
      return
    }

    setIsUploading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("applicantId", localStorage.getItem("userId") || "")
      formData.append("fileName", file.name)

      const response = await api.uploadCV(formData)
      if (response.data) {
        setSuccess("Tải lên CV thành công!")
        await loadCvList()
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error: any) {
      setError(error.message || "Không thể tải lên CV")
    } finally {
      setIsUploading(false)
      // Reset input
      e.target.value = ""
    }
  }

  const handleViewCV = (cv: CV) => {
    window.open(cv.url, "_blank")
  }

  const handleDownloadCV = (cv: CV) => {
    const link = document.createElement("a")
    link.href = cv.url
    link.download = cv.fileName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openDeleteDialog = (cv: CV) => {
    setCvToDelete(cv)
    setDeleteDialogOpen(true)
  }

  const handleDeleteCV = async () => {
    if (!cvToDelete) return

    setIsDeleting(true)
    setError("")

    try {
      await api.deleteCV(cvToDelete.id)
      setSuccess("Xóa CV thành công!")
      await loadCvList()
      setDeleteDialogOpen(false)
      setCvToDelete(null)
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      setError(error.message || "Không thể xóa CV")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (fileName: string) => {
    if (!fileName || typeof fileName !== "string") {
      return <File className="h-10 w-10 text-gray-500" />
    }

    const ext = fileName.split(".").pop()?.toLowerCase()

    if (ext === "pdf") {
      return <FileText className="h-10 w-10 text-red-500" />
    } else if (ext === "doc" || ext === "docx") {
      return <FileType className="h-10 w-10 text-blue-500" />
    } else if (ext === "png" || ext === "jpg" || ext === "jpeg") {
      return <ImageIcon className="h-10 w-10 text-green-500" />
    }
    return <File className="h-10 w-10 text-gray-500" />
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Quản Lý CV
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1.5">Tải lên, xem và quản lý CV của bạn</p>
        </div>
        <div>
          <input
            type="file"
            id="cv-file-upload"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <label htmlFor="cv-file-upload">
            <Button
              type="button"
              disabled={isUploading}
              className="cursor-pointer shadow-md hover:shadow-lg transition-shadow"
              asChild
            >
              <span>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Tải CV mới
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {error && (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : cvList.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cvList.map((cv) => (
              <div
                key={cv.id}
                className="group relative bg-gradient-to-br from-white via-gray-50 to-blue-50/30 border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-gray-100">
                    {getFileIcon(cv.fileName)}
                  </div>

                  {/* CV Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate mb-1.5 text-base">{cv.fileName}</h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Tải lên {format(new Date(cv.uploadedDate), "dd/MM/yyyy 'lúc' HH:mm")}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCV(cv)}
                        className="h-9 text-xs shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        Xem
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadCV(cv)}
                        className="h-9 text-xs shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Tải về
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(cv)}
                        className="h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shadow-sm hover:shadow-md transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <FileText className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có CV nào</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md leading-relaxed">
              Tải lên CV của bạn để sẵn sàng ứng tuyển các công việc phù hợp. Bạn có thể tải lên nhiều phiên bản CV khác
              nhau.
            </p>
            <label htmlFor="cv-file-upload">
              <Button
                type="button"
                size="lg"
                className="cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                asChild
              >
                <span>
                  <Upload className="mr-2 h-5 w-5" />
                  Tải CV đầu tiên
                </span>
              </Button>
            </label>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5 mt-6 shadow-sm">
          <h4 className="font-bold text-sm text-blue-900 mb-3 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Lưu ý khi tải CV:
          </h4>
          <ul className="text-xs text-blue-800 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Định dạng hỗ trợ: PDF, DOC, DOCX, PNG, JPG</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Kích thước tối đa: 10MB</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Nên đặt tên file rõ ràng (ví dụ: CV_NguyenVanA_BackendDev.pdf)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Bạn có thể tải lên nhiều CV để phù hợp với từng vị trí ứng tuyển</span>
            </li>
          </ul>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Xác nhận xóa CV</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Bạn có chắc chắn muốn xóa CV <span className="font-semibold text-gray-900">"{cvToDelete?.fileName}"</span>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="flex-1 sm:flex-none"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCV}
              disabled={isDeleting}
              className="flex-1 sm:flex-none"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa CV
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
