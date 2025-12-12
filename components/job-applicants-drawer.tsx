"use client"

import { useEffect, useState } from "react"
import { X, Loader2, Download, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { api, type Application, normalizePageResponse } from "@/lib/api"

interface JobApplicantsDrawerProps {
  jobId: string
  jobTitle: string
  onClose: () => void
}

export function JobApplicantsDrawer({ jobId, jobTitle, onClose }: JobApplicantsDrawerProps) {
  const [applicants, setApplicants] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchApplicants()
  }, [jobId])

  const fetchApplicants = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await api.getApplicationsByJob(jobId, 0, 100)
      const normalized = normalizePageResponse<Application>(response)
      setApplicants(normalized.content || [])
    } catch (e: any) {
      setError(e?.message || "Không thể tải danh sách ứng viên")
      setApplicants([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: Application["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã chấp nhận
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Từ chối
          </Badge>
        )
      case "VIEWED":
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Eye className="h-3 w-3 mr-1" />
            Đã xem
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Chờ xử lý
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN")
    } catch {
      return dateString
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Danh sách ứng viên</h2>
              <p className="text-sm text-gray-600 line-clamp-2">{jobTitle}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 ml-4">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">Chưa có ứng viên nào</p>
              <p className="text-sm text-gray-500 mt-1">Các ứng viên ứng tuyển sẽ xuất hiện ở đây</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((applicant) => (
                <Card key={applicant.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                          {applicant.applicantName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {applicant.applicantName || "Ứng viên"}
                          </h3>
                          {getStatusBadge(applicant.status)}
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>Ứng tuyển: {formatDate(applicant.appliedDate)}</span>
                          </div>

                          {applicant.cvFileName && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Download className="h-4 w-4 text-gray-400" />
                              <span className="truncate">{applicant.cvFileName}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t">
                          {applicant.cvUrl && (
                            <a href={applicant.cvUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                              <Button variant="outline" size="sm" className="w-full bg-transparent">
                                <Download className="h-4 w-4 mr-2" />
                                Tải CV
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => (window.location.href = `/employer/applicants/${applicant.applicantId}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !error && applicants.length > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              Tổng số <span className="font-semibold text-gray-900">{applicants.length}</span> ứng viên
            </p>
          </div>
        )}
      </div>
    </>
  )
}
