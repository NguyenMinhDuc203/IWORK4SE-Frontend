"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Upload, Loader2, Eye, Trash2, Download, CheckCircle, Plus } from "lucide-react"
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
    const ext = fileName.split(".").pop()?.toLowerCase()
    return <FileText className="h-10 w-10 text-blue-500" />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl">Quản Lý CV</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Tải lên, xem và quản lý CV của bạn</p>
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
            <Button type="button" disabled={isUploading} className="cursor-pointer" asChild>
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

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : cvList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cvList.map((cv) => (
              <div
                key={cv.id}
                className="group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:border-primary hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* File Icon */}
                  <div className="flex-shrink-0 w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    {getFileIcon(cv.fileName)}
                  </div>

                  {/* CV Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate mb-1">{cv.fileName}</h4>
                    <p className="text-xs text-gray-500 mb-3">
                      Tải lên {format(new Date(cv.uploadedDate), "dd/MM/yyyy 'lúc' HH:mm")}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCV(cv)}
                        className="h-8 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Xem
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadCV(cv)}
                        className="h-8 text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Tải về
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(cv)}
                        className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có CV nào</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Tải lên CV của bạn để sẵn sàng ứng tuyển các công việc phù hợp. Bạn có thể tải lên nhiều phiên bản CV khác
              nhau.
            </p>
            <label htmlFor="cv-file-upload">
              <Button type="button" size="lg" className="cursor-pointer" asChild>
                <span>
                  <Upload className="mr-2 h-5 w-5" />
                  Tải CV đầu tiên
                </span>
              </Button>
            </label>
          </div>
        )}

        {/* Upload Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-sm text-blue-900 mb-2">Lưu ý khi tải CV:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Định dạng hỗ trợ: PDF, DOC, DOCX, PNG, JPG</li>
            <li>• Kích thước tối đa: 10MB</li>
            <li>• Nên đặt tên file rõ ràng (ví dụ: CV_NguyenVanA_BackendDev.pdf)</li>
            <li>• Bạn có thể tải lên nhiều CV để phù hợp với từng vị trí ứng tuyển</li>
          </ul>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa CV</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa CV "{cvToDelete?.fileName}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteCV} disabled={isDeleting}>
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
