"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, DollarSign, Calendar, Eye, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

interface ApplicationWithJob {
  id: string
  jobPostId: string
  jobTitle: string
  companyName: string
  logoUrl?: string
  location: string
  minSalary: number
  maxSalary: number
  cvUrl: string
  closingDate: string
  appliedAt: string
  status: string,
  cvFileName: string
  rawStatus: string
}

export default function AppliedJobsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<ApplicationWithJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("Tất cả")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  const filters = [
    "Tất cả",
    "Hồ Sơ Phù Hợp",
    "Liên Hệ Ứng Viên",
    "Mới Phỏng Vấn",
    "Gửi Offer",
    "Tuyển Thành Công",
    "Từ chối",
  ]

  const mapStatusToVietnamese = (status: string): string => {
    // Kiểm tra nếu status là undefined, null hoặc empty string
    if (!status) {
      return "Không xác định";
    }
    
    switch (status.toUpperCase()) {
      case "PENDING":
        return "Mới ứng tuyển";
      case "VIEWED":
        return "Nhà tuyển dụng đã xem";
      case "APPROVED":
        return "Đã chấp thuận";
      case "REJECTED":
        return "Đã từ chối";
      case "WITHDRAWN":
        return "Đã rút đơn";

      default:
        return status;
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Sử dụng toLocaleDateString để định dạng an toàn và chính xác
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const userType = localStorage.getItem("userType")

    if (!userId || userType !== "APPLICANT") {
      router.push("/login")
      return
    }

    fetchApplications(userId)
  }, [router])

  const fetchApplications = async (applicantId: string) => {
    setIsLoading(true);
    try {
      const response = await api.getApplicationsByApplicant(applicantId, 0, 100);

      // Kiểm tra xem API có trả về dữ liệu và content là một mảng không
      if (response && response.data && response.data.content) {

        // Dùng .map() để biến đổi dữ liệu từ API thành dạng mà component cần
        const formattedApplications: ApplicationWithJob[] = response.data.content.map((app: any) => ({
          id: app.id,
          jobPostId: app.jobId,
          jobTitle: app.jobTitle,
          companyName: app.companyName,
          logoUrl: app.logoUrl || "/placeholder.svg?height=60&width=60", // Fallback nếu logoUrl null
          location: app.location,
          minSalary: app.minSalary,
          maxSalary: app.maxSalary,
          cvUrl: app.cvUrl,
          closingDate: formatDate(app.closingDate), // Sử dụng hàm định dạng
          appliedAt: formatDate(app.appliedDate), // Sử dụng hàm định dạng
          status: mapStatusToVietnamese(app.status), // Sử dụng hàm chuyển đổi status
          cvFileName: app.cvFileName,
          rawStatus: app.status || "UNKNOWN",
        }));

        setApplications(formattedApplications);
      } else {
        // Nếu không có dữ liệu, set mảng rỗng
        setApplications([]);
      }

    } catch (error) {
      console.error("Error fetching applications:", error);
      // Có thể set một state lỗi để hiển thị cho người dùng ở đây
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelApplication = async (applicationId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn ứng tuyển này?")) return

    try {
      await api.withdrawApplication(applicationId)
      setApplications((prev) => prev.filter((app) => app.id !== applicationId))
    } catch (error) {
      console.error("Error canceling application:", error)
      alert("Không thể hủy đơn ứng tuyển. Vui lòng thử lại.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Mới ứng tuyển":
        return "text-green-600"
      case "Hồ Sơ Phù Hợp":
        return "text-blue-600"
      case "Từ chối":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const filteredApplications = applications
    .filter((app) => activeFilter === "Tất cả" || app.status === activeFilter)
    .sort((a, b) => {
      const dateA = new Date(a.appliedAt.split("/").reverse().join("-")).getTime()
      const dateB = new Date(b.appliedAt.split("/").reverse().join("-")).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="text-primary hover:underline">
            Trang chủ
          </Link>
          {" / "}
          <span>Việc làm đã ứng tuyển</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">Việc làm đã ứng tuyển</h1>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              onClick={() => setActiveFilter(filter)}
              className="rounded-full"
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="mb-6 flex items-center gap-4">
          <span className="font-medium">Sắp xếp</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              checked={sortOrder === "oldest"}
              onChange={() => setSortOrder("oldest")}
              className="w-4 h-4"
            />
            <span>Cũ nhất</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              checked={sortOrder === "newest"}
              onChange={() => setSortOrder("newest")}
              className="w-4 h-4"
            />
            <span>Mới nhất</span>
          </label>
        </div>

        {/* Results Count */}
        <p className="mb-4 text-gray-600">{filteredApplications.length} kết quả phù hợp</p>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="p-6">
              <div className="flex gap-4">
                {/* Company Logo */}
                <div className="flex-shrink-0">
                  <img
                    src={application.logoUrl || "/placeholder.svg?height=60&width=60"}
                    alt={application.companyName}
                    className="w-16 h-16 object-contain"
                  />
                </div>

                {/* Job Details */}
                <div className="flex-1">
                  <Link href={`/jobs/${application.jobPostId}`}>
                    <h3 className="text-lg font-semibold text-primary hover:underline mb-1">{application.jobTitle}</h3>
                  </Link>
                  <p className="text-gray-600 mb-3">{application.companyName}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {application.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {application.minSalary / 1000000} - {application.maxSalary / 1000000} triệu VND
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {application.closingDate}
                    </div>
                    <span className="text-gray-500">Toàn thời gian</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-sm text-gray-600">Ngày ứng tuyển: </span>
                        <span className="text-sm font-medium">{application.appliedAt}</span>
                      </div>
                      <div className={`text-sm font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="text-gray-600">CV đã ứng tuyển:</span>
                    <a href={application.cvUrl}
                      target="_blank"
                      className="text-primary hover:underline flex items-center gap-1">
                      {application.cvFileName}
                      <Eye className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* Cancel Button */}

                {!['WITHDRAWN', 'REJECTED', 'APPROVED'].includes(application.rawStatus) && (
                  <div className="flex-shrink-0">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelApplication(application.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hủy bỏ
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
