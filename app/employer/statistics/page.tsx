"use client"

import { useEffect, useMemo, useState } from "react"
import { api, Application, JobPost } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import * as XLSX from "xlsx"
import Link from "next/link"

type Kpi = {
  openJobs: number
  applicantsLast30d: number
  pending: number
  approved: number
  rejected: number
  withdrawn: number
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function toDateSafe(value?: string) {
  if (!value) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

export default function EmployerStatisticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType !== "EMPLOYER") {
      window.location.href = "/login"
      return
    }

    const employerId = localStorage.getItem("userId")
    if (!employerId) {
      window.location.href = "/login"
      return
    }

    setIsLoading(true)
    setError(null)

    // Helper function to fetch all applications (handle pagination)
    const fetchAllApplications = async (): Promise<any[]> => {
      const allApps: any[] = []
      let page = 0
      const size = 500
      let hasMore = true
      
      while (hasMore) {
        try {
          const response = await api.getApplicationsByEmployer(employerId, page, size)
          console.log(`[Statistics] Fetching applications page ${page}:`, response)
          
          let apps: any[] = []
          if ((response as any)?.data?.content) {
            apps = (response as any).data.content
            // Check if there are more pages
            const totalPages = (response as any).data?.totalPages || (response as any).totalPages || 1
            hasMore = page < totalPages - 1
          } else if (Array.isArray((response as any)?.data)) {
            apps = (response as any).data
            hasMore = apps.length === size // If we got full page, might have more
          } else if (Array.isArray(response)) {
            apps = response
            hasMore = apps.length === size
          } else if ((response as any)?.content) {
            apps = (response as any).content
            const totalPages = (response as any).totalPages || 1
            hasMore = page < totalPages - 1
          } else {
            hasMore = false
          }
          
          allApps.push(...apps)
          console.log(`[Statistics] Page ${page}: got ${apps.length} applications, total so far: ${allApps.length}`)
          
          if (apps.length === 0 || apps.length < size) {
            hasMore = false
          }
          
          page++
          
          // Safety limit to prevent infinite loops
          if (page > 50) {
            console.warn("[Statistics] Reached page limit (50), stopping")
            hasMore = false
          }
        } catch (err) {
          console.error(`[Statistics] Error fetching page ${page}:`, err)
          hasMore = false
        }
      }
      
      return allApps
    }

    // Fetch jobs and applications; aggregate on client to avoid backend shape coupling
    Promise.all([
      api.searchJobPosts({ employerId, size: 200 }),
      fetchAllApplications(),
    ])
      .then(([jobRes, appsContent]) => {
        console.log("[Statistics] Job response:", jobRes)
        console.log("[Statistics] Applications fetched:", appsContent.length)
        
        // Support multiple response shapes for jobs
        let jobsContent: any[] = []
        if ((jobRes as any)?.data?.content) {
          jobsContent = (jobRes as any).data.content
        } else if ((jobRes as any)?.content) {
          jobsContent = (jobRes as any).content
        } else if (Array.isArray((jobRes as any)?.data)) {
          jobsContent = (jobRes as any).data
        } else if (Array.isArray(jobRes)) {
          jobsContent = jobRes
        }
        
        // appsContent is already an array from fetchAllApplications
        const finalApps = Array.isArray(appsContent) ? appsContent : []
        
        console.log("[Statistics] Final parsed jobs:", jobsContent.length)
        console.log("[Statistics] Final parsed applications:", finalApps.length)
        if (finalApps.length > 0) {
          console.log("[Statistics] Sample application:", finalApps[0])
          console.log("[Statistics] Application fields:", Object.keys(finalApps[0]))
        }
        
        setJobs(Array.isArray(jobsContent) ? jobsContent : [])
        setApplications(finalApps)
      })
      .catch((e) => {
        console.error("[Statistics] Error fetching data:", e)
        setError(e?.message || "Lỗi tải dữ liệu")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const kpi: Kpi = useMemo(() => {
    const now = new Date()
    const d30 = new Date(now)
    d30.setDate(now.getDate() - 30)

    const openJobs = (jobs || []).filter((j) => j.jobStatus === "ACCEPTED").length || 0

    const last30 = (applications || []).filter((a) => {
      const dateValue = (a as any).appliedDate || (a as any).appliedAt || (a as any).applied_date
      const d = toDateSafe(dateValue)
      return d && d >= d30
    })

    const pending = applications.filter((a) => (a as any).status === "PENDING").length
    const approved = applications.filter((a) => (a as any).status === "APPROVED").length
    const rejected = applications.filter((a) => (a as any).status === "REJECTED").length
    const withdrawn = applications.filter((a) => (a as any).status === "WITHDRAWN").length
    
    console.log("[Statistics] KPI calculated:", {
      totalApplications: applications.length,
      pending,
      approved,
      rejected,
      withdrawn,
      last30d: last30.length
    })

    return {
      openJobs,
      applicantsLast30d: last30.length,
      pending,
      approved,
      rejected,
      withdrawn,
    }
  }, [jobs, applications])

  const timeseriesApplications = useMemo(() => {
    // group by appliedDate (day)
    const counts: Record<string, number> = {}
    let skippedCount = 0
    applications.forEach((a) => {
      // Try multiple possible date fields
      const dateValue = (a as any).appliedDate || (a as any).appliedAt || (a as any).applied_date
      const d = toDateSafe(dateValue)
      if (!d) {
        skippedCount++
        if (skippedCount <= 3) {
          console.warn("[Statistics] Skipped application without valid date:", a)
        }
        return
      }
      const key = formatDate(d)
      counts[key] = (counts[key] || 0) + 1
    })
    if (skippedCount > 0) {
      console.log(`[Statistics] Skipped ${skippedCount} applications without valid dates out of ${applications.length}`)
    }
    const result = Object.entries(counts)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, count]) => ({ 
        date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        count 
      }))
    
    // If empty, show at least one data point for the last 7 days
    if (result.length === 0) {
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        result.push({
          date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          count: 0
        })
      }
    }
    
    return result
  }, [applications])

  const funnelData = useMemo(() => {
    const data = [
      { name: "Chờ xem xét", value: kpi.pending, fill: "#eab308" },
      { name: "Đã chấp nhận", value: kpi.approved, fill: "#22c55e" },
      { name: "Đã từ chối", value: kpi.rejected, fill: "#ef4444" },
      { name: "Đã rút đơn", value: kpi.withdrawn, fill: "#6b7280" },
    ].filter(item => item.value > 0)
    
    // If all zero, show at least one entry so chart renders
    if (data.length === 0) {
      return [{ name: "Chưa có dữ liệu", value: 1, fill: "#9ca3af" }]
    }
    
    return data
  }, [kpi])

  const byJob = useMemo(() => {
    const jobIdToJob: Record<string, JobPost> = {}
    jobs.forEach((j) => (jobIdToJob[j.id] = j))

    const group: Record<string, { jobId: string; title: string; applicants: number; approved: number; rejected: number; pending: number }> = {}
    applications.forEach((a) => {
      // Try multiple possible job ID fields
      const jobId = (a as any).jobId || (a as any).jobPostId || (a as any).job_id
      if (!jobId) {
        console.warn("[Statistics] Application without jobId:", a)
        return
      }
      if (!group[jobId]) {
        const job = jobIdToJob[jobId]
        group[jobId] = {
          jobId,
          title: job?.title || "(N/A)",
          applicants: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
        }
      }
      group[jobId].applicants += 1
      const status = (a as any).status
      if (status === "APPROVED") group[jobId].approved += 1
      else if (status === "REJECTED") group[jobId].rejected += 1
      else if (status === "PENDING") group[jobId].pending += 1
    })

    const result = Object.values(group).sort((a, b) => b.applicants - a.applicants)
    
    // If empty, show placeholder
    if (result.length === 0) {
      return [{
        jobId: "none",
        title: "Chưa có dữ liệu",
        applicants: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
      }]
    }
    
    return result
  }, [jobs, applications])

  const marketByLocation = useMemo(() => {
    const counts: Record<string, number> = {}
    jobs.forEach((j) => {
      const key = j.location || "Khác"
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([location, count]) => ({ location, count }))
  }, [jobs])

  const marketByCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    jobs.forEach((j) => {
      const key = j.categoryName || String(j.categoryId || "Khác")
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }))
  }, [jobs])

  function exportToExcel() {
    const wb = XLSX.utils.book_new()
    const kpiSheet = XLSX.utils.json_to_sheet([
      {
        openJobs: kpi.openJobs,
        applicantsLast30d: kpi.applicantsLast30d,
        pending: kpi.pending,
        approved: kpi.approved,
        rejected: kpi.rejected,
        withdrawn: kpi.withdrawn,
      },
    ])
    XLSX.utils.book_append_sheet(wb, kpiSheet, "KPI")

    const byJobSheet = XLSX.utils.json_to_sheet(byJob)
    XLSX.utils.book_append_sheet(wb, byJobSheet, "By Job")

    const timeseriesSheet = XLSX.utils.json_to_sheet(timeseriesApplications)
    XLSX.utils.book_append_sheet(wb, timeseriesSheet, "Applications TS")

    const marketLocSheet = XLSX.utils.json_to_sheet(marketByLocation)
    XLSX.utils.book_append_sheet(wb, marketLocSheet, "Market Location")

    const marketCatSheet = XLSX.utils.json_to_sheet(marketByCategory)
    XLSX.utils.book_append_sheet(wb, marketCatSheet, "Market Category")

    XLSX.writeFile(wb, "employer-statistics.xlsx")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Đang tải thống kê...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-500">{error}</p>
          <Link href="/employer/dashboard" className="text-primary underline">Quay lại Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Thống kê tuyển dụng</h1>
            <p className="text-muted-foreground">KPI nhanh, theo tin, theo ứng viên, theo thị trường</p>
          </div>
          <div className="space-x-2">
            <Link href="/employer/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Button onClick={exportToExcel}>Xuất Excel</Button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Việc đang mở</div>
              <div className="text-3xl font-bold">{kpi.openJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Ứng viên 30 ngày</div>
              <div className="text-3xl font-bold">{kpi.applicantsLast30d}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Chờ xem xét</div>
              <div className="text-3xl font-bold">{kpi.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Đã chấp nhận</div>
              <div className="text-3xl font-bold">{kpi.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Đã từ chối/Đã rút</div>
              <div className="text-3xl font-bold">{kpi.rejected + kpi.withdrawn}</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications over time */}
        <Card>
          <CardHeader>
            <CardTitle>Ứng tuyển theo thời gian</CardTitle>
            <CardDescription>Tổng số đơn theo ngày</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {timeseriesApplications.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeseriesApplications} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    allowDecimals={false}
                    label={{ value: 'Số đơn', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    labelFormatter={(label) => `Ngày: ${label}`}
                    formatter={(value: any) => [`${value} đơn`, 'Số đơn']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    name="Số đơn ứng tuyển"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Chưa có dữ liệu ứng tuyển</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job-level stats */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo tin tuyển dụng</CardTitle>
            <CardDescription>Top tin theo số lượng ứng viên</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {byJob.length > 0 && byJob[0].jobId !== "none" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byJob.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="title" 
                    tick={{ fontSize: 11 }} 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    allowDecimals={false}
                    label={{ value: 'Số lượng', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [`${value}`, name]}
                  />
                  <Legend />
                  <Bar dataKey="applicants" name="Tổng ứng viên" fill="#60a5fa" />
                  <Bar dataKey="approved" name="Đã chấp nhận" fill="#34d399" />
                  <Bar dataKey="rejected" name="Đã từ chối" fill="#f87171" />
                  <Bar dataKey="pending" name="Chờ xem xét" fill="#eab308" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Chưa có dữ liệu theo tin tuyển dụng</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funnel (status distribution) */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố trạng thái đơn</CardTitle>
            <CardDescription>Tổng quan PENDING/APPROVED/REJECTED/WITHDRAWN</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {funnelData.length > 0 && funnelData[0].value > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={funnelData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                  >
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} đơn`, 'Số lượng']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Chưa có dữ liệu trạng thái đơn</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Phân bố theo địa điểm</CardTitle>
              <CardDescription>Số tin theo địa điểm</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {marketByLocation.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketByLocation} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="location" 
                      tick={{ fontSize: 11 }} 
                      interval={0} 
                      angle={-45} 
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis 
                      allowDecimals={false}
                      label={{ value: 'Số tin', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value} tin`, 'Số tin']}
                    />
                    <Bar dataKey="count" name="Số tin" fill="#a78bfa" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Chưa có dữ liệu theo địa điểm</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân bố theo ngành</CardTitle>
              <CardDescription>Số tin theo category</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {marketByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 11 }} 
                      interval={0} 
                      angle={-45} 
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis 
                      allowDecimals={false}
                      label={{ value: 'Số tin', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value} tin`, 'Số tin']}
                    />
                    <Bar dataKey="count" name="Số tin" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Chưa có dữ liệu theo ngành</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


