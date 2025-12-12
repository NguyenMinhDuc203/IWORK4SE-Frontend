"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  DollarSign,
  Building2,
  Share2,
  Users,
  Calendar,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Briefcase,
  Flag,
  XCircle,
  Edit,
} from "lucide-react"
import { api, type JobPost } from "@/lib/api"
import { ApplyJobDialog } from "@/components/apply-job-dialog"
import { LoginDialog } from "@/components/login-dialog"
import { useSavedJobs } from "@/context/saved-jobs-context"
import { EmployerChatButton } from "@/components/employer-chat-button"

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<JobPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [employerPhone, setEmployerPhone] = useState("")
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyDetails, setCompanyDetails] = useState<any>(null)
  const [relatedJobs, setRelatedJobs] = useState<JobPost[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const [userType, setUserType] = useState<string | null>(null)

  const { isSaved, toggleSaveJob: toggleSaveJobContext } = useSavedJobs()

  useEffect(() => {
    const role = localStorage.getItem("userType")
    setUserType(role)
  }, [])

  useEffect(() => {
    if (jobId) {
      fetchJobDetails()
    }
  }, [jobId])

  useEffect(() => {
    if (job?.employerId) {
      fetchRelatedJobs(job.employerId)
    }
  }, [job?.employerId, jobId])

  const fetchJobDetails = async () => {
    setIsLoading(true)
    try {
      const response = await api.getJobById(jobId)
      setJob(response.data)

      if (response.data?.employerId) {
        const employerResponse = await api.getEmployerById(response.data.employerId)
        setEmployerPhone(employerResponse.data?.phone || "")

        if (response.data?.companyName) {
          try {
            const companyResponse = await api.getCompanyDetailByName(response.data.companyName)
            setCompanyDetails(companyResponse.data)
            setCompanyId(response.data.companyName)
          } catch (err) {
            console.error("Error fetching company details:", err)
          }
        }
      }
    } catch (error: any) {
      setError(error.message || "Không thể tải thông tin việc làm")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRelatedJobs = async (employerId: string) => {
    setLoadingRelated(true)
    try {
      const response = await api.getJobsByEmployer(employerId, 0, 4)
      const filtered = response.data?.content?.filter((j: JobPost) => j.id !== jobId).slice(0, 4) || []
      setRelatedJobs(filtered)
    } catch (error) {
      console.error("Error fetching related jobs:", error)
      setRelatedJobs([])
    } finally {
      setLoadingRelated(false)
    }
  }

  const formatJobDescription = (description: string) => {
    if (!description) {
      return ""
    }
    const withBold = description.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    const withLineBreaks = withBold.replace(/\n/g, "<br />")
    return withLineBreaks
  }

  const formatSalaryShort = (salary: number) => {
    if (salary >= 1000000) {
      const millions = salary / 1000000
      return `${Number(millions.toFixed(1))} Triệu`
    }
    return salary.toLocaleString()
  }

  const formatMinSalaryShort = (salary: number) => {
    if (salary >= 1000000) {
      const millions = salary / 1000000
      return `${Number(millions.toFixed(1))}`
    }
    return salary.toLocaleString()
  }

  const handleApply = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setShowLoginDialog(true)
    } else {
      setShowApplyDialog(true)
    }
  }

  const handleLoginSuccess = () => {
    setShowApplyDialog(true)
  }

  const handleSaveJob = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setShowLoginDialog(true)
      return
    }

    try {
      await toggleSaveJobContext(jobId)
      setSuccess(isSaved(jobId) ? "Đã bỏ lưu việc làm" : "Đã lưu việc làm thành công!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error saving job:", error)
      setError("Không thể lưu việc làm. Vui lòng thử lại.")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Xem việc làm ${job?.title} tại iWork4SE`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setSuccess("Đã sao chép link vào clipboard!")
    }
  }

  const handleViewCompany = () => {
    if (companyId) {
      router.push(`/companies/${encodeURIComponent(companyId)}`)
    }
  }

  const handleApproveJob = async () => {
    if (!job) return
    try {
      setIsUpdatingStatus(true)
      await api.updateJobPostStatus(job.id, "ACCEPTED")
      setSuccess("Đã chấp nhận tin tuyển dụng thành công!")
      setTimeout(() => setSuccess(""), 3000)
      fetchJobDetails()
    } catch (error: any) {
      setError(error.message || "Không thể chấp nhận tin tuyển dụng. Vui lòng thử lại.")
      setTimeout(() => setError(""), 3000)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleRejectJob = async () => {
    if (!job) return
    try {
      setIsUpdatingStatus(true)
      await api.updateJobPostStatus(job.id, "REJECTED")
      setSuccess("Đã từ chối tin tuyển dụng thành công!")
      setTimeout(() => setSuccess(""), 3000)
      fetchJobDetails()
    } catch (error: any) {
      setError(error.message || "Không thể từ chối tin tuyển dụng. Vui lòng thử lại.")
      setTimeout(() => setError(""), 3000)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!job || !selectedStatus) return
    try {
      setIsUpdatingStatus(true)
      await api.updateJobPostStatus(job.id, selectedStatus)
      setSuccess("Đã cập nhật trạng thái thành công!")
      setTimeout(() => setSuccess(""), 3000)
      setShowStatusDialog(false)
      setSelectedStatus("")
      fetchJobDetails()
    } catch (error: any) {
      setError(error.message || "Không thể cập nhật trạng thái. Vui lòng thử lại.")
      setTimeout(() => setError(""), 3000)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "Đã duyệt"
      case "PENDING":
        return "Chờ duyệt"
      case "REJECTED":
        return "Từ chối"
      case "EXPIRED":
        return "Hết hạn"
      case "DELETED":
        return "Đã xóa"
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy việc làm</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href="/jobs">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/jobs">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách việc làm
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      {job.logoUrl ? (
                        <img
                          src={job.logoUrl || "/placeholder.svg"}
                          alt={job.companyName || "Company logo"}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="text-lg">
                        {job.employerName || "Công ty chưa cập nhật"}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {job.location}
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {job.jobType === "INTERNSHIP"
                      ? "Internship"
                      : job.jobType === "FRESHER"
                        ? "Fresher"
                        : job.jobType === "JUNIOR"
                          ? "Junior"
                          : job.jobType === "SENIOR"
                            ? "Senior"
                            : job.jobType === "MANAGER"
                              ? "Manager"
                              : "Không xác định"}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {job.vacancies ? `${job.vacancies} vị trí` : "Không giới hạn"}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="h-4 w-6 mr-1" />
                    {job.minSalary && job.maxSalary
                      ? `${formatMinSalaryShort(job.minSalary)} - ${formatSalaryShort(job.maxSalary)} VNĐ`
                      : job.minSalary
                        ? `Từ ${formatSalaryShort(job.minSalary)} VNĐ`
                        : job.maxSalary
                          ? `Đến ${formatSalaryShort(job.maxSalary)} VNĐ`
                          : "Thỏa thuận"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Đăng ngày: {new Date(job.postedDate).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Hạn nộp: {new Date(job.closingDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mô tả công việc</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatJobDescription(job.description) }}
                />
              </CardContent>
            </Card>

            {job.jobPosition && (
              <Card>
                <CardHeader>
                  <CardTitle>Vị trí công việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{job.jobPosition}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {job.experience && (
              <Card>
                <CardHeader>
                  <CardTitle>Kinh nghiệm yêu cầu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{job.experience}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card >
              <CardContent className="p-6">
                {success && (
                  <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4 py-3.5">
                  {/* Admin actions */}
                  {userType === "ADMIN" && (
                    <>
                      {job.jobStatus === "PENDING" && (
                        <div className="space-y-2">
                          <Button
                            onClick={handleApproveJob}
                            className="w-full"
                            size="lg"
                            disabled={isUpdatingStatus}
                          >
                            {isUpdatingStatus ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Chấp nhận
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={handleRejectJob}
                            className="w-full"
                            size="lg"
                            variant="destructive"
                            disabled={isUpdatingStatus}
                          >
                            {isUpdatingStatus ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Từ chối
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      {job.jobStatus === "ACCEPTED" && (
                        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                          <DialogTrigger asChild>
                            <Button className="w-full mb-2" size="lg" variant="outline">
                              <Edit className="h-4 w-4 mr-2" />
                              Sửa trạng thái
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Sửa trạng thái tin tuyển dụng</DialogTitle>
                              <DialogDescription>
                                Chọn trạng thái mới cho tin tuyển dụng này
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                                  <SelectItem value="REJECTED">Từ chối</SelectItem>
                                  <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                                  <SelectItem value="DELETED">Đã xóa</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowStatusDialog(false)
                                    setSelectedStatus("")
                                  }}
                                >
                                  Hủy
                                </Button>
                                <Button onClick={handleUpdateStatus} disabled={!selectedStatus || isUpdatingStatus}>
                                  {isUpdatingStatus ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Đang cập nhật...
                                    </>
                                  ) : (
                                    "Cập nhật"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </>
                  )}

                  {/* Applicant actions - only show if not admin or employer */}
                  {userType !== "ADMIN" && userType !== "EMPLOYER" && (
                    <>
                      <Button onClick={handleApply} className="w-full mb-2" size="lg">
                        Ứng tuyển ngay
                      </Button>
                      {job.employerId && employerPhone && (
                        <EmployerChatButton
                          employerId={job.employerId}
                          employerName={job.employerName}
                          employerPhone={employerPhone}
                        />
                      )}
                      <div className="flex space-x-2">
                        <Button variant="outline" className="flex-1 bg-transparent" onClick={handleSaveJob}>
                          <Flag className={`h-4 w-4 mr-2 ${isSaved(jobId) ? "fill-yellow-500 text-yellow-500" : ""}`} />
                          {isSaved(jobId) ? "Đã lưu" : "Lưu việc làm"}
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent" onClick={handleShare}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Chia sẻ
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Share button - show for all users */}
                  {(userType === "ADMIN" || userType === "EMPLOYER") && (
                    <Button variant="outline" className="w-full bg-transparent" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Chia sẻ
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin công ty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {companyDetails?.logoUrl ? (
                        <img
                          src={companyDetails.logoUrl || "/placeholder.svg"}
                          alt={companyDetails.companyName}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {companyDetails?.companyName || job.employerName || "Công ty chưa cập nhật"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {companyDetails?.industry || job.categoryName || "Công nghệ thông tin"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {companyDetails?.description && (
                      <p className="text-muted-foreground line-clamp-2">{companyDetails.description}</p>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {companyDetails?.totalEmployers || 0} nhân viên
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {companyDetails?.location || "Việt Nam"}
                    </div>
                  </div>

                  <Button onClick={handleViewCompany} variant="outline" className="w-full bg-transparent">
                    Xem trang công ty
                  </Button>


                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Việc làm tương tự</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingRelated ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : relatedJobs.length > 0 ? (
                    relatedJobs.map((similarJob) => (
                      <Link key={similarJob.id} href={`/jobs/${similarJob.id}`}>

                        <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-l-4 border-l-blue-600 mb-2">
                          <CardContent className="p-4">
                            <div className="flex gap-3 mb-3">
                              {similarJob.logoUrl && (
                                <div className="w-12 h-12 rounded flex-shrink-0 bg-muted flex items-center justify-center overflow-hidden">
                                  <img
                                    src={similarJob.logoUrl || "/placeholder.svg"}
                                    alt={similarJob.companyName || "Company logo"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm line-clamp-2 text-blue-600 hover:underline">
                                  {similarJob.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {similarJob.minSalary && similarJob.maxSalary
                                    ? `${formatMinSalaryShort(similarJob.minSalary)} - ${formatSalaryShort(similarJob.maxSalary)} VNĐ`
                                    : similarJob.minSalary
                                      ? `Từ ${formatSalaryShort(similarJob.minSalary)} VNĐ`
                                      : similarJob.maxSalary
                                        ? `Đến ${formatSalaryShort(similarJob.maxSalary)} VNĐ`
                                        : "Thỏa thuận"}
                                </p>
                              </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="line-clamp-1">{similarJob.location}</span>
                            </div>

                            {/* Tags: Style màu xám (gray-100) */}
                            <div className="flex flex-wrap gap-2">
                              {similarJob.jobType && (
                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {similarJob.jobType === "INTERNSHIP"
                                    ? "Internship"
                                    : similarJob.jobType === "FRESHER"
                                      ? "Fresher"
                                      : similarJob.jobType === "JUNIOR"
                                        ? "Junior"
                                        : similarJob.jobType === "SENIOR"
                                          ? "Senior"
                                          : similarJob.jobType === "MANAGER"
                                            ? "Manager"
                                            : "Không xác định"}
                                </span>
                              )}
                              {similarJob.experience && (
                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {similarJob.experience}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Không có công việc tương tự
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ApplyJobDialog open={showApplyDialog} onOpenChange={setShowApplyDialog} jobId={jobId} jobTitle={job.title} />

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} onLoginSuccess={handleLoginSuccess} />
    </div>
  )
}
