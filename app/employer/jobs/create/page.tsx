"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { api, type JobCategory } from "@/lib/api"

export default function CreateJobPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    jobPosition: "",
    location: "",
    experience: "",
    minSalary: 0,
    maxSalary: 0,
    vacancies: 1,
    jobType: "INTERNSHIP" as "INTERNSHIP"| "FRESHER" | "JUNIOR" | "SENIOR" | "MANAGER",
    categoryId: "",
  })

  useEffect(() => {
    const role = localStorage.getItem("userType")
    if (role !== "EMPLOYER") {
      router.push("/login")
    }
    // load categories
    void fetchCategories()
  }, [router])

  const fetchCategories = async () => {
    setIsLoadingCategories(true)
    try {
      // Try no-pagination first
      const resAll = await api.getAllJobCategories()
      
        setCategories(resAll.data)
      
    } catch (e) {
      try {
        // Fallback chain if one endpoint is forbidden
        const resPaged = await api.getJobCategories({ page: 0, size: 100 })
        setCategories(resPaged.data?.content || [])
      } catch {
        setCategories([])
      }
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const employerId = localStorage.getItem("userId") || ""
      await api.createJobPost({ ...form, employerId })
      router.push("/employer/jobs")
    } catch (e: any) {
      setError(e?.message || "Tạo tin tuyển dụng thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Đăng tin tuyển dụng</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả công việc</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobPosition">Vị trí công việc</Label>
                <Input id="jobPosition" value={form.jobPosition} onChange={(e) => setForm({ ...form, jobPosition: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Kinh nghiệm làm việc</Label>
                <Select value={form.experience} onValueChange={(v: string) => setForm({ ...form, experience: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kinh nghiệm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<1 năm">Dưới 1 năm</SelectItem>
                    <SelectItem value="1-3 năm">1-3 năm</SelectItem>
                    <SelectItem value="3-5 năm">3-5 năm</SelectItem>
                    <SelectItem value=">5 năm">Trên 5 năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm làm việc</Label>
                <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minSalary">Lương tối thiểu</Label>
                <Input id="minSalary" type="number" step={100000} min={0} value={form.minSalary} onChange={(e) => setForm({ ...form, minSalary: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxSalary">Lương tối đa</Label>
                <Input id="maxSalary" type="number" step={100000} min={0} value={form.maxSalary} onChange={(e) => setForm({ ...form, maxSalary: Number(e.target.value) })} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vacancies">Số lượng tuyển</Label>
                <Input id="vacancies" type="number" min={1} value={form.vacancies} onChange={(e) => setForm({ ...form, vacancies: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Hình thức làm việc</Label>
                <Select value={form.jobType} onValueChange={(v: any) => setForm({ ...form, jobType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp bậc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERNSHIP">Intern</SelectItem>
                    <SelectItem value="FRESHER">Fresher</SelectItem>
                    <SelectItem value="JUNIOR">Junior</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  </SelectContent>

                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phân loại</Label>
                <Select value={form.categoryId} onValueChange={(v: string) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingCategories ? "Đang tải..." : "Chọn phân loại"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.categoryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Đang đăng...</>) : "Đăng tin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


