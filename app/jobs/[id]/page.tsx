"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Star,
  Heart,
  Share2,
  Users,
  Calendar,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Briefcase 
} from "lucide-react"
import { api, type JobPost } from "@/lib/api"
import { ApplyJobDialog } from "@/components/apply-job-dialog"
import { LoginDialog } from "@/components/login-dialog"
import { log } from "console"

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string


  const [job, setJob] = useState<JobPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  useEffect(() => {
    if (jobId) {
      fetchJobDetails()
    }
  }, [jobId])

  const fetchJobDetails = async () => {
    setIsLoading(true)
    try {
      const response = await api.getJobById(jobId)
      setJob(response.data)
    } catch (error: any) {
      setError(error.message || "Không thể tải thông tin việc làm")
    } finally {
      setIsLoading(false)
    }
  }
  const formatJobDescription = (description: string) => {
    if (!description) {
      return "";
    }
    const withBold = description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const withLineBreaks = withBold.replace(/\n/g, '<br />');

    return withLineBreaks;
  };
  const formatSalaryShort = (salary: number) => {

    if (salary >= 1000000) {
      const millions = salary / 1000000;
      return `${Number(millions.toFixed(1))} Triệu`;
    }

    return salary.toLocaleString();
  };

  const formatMinSalaryShort = (salary: number) => {

    if (salary >= 1000000) {
      const millions = salary / 1000000;
      return `${Number(millions.toFixed(1))}`;
    }

    return salary.toLocaleString();
  };

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
    try {
      await api.saveJob({ jobPostId: jobId })
      setIsSaved(true)
    } catch (error) {
      console.error("Error saving job:", error)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/jobs">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách việc làm
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
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
                  {/* <div className="flex items-center space-x-2">
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="ml-1">4.8</span>
                    </div>
                  </div> */}
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

                {/* Additional Info */}
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

                {/* <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">React</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">TypeScript</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Next.js</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">Node.js</span>
                </div> */}
              </CardContent>
            </Card>

            {/* Job Description */}
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

            {/* Job Position */}
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

            {/* Experience */}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card>
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

                <div className="space-y-4">
                  <Button onClick={handleApply} className="w-full" size="lg">
                    Ứng tuyển ngay
                  </Button>

                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={handleSaveJob}>
                      <Heart className={`h-4 w-4 mr-2 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                      {isSaved ? "Đã lưu" : "Lưu việc làm"}
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Chia sẻ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin công ty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{job.employerName || "Công ty chưa cập nhật"}</h3>
                      <p className="text-sm text-muted-foreground">{job.categoryName || "Công nghệ thông tin"}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      100-500 nhân viên
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      Hà Nội, Việt Nam
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Thành lập 2015
                    </div>
                  </div>

                  <Button variant="outline" className="w-full bg-transparent">
                    Xem trang công ty
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Việc làm tương tự</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((similarJob) => (
                    <div key={similarJob} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-medium mb-1">Senior Backend Developer</h4>
                      <p className="text-sm text-muted-foreground mb-2">TechCorp Vietnam</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        Hà Nội
                        <DollarSign className="h-3 w-3 ml-4 mr-1" />
                        20-35 triệu
                      </div>
                    </div>
                  ))}
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
