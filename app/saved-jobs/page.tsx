"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, DollarSign, Calendar, Send, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

interface SavedJobWithDetails {
    id: string
    jobPostId: string
    jobTitle: string
    companyName: string
    logoUrl?: string
    location: string
    minSalary: number
    maxSalary: number
    closingDate: string
    savedAt: string
    postedDate: string
    jobType: string
}

interface ApiSavedJob {
    id: string; 
    jobId: string;
    jobTitle: string;
    companyName: string;
    logoUrl?: string; 
    jobLocation: string;
    minSalary: number;
    maxSalary: number;
    closingDate: string;
    savedDate: string;
    postedDate: string;   
    jobType: string;
}

export default function SavedJobsPage() {
    const router = useRouter()
    const [savedJobs, setSavedJobs] = useState<SavedJobWithDetails[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
   

    useEffect(() => {
        const userId = localStorage.getItem("userId")
        const userType = localStorage.getItem("userType")

        if (!userId || userType !== "APPLICANT") {
            router.push("/login")
            return
        }

        fetchSavedJobs(userId)
    }, [router])



    const formatDate = (dateString: string): string => {
        if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return "N/A";
        }
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };


    const fetchSavedJobs = async (applicantId: string) => {
        setIsLoading(true);
        try {
            const response = await api.getSavedJobsByApplicant({
                applicantId: applicantId,
                page: 0,
                size: 100,
            });

            if (response && response.data && response.data.content) {
                const savedJobsFromApi: ApiSavedJob[] = response.data.content;

                const formattedSavedJobs: SavedJobWithDetails[] = savedJobsFromApi.map(job => ({
                    id: job.id,
                    jobPostId: job.jobId,
                    jobTitle: job.jobTitle,
                    companyName: job.companyName,
                    logoUrl: job.logoUrl || "/placeholder.svg?height=60&width=60",
                    location: job.jobLocation,
                    minSalary: job.minSalary,
                    maxSalary: job.maxSalary,
                    closingDate: formatDate(job.closingDate),
                    savedAt: formatDate(job.savedDate),
                    postedDate: formatDate(job.postedDate),
                    jobType: job.jobType,
                }));

                setSavedJobs(formattedSavedJobs);



            } else {
                setSavedJobs([]);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách công việc đã lưu:", error);
            setSavedJobs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnsaveJob = async (savedJobId: string, jobPostId: string) => {
        try {
            await api.toggleSaveJob(jobPostId)
            setSavedJobs((prev) => prev.filter((job) => job.id !== savedJobId))
        } catch (error) {
            console.error("Error unsaving job:", error)
            alert("Không thể bỏ lưu công việc. Vui lòng thử lại.")
        }
    }

    const handleApply = (jobPostId: string) => {
        router.push(`/jobs/${jobPostId}`)
    }

    const sortedJobs = [...savedJobs].sort((a, b) => {
        const dateA = new Date(a.savedAt.split("/").reverse().join("-")).getTime()
        const dateB = new Date(b.savedAt.split("/").reverse().join("-")).getTime()
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
                    <Link href="/dashboard" className="text-primary hover:underline">
                        Quản lý hồ sơ
                    </Link>
                    {" / "}
                    <span>Việc làm đã lưu</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-6">Việc làm đã lưu</h1>

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
                <p className="mb-4 text-gray-600">{sortedJobs.length} kết quả phù hợp</p>

                {/* Saved Jobs List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedJobs.map((job) => (
                        <Card key={job.id} className="p-6">
                            <div className="flex gap-4">
                                {/* Company Logo */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={job.logoUrl || "/placeholder.svg?height=60&width=60"}
                                        alt={job.companyName}
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>

                                {/* Job Details */}
                                <div className="flex-1">
                                    <Link href={`/jobs/${job.jobPostId}`}>
                                        <h3 className="text-lg font-semibold text-primary hover:underline mb-1 line-clamp-2">
                                            {job.jobTitle}
                                        </h3>
                                    </Link>
                                    <p className="text-gray-600 mb-3">{job.companyName}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {job.location}
                                        </div>
                                        {job.minSalary > 0 && job.maxSalary > 0 ? (
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                {job.minSalary / 1000000} - {job.maxSalary / 1000000} triệu VND
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                Thỏa thuận
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {job.closingDate}
                                        </div>
                                        <span className="text-gray-500">{job.jobType}</span>
                                    </div>

                                    <div className="mb-3">
                                        <span className="text-sm text-gray-600">Ngày lưu: </span>
                                        <span className="text-sm font-medium">{job.savedAt}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleApply(job.jobPostId)}
                                            className="flex-1 flex items-center justify-center gap-2"
                                        >
                                            <Send className="h-4 w-4" />
                                            Ứng tuyển
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleUnsaveJob(job.id, job.jobPostId)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
