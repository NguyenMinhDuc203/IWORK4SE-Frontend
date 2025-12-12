"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Briefcase,
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  Download,
  Activity,
  Award,
  PieChart
} from "lucide-react"
import { api, JobPost, Application } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from "recharts"
import * as XLSX from "xlsx"

interface StatisticsData {
  totalJobs: number
  totalCompanies: number
  activeCompanies: number
  totalApplicants: number
  activeApplicants: number
  totalApplications: number
  jobsByStatus: { [key: string]: number }
  jobsByType: { [key: string]: number }
  jobsByLocation: { [key: string]: number }
  jobsByCategory: { [key: string]: number }
  applicationsByStatus: { [key: string]: number }
  monthlyTrend: Array<{ month: string; jobs: number; applications: number }>
  salaryDistribution: Array<{ range: string; count: number }>
  topEmployers: Array<{ name: string; jobs: number; applications: number }>
  topJobs: Array<{ title: string; applications: number; company: string }>
  activeUsers: number
  newUsersThisMonth: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<StatisticsData>({
    totalJobs: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    totalApplicants: 0,
    activeApplicants: 0,
    totalApplications: 0,
    jobsByStatus: {},
    jobsByType: {},
    jobsByLocation: {},
    jobsByCategory: {},
    applicationsByStatus: {},
    monthlyTrend: [],
    salaryDistribution: [],
    topEmployers: [],
    topJobs: [],
    activeUsers: 0,
    newUsersThisMonth: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"all" | "month" | "quarter" | "year">("all")

  useEffect(() => {
    fetchStatistics()
  }, [timeRange])

  // Helper function to fetch all jobs with pagination
  const fetchAllJobs = async (): Promise<any[]> => {
    const allJobs: any[] = []
    let page = 0
    const size = 500
    let hasMore = true

    while (hasMore) {
      try {
        const response = await api.getJobs({ page, size })
        const jobs = (response.data as any)?.content || []
        allJobs.push(...jobs)
        
        const totalPages = (response.data as any)?.totalPages || 1
        hasMore = page < totalPages - 1 && jobs.length === size
        
        page++
        if (page > 50) { // Safety limit
          hasMore = false
        }
      } catch (error) {
        console.error(`Error fetching jobs page ${page}:`, error)
        hasMore = false
      }
    }
    
    return allJobs
  }

  // Helper function to fetch all applications for a job with pagination
  const fetchAllApplicationsForJob = async (jobId: string): Promise<any[]> => {
    const allApps: any[] = []
    let page = 0
    const size = 500
    let hasMore = true

    while (hasMore) {
      try {
        const response = await api.getApplicationsByJob(jobId, page, size)
        const apps = Array.isArray(response.data) ? response.data : (response.data as any)?.content || []
        allApps.push(...apps)
        
        // Check if there are more pages
        const totalPages = (response.data as any)?.totalPages || 1
        hasMore = page < totalPages - 1 && apps.length === size
        
        page++
        if (page > 50 || apps.length === 0) { // Safety limit
          hasMore = false
        }
      } catch (error) {
        console.error(`Error fetching applications for job ${jobId} page ${page}:`, error)
        hasMore = false
      }
    }
    
    return allApps
  }

  // Helper function to fetch all employers with pagination
  const fetchAllEmployers = async (): Promise<any[]> => {
    const allEmployers: any[] = []
    let page = 0
    const size = 500
    let hasMore = true

    while (hasMore) {
      try {
        const response = await api.getAllEmployers({ page, size })
        console.log(`[Statistics] Employers page ${page} response:`, response)
        
        // Handle different response structures
        let employers: any[] = []
        let totalPages = 1
        
        if (response.data && Array.isArray(response.data)) {
          // Direct array
          employers = response.data
          totalPages = 1
        } else if (response.data && response.data.employers) {
          // Has employers property (paged response)
          employers = response.data.employers || []
          totalPages = response.data.totalPages || 1
        } else if (response.data && response.data.content) {
          // Has content property (alternative paged response)
          employers = response.data.content || []
          totalPages = response.data.totalPages || 1
        } else {
          console.warn(`[Statistics] Unexpected employers response structure at page ${page}:`, response)
          employers = []
          totalPages = 1
        }
        
        allEmployers.push(...employers)
        console.log(`[Statistics] Employers page ${page}: got ${employers.length} employers, total so far: ${allEmployers.length}`)
        
        hasMore = page < totalPages - 1 && employers.length === size
        
        page++
        if (page > 50 || employers.length === 0) { // Safety limit
          hasMore = false
        }
      } catch (error) {
        console.error(`[Statistics] Error fetching employers page ${page}:`, error)
        hasMore = false
      }
    }
    
    console.log(`[Statistics] Total employers fetched: ${allEmployers.length}`)
    return allEmployers
  }

  // Helper function to fetch all applicants with pagination
  const fetchAllApplicants = async (): Promise<any[]> => {
    const allApplicants: any[] = []
    let page = 0
    const size = 500
    let hasMore = true

    while (hasMore) {
      try {
        const response = await api.getAllApplicants({ page, size })
        console.log(`[Statistics] Applicants page ${page} response:`, response)
        
        // Handle different response structures
        let applicants: any[] = []
        let totalPages = 1
        
        if (response.data && Array.isArray(response.data)) {
          // Direct array
          applicants = response.data
          totalPages = 1
        } else if (response.data && response.data.applicants) {
          // Has applicants property (paged response)
          applicants = response.data.applicants || []
          totalPages = response.data.totalPages || 1
        } else if (response.data && response.data.content) {
          // Has content property (alternative paged response)
          applicants = response.data.content || []
          totalPages = response.data.totalPages || 1
        } else {
          console.warn(`[Statistics] Unexpected applicants response structure at page ${page}:`, response)
          applicants = []
          totalPages = 1
        }
        
        allApplicants.push(...applicants)
        console.log(`[Statistics] Applicants page ${page}: got ${applicants.length} applicants, total so far: ${allApplicants.length}`)
        
        hasMore = page < totalPages - 1 && applicants.length === size
        
        page++
        if (page > 50 || applicants.length === 0) { // Safety limit
          hasMore = false
        }
      } catch (error) {
        console.error(`[Statistics] Error fetching applicants page ${page}:`, error)
        hasMore = false
      }
    }
    
    console.log(`[Statistics] Total applicants fetched: ${allApplicants.length}`)
    return allApplicants
  }

  // Helper function to fetch all applications by status (alternative method)
  const fetchAllApplicationsByStatus = async (): Promise<any[]> => {
    const allApps: any[] = []
    const statuses = ["PENDING", "VIEWED", "APPROVED", "REJECTED", "WITHDRAWN"]
    
    for (const status of statuses) {
      let page = 0
      const size = 500
      let hasMore = true

      while (hasMore) {
        try {
          const response = await api.getApplicationsByStatus(status, page, size)
          const apps = Array.isArray(response.data) ? response.data : (response.data as any)?.content || []
          allApps.push(...apps)
          
          const totalPages = (response.data as any)?.totalPages || 1
          hasMore = page < totalPages - 1 && apps.length === size
          
          page++
          if (page > 50 || apps.length === 0) {
            hasMore = false
          }
        } catch (error) {
          console.error(`Error fetching applications by status ${status} page ${page}:`, error)
          hasMore = false
        }
      }
    }
    
    return allApps
  }

  const fetchStatistics = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all data - use pagination for all entities
      console.log("[Statistics] Fetching all data with pagination...")
      const [allJobs, allCompanies, allApplicants] = await Promise.all([
        fetchAllJobs(),
        fetchAllEmployers(),
        fetchAllApplicants()
      ])

      console.log(`[Statistics] Fetched: ${allJobs.length} jobs, ${allCompanies.length} companies, ${allApplicants.length} applicants`)

      // Filter by time range
      const now = new Date()
      const filterDate = (() => {
        switch (timeRange) {
          case "month":
            return new Date(now.getFullYear(), now.getMonth(), 1)
          case "quarter":
            return new Date(now.getFullYear(), now.getMonth() - 3, 1)
          case "year":
            return new Date(now.getFullYear(), 0, 1)
          default:
            return new Date(0)
        }
      })()

      const filteredJobs = allJobs.filter((job: any) => {
        if (timeRange === "all") return true
        return new Date(job.postedDate) >= filterDate
      })

      // Fetch ALL applications - try by status first (more efficient), fallback to by job
      console.log("[Statistics] Fetching all applications...")
      let allApplications: any[] = []
      
      try {
        // Method 1: Fetch by status (more efficient if API supports it)
        allApplications = await fetchAllApplicationsByStatus()
        console.log(`[Statistics] Fetched ${allApplications.length} applications by status`)
      } catch (error) {
        console.warn("[Statistics] Failed to fetch by status, trying by job...", error)
        
        // Method 2: Fetch by job (slower but more reliable)
        // Process in batches to avoid overwhelming the API
        const batchSize = 20
        for (let i = 0; i < filteredJobs.length; i += batchSize) {
          const batch = filteredJobs.slice(i, i + batchSize)
          const batchPromises = batch.map((job: any) => fetchAllApplicationsForJob(job.id))
          const batchResults = await Promise.all(batchPromises)
          const batchApps = batchResults.flat()
          allApplications.push(...batchApps)
          console.log(`[Statistics] Processed batch ${Math.floor(i/batchSize) + 1}, total apps: ${allApplications.length}`)
        }
      }

      // Remove duplicates (in case both methods return same data)
      const uniqueApps = allApplications.filter((app, index, self) => 
        index === self.findIndex((a) => a.id === app.id)
      )
      allApplications = uniqueApps
      
      // Filter applications by time range if needed
      const filteredApplications = allApplications.filter((app: any) => {
        if (timeRange === "all") return true
        const appDate = new Date(app.appliedDate || app.createdAt)
        return appDate >= filterDate
      })
      
      console.log(`[Statistics] Total unique applications: ${allApplications.length}, filtered: ${filteredApplications.length}`)
      
      // Calculate statistics
      const jobsByStatus = filteredJobs.reduce((acc: any, job: any) => {
        acc[job.jobStatus] = (acc[job.jobStatus] || 0) + 1
        return acc
      }, {})
      
      const jobsByType = filteredJobs.reduce((acc: any, job: any) => {
        acc[job.jobType] = (acc[job.jobType] || 0) + 1
        return acc
      }, {})
      
      const jobsByLocation = filteredJobs.reduce((acc: any, job: any) => {
        acc[job.location] = (acc[job.location] || 0) + 1
        return acc
      }, {})
      
      const jobsByCategory = filteredJobs.reduce((acc: any, job: any) => {
        const category = job.categoryName || "Khác"
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})

      const applicationsByStatus = filteredApplications.reduce((acc: any, app: any) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      }, {})

      // Monthly trend (last 6 months)
      const monthlyTrend = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthName = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })
        const monthJobs = filteredJobs.filter((job: any) => {
          const jobDate = new Date(job.postedDate)
          return jobDate.getMonth() === date.getMonth() && jobDate.getFullYear() === date.getFullYear()
        }).length
        const monthApps = filteredApplications.filter((app: any) => {
          const appDate = new Date(app.appliedDate || app.createdAt)
          return appDate.getMonth() === date.getMonth() && appDate.getFullYear() === date.getFullYear()
        }).length
        monthlyTrend.push({ month: monthName, jobs: monthJobs, applications: monthApps })
      }

      // Salary distribution
      const salaryRanges = [
        { min: 0, max: 10000000, label: "Dưới 10M" },
        { min: 10000000, max: 20000000, label: "10M - 20M" },
        { min: 20000000, max: 30000000, label: "20M - 30M" },
        { min: 30000000, max: 50000000, label: "30M - 50M" },
        { min: 50000000, max: Infinity, label: "Trên 50M" }
      ]
      const salaryDistribution = salaryRanges.map(range => ({
        range: range.label,
        count: filteredJobs.filter((job: any) => {
          const avg = (job.minSalary + job.maxSalary) / 2
          return avg >= range.min && avg < range.max
        }).length
      }))

      // Top employers
      const employerStats = filteredJobs.reduce((acc: any, job: any) => {
        const employer = job.employerName || job.companyName || "Unknown"
        if (!acc[employer]) {
          acc[employer] = { jobs: 0, applications: 0 }
        }
        acc[employer].jobs++
        return acc
      }, {})

      // Count applications per employer
      filteredApplications.forEach((app: any) => {
        const employer = app.companyName || "Unknown"
        if (employerStats[employer]) {
          employerStats[employer].applications++
        }
      })

      const topEmployers = Object.entries(employerStats)
        .map(([name, data]: [string, any]) => ({ name, ...data }))
        .sort((a, b) => b.jobs - a.jobs)
        .slice(0, 10)

      // Top jobs by applications
      const jobStats = filteredApplications.reduce((acc: any, app: any) => {
        if (!acc[app.jobId]) {
          acc[app.jobId] = { 
            title: app.jobTitle || "Không có tiêu đề", 
            company: app.companyName || "Không có công ty", 
            applications: 0 
          }
        }
        acc[app.jobId].applications++
        return acc
      }, {})

      const topJobs = Object.values(jobStats)
        .sort((a: any, b: any) => b.applications - a.applications)
        .slice(0, 10) as any[]

      // Count active companies (ACTIVE status)
      const activeCompanies = allCompanies.filter((company: any) => {
        const status = company.userStatus || company.status
        return status === "ACTIVE"
      }).length

      // Count active applicants (ACTIVE status)
      const activeApplicants = allApplicants.filter((applicant: any) => {
        const status = applicant.userStatus || applicant.status
        return status === "ACTIVE"
      }).length

      // Active users (users who have activity in last 30 days)
      // This includes both applicants and employers who have updated their profile or applied/posted jobs
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      // Active applicants (updated profile or applied in last 30 days)
      const activeApplicantsRecent = allApplicants.filter((app: any) => {
        if (!app) return false
        const updated = app.updatedAt ? new Date(app.updatedAt) : null
        const created = app.createdAt ? new Date(app.createdAt) : null
        if (updated && !isNaN(updated.getTime())) {
          return updated >= thirtyDaysAgo
        }
        if (created && !isNaN(created.getTime())) {
          return created >= thirtyDaysAgo
        }
        return false
      }).length

      // Active employers (updated profile or posted jobs in last 30 days)
      const activeEmployersRecent = allCompanies.filter((emp: any) => {
        if (!emp) return false
        const updated = emp.updatedAt ? new Date(emp.updatedAt) : null
        const created = emp.createdAt ? new Date(emp.createdAt) : null
        if (updated && !isNaN(updated.getTime())) {
          return updated >= thirtyDaysAgo
        }
        if (created && !isNaN(created.getTime())) {
          return created >= thirtyDaysAgo
        }
        return false
      }).length

      // Total active users = active applicants + active employers (recent activity)
      const totalActiveUsers = activeApplicantsRecent + activeEmployersRecent

      // New users this month (both applicants and employers)
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const newApplicantsThisMonth = allApplicants.filter((app: any) => {
        if (!app || !app.createdAt) return false
        try {
          const created = new Date(app.createdAt)
          return !isNaN(created.getTime()) && created >= thisMonthStart
        } catch {
          return false
        }
      }).length

      const newEmployersThisMonth = allCompanies.filter((emp: any) => {
        if (!emp || !emp.createdAt) return false
        try {
          const created = new Date(emp.createdAt)
          return !isNaN(created.getTime()) && created >= thisMonthStart
        } catch {
          return false
        }
      }).length

      const newUsersThisMonth = newApplicantsThisMonth + newEmployersThisMonth
      
      console.log(`[Statistics] Active users: ${totalActiveUsers} (${activeApplicantsRecent} applicants + ${activeEmployersRecent} employers)`)
      console.log(`[Statistics] New users this month: ${newUsersThisMonth} (${newApplicantsThisMonth} applicants + ${newEmployersThisMonth} employers)`)

      setStats({
        totalJobs: filteredJobs.length,
        totalCompanies: allCompanies.length,
        activeCompanies,
        totalApplicants: allApplicants.length,
        activeApplicants,
        totalApplications: filteredApplications.length,
        jobsByStatus,
        jobsByType,
        jobsByLocation,
        jobsByCategory,
        applicationsByStatus,
        monthlyTrend,
        salaryDistribution,
        topEmployers,
        topJobs,
        activeUsers: totalActiveUsers,
        newUsersThisMonth
      })
    } catch (error) {
      console.error("Error fetching statistics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()

    // Get timeRange label
    const getTimeRangeLabel = () => {
      switch (timeRange) {
        case "month": return "Tháng này"
        case "quarter": return "3 tháng"
        case "year": return "Năm nay"
        default: return "Tất cả"
      }
    }

    // Metadata sheet
    const metadataData: any[][] = [
      ["THỐNG KÊ HỆ THỐNG"],
      ["Thời gian xuất", new Date().toLocaleString('vi-VN')],
      ["Khoảng thời gian", getTimeRangeLabel()],
      [""],
    ]
    const metadataSheet = XLSX.utils.aoa_to_sheet(metadataData)
    XLSX.utils.book_append_sheet(wb, metadataSheet, "Thông tin")

    // Overview sheet
    const overviewData: any[][] = [
      ["THỐNG KÊ TỔNG QUAN"],
      ["Chỉ số", "Giá trị"],
      ["Tổng việc làm", stats.totalJobs],
      ["Công ty (Active / Tổng)", `${stats.activeCompanies} / ${stats.totalCompanies}`],
      ["Ứng viên (Active / Tổng)", `${stats.activeApplicants} / ${stats.totalApplicants}`],
      ["Tổng ứng tuyển", stats.totalApplications],
      ["Người dùng hoạt động (30 ngày)", stats.activeUsers],
      ["Người dùng mới (tháng này)", stats.newUsersThisMonth],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(overviewData)
    XLSX.utils.book_append_sheet(wb, ws1, "Tổng quan")

    // Jobs by Status
    const statusData: any[][] = [
      ["VIỆC LÀM THEO TRẠNG THÁI"],
      ["Trạng thái", "Số lượng", "Tỷ lệ (%)"]
    ]
    Object.entries(stats.jobsByStatus).forEach(([status, count]) => {
      statusData.push([
        getStatusText(status),
        count,
        ((count / stats.totalJobs) * 100).toFixed(1)
      ])
    })
    const ws2 = XLSX.utils.aoa_to_sheet(statusData)
    XLSX.utils.book_append_sheet(wb, ws2, "Việc làm theo trạng thái")

    // Jobs by Type
    const typeData: any[][] = [
      ["VIỆC LÀM THEO CẤP ĐỘ"],
      ["Cấp độ", "Số lượng", "Tỷ lệ (%)"]
    ]
    Object.entries(stats.jobsByType).forEach(([type, count]) => {
      typeData.push([
        getJobTypeText(type),
        count,
        ((count / stats.totalJobs) * 100).toFixed(1)
      ])
    })
    const ws3 = XLSX.utils.aoa_to_sheet(typeData)
    XLSX.utils.book_append_sheet(wb, ws3, "Việc làm theo cấp độ")

    // Applications by Status
    const appStatusData: any[][] = [
      ["ỨNG TUYỂN THEO TRẠNG THÁI"],
      ["Trạng thái", "Số lượng", "Tỷ lệ (%)"]
    ]
    Object.entries(stats.applicationsByStatus).forEach(([status, count]) => {
      appStatusData.push([
        getApplicationStatusText(status),
        count,
        ((count / stats.totalApplications) * 100).toFixed(1)
      ])
    })
    const ws4 = XLSX.utils.aoa_to_sheet(appStatusData)
    XLSX.utils.book_append_sheet(wb, ws4, "Ứng tuyển theo trạng thái")

    // Monthly Trend
    const trendData: any[][] = [
      ["XU HƯỚNG THEO THÁNG"],
      ["Tháng", "Số việc làm", "Số ứng tuyển"]
    ]
    stats.monthlyTrend.forEach(trend => {
      trendData.push([trend.month, trend.jobs, trend.applications])
    })
    const ws5 = XLSX.utils.aoa_to_sheet(trendData)
    XLSX.utils.book_append_sheet(wb, ws5, "Xu hướng tháng")

    // Top Employers
    const employerData: any[][] = [
      ["TOP CÔNG TY"],
      ["Tên công ty", "Số việc làm", "Số ứng tuyển"]
    ]
    stats.topEmployers.forEach(emp => {
      employerData.push([emp.name, emp.jobs, emp.applications])
    })
    const ws6 = XLSX.utils.aoa_to_sheet(employerData)
    XLSX.utils.book_append_sheet(wb, ws6, "Top công ty")

    // Top Jobs
    const topJobsData: any[][] = [
      ["TOP VIỆC LÀM"],
      ["Tiêu đề", "Công ty", "Số ứng tuyển"]
    ]
    stats.topJobs.forEach(job => {
      topJobsData.push([job.title || "Không có tiêu đề", job.company || "Không có công ty", job.applications || 0])
    })
    const ws7 = XLSX.utils.aoa_to_sheet(topJobsData)
    XLSX.utils.book_append_sheet(wb, ws7, "Top việc làm")

    // Salary Distribution
    const salaryData: any[][] = [
      ["PHÂN BỐ MỨC LƯƠNG"],
      ["Khoảng lương", "Số lượng"]
    ]
    stats.salaryDistribution.forEach(dist => {
      salaryData.push([dist.range, dist.count])
    })
    const ws8 = XLSX.utils.aoa_to_sheet(salaryData)
    XLSX.utils.book_append_sheet(wb, ws8, "Phân bố lương")

    // Write file with timeRange suffix
    const timeRangeSuffix = timeRange === "all" ? "TatCa" : 
                            timeRange === "month" ? "ThangNay" :
                            timeRange === "quarter" ? "3Thang" : "NamNay"
    const fileName = `ThongKeHeThong_${timeRangeSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const getJobTypeText = (jobType: string) => {
    switch (jobType) {
      case "INTERNSHIP": return "Thực tập"
      case "FRESHER": return "Fresher"
      case "JUNIOR": return "Junior"
      case "SENIOR": return "Senior"
      case "MANAGER": return "Manager"
      default: return jobType
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "Đã duyệt"
      case "PENDING": return "Chờ duyệt"
      case "REJECTED": return "Từ chối"
      case "EXPIRED": return "Hết hạn"
      case "DELETED": return "Đã xóa"
      default: return status
    }
  }

  const getApplicationStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return "Chờ xem xét"
      case "VIEWED": return "Đã xem"
      case "APPROVED": return "Đã chấp nhận"
      case "REJECTED": return "Đã từ chối"
      case "WITHDRAWN": return "Đã rút đơn"
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      case "EXPIRED": return "bg-gray-100 text-gray-800"
      case "DELETED": return "bg-gray-300 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Prepare chart data
  const statusChartData = Object.entries(stats.jobsByStatus).map(([status, count]) => ({
    name: getStatusText(status),
    value: count
  }))

  const typeChartData = Object.entries(stats.jobsByType).map(([type, count]) => ({
    name: getJobTypeText(type),
    value: count
  }))

  const locationChartData = Object.entries(stats.jobsByLocation)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([location, count]) => ({
      name: location,
      value: count
    }))

  return (
    <div className="space-y-6 px-20">
      {/* Header */}
      <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thống kê hệ thống</h1>
          <p className="text-gray-600 mt-2">Tổng quan chi tiết về hoạt động của hệ thống</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">3 tháng</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} className="gap-2">
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng việc làm</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalJobs}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Công ty</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.activeCompanies} / {stats.totalCompanies}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active / Tổng</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ứng viên</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.activeApplicants} / {stats.totalApplicants}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active / Tổng</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng ứng tuyển</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalApplications}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Người dùng hoạt động</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-1">30 ngày qua</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Người dùng mới</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.newUsersThisMonth}</p>
                <p className="text-xs text-gray-500 mt-1">Tháng này</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Xu hướng theo tháng
            </CardTitle>
            <CardDescription>
              Số việc làm và ứng tuyển trong 6 tháng gần nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="jobs" stroke="#8884d8" name="Việc làm" />
                <Line type="monotone" dataKey="applications" stroke="#82ca9d" name="Ứng tuyển" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Jobs by Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Việc làm theo trạng thái
            </CardTitle>
            <CardDescription>
              Phân bố việc làm theo trạng thái duyệt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => {
                    const { name, percent } = props
                    return `${name}: ${(percent * 100).toFixed(0)}%`
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Việc làm theo cấp độ
            </CardTitle>
            <CardDescription>
              Phân bố việc làm theo cấp độ kinh nghiệm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Applications by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Ứng tuyển theo trạng thái
            </CardTitle>
            <CardDescription>
              Phân bố ứng tuyển theo trạng thái xử lý
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(stats.applicationsByStatus).map(([status, count]) => ({
                name: getApplicationStatusText(status),
                value: count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Top địa điểm
            </CardTitle>
            <CardDescription>
              Top 10 địa điểm có nhiều việc làm nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Salary Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Phân bố mức lương
            </CardTitle>
            <CardDescription>
              Phân bố việc làm theo khoảng lương
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.salaryDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Employers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Top công ty
            </CardTitle>
            <CardDescription>
              Top 10 công ty có nhiều việc làm nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topEmployers.slice(0, 10).map((employer, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{employer.name}</p>
                      <p className="text-sm text-gray-500">{employer.jobs} việc làm</p>
                  </div>
                  </div>
                  <Badge variant="outline">{employer.applications} ứng tuyển</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Top việc làm
          </CardTitle>
          <CardDescription>
              Top 10 việc làm nhận được nhiều ứng tuyển nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
              {stats.topJobs.length > 0 ? (
                stats.topJobs.slice(0, 10).map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-green-600">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{job.title || "Không có tiêu đề"}</p>
                        <p className="text-sm text-gray-500 truncate">{job.company || "Không có công ty"}</p>
                    </div>
                    </div>
                    <Badge variant="outline" className="ml-3 flex-shrink-0">
                      {job.applications || 0} ứng tuyển
                    </Badge>
                </div>
              ))
            ) : (
                <p className="text-gray-500 text-center py-4">Chưa có dữ liệu ứng tuyển</p>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}


