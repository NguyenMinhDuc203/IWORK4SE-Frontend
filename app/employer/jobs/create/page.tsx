"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { api, type JobCategory } from "@/lib/api"
import { RichTextEditor } from "@/components/rich-text-editor"

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
    jobType: "INTERNSHIP" as "INTERNSHIP" | "FRESHER" | "JUNIOR" | "SENIOR" | "MANAGER",
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
      // Try no-pagination first with retry
      let resAll
      try {
        resAll = await api.getAllJobCategories()
      } catch (e) {
        // Retry once after 2 seconds
        console.log("Retrying getAllJobCategories...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
        resAll = await api.getAllJobCategories()
      }

      if (resAll.data && resAll.data.length > 0) {
        setCategories(resAll.data)
      } else {
        throw new Error("No categories returned")
      }
    } catch (e) {
      console.log("getAllJobCategories failed, trying paginated endpoint...")
      try {
        // Fallback to paginated endpoint
        const resPaged = await api.getJobCategories({ page: 0, size: 100 })
        if (resPaged.data?.content && resPaged.data.content.length > 0) {
          setCategories(resPaged.data.content)
        } else {
          throw new Error("No categories from paginated endpoint")
        }
      } catch (fallbackError) {
        console.log("All API endpoints failed, using fallback categories")
        // Fallback to hardcoded categories
        setCategories([
          { id: 1, categoryName: "Software Engineer", description: "", createAt: "", updateAt: "" },
          { id: 2, categoryName: "Backend Developer", description: "", createAt: "", updateAt: "" },
          { id: 3, categoryName: "Frontend Developer", description: "", createAt: "", updateAt: "" },
          { id: 4, categoryName: "Fullstack Developer", description: "", createAt: "", updateAt: "" },
          { id: 5, categoryName: "Mobile Developer", description: "", createAt: "", updateAt: "" },
          { id: 6, categoryName: "DevOps Engineer", description: "", createAt: "", updateAt: "" },
          { id: 7, categoryName: "Data Scientist", description: "", createAt: "", updateAt: "" },
          { id: 8, categoryName: "AI Engineer", description: "", createAt: "", updateAt: "" },
          { id: 9, categoryName: "QA Engineer", description: "", createAt: "", updateAt: "" },
          { id: 10, categoryName: "Project Manager", description: "", createAt: "", updateAt: "" },
        ])
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

      // Try to create job post with retry mechanism
      let jobCreated = false
      let retryCount = 0
      const maxRetries = 2

      while (!jobCreated && retryCount < maxRetries) {
        try {
          await api.createJobPost({ ...form, employerId })
          jobCreated = true
        } catch (error: any) {
          retryCount++
          if (retryCount < maxRetries) {
            console.log(`Retry ${retryCount} for createJobPost...`)
            // Wait 3 seconds before retry
            await new Promise((resolve) => setTimeout(resolve, 3000))
          } else {
            throw error
          }
        }
      }

      if (jobCreated) {
        router.push("/employer/jobs")
      }
    } catch (e: any) {
      console.error("Create job post error:", e)
      setError(e?.message || "Tạo tin tuyển dụng thất bại. Vui lòng thử lại sau.")
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
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả công việc</Label>
              <RichTextEditor
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
                placeholder="Mô tả chi tiết về công việc..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobPosition">Vị trí công việc</Label>
                <Input
                  id="jobPosition"
                  value={form.jobPosition}
                  onChange={(e) => setForm({ ...form, jobPosition: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Kinh nghiệm làm việc</Label>
                <Select value={form.experience} onValueChange={(v: string) => setForm({ ...form, experience: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kinh nghiệm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Không yêu cầu">Không yêu cầu</SelectItem>
                    <SelectItem value="Dưới 1 năm">Dưới 1 năm</SelectItem>
                    <SelectItem value="1-2 năm">1-2 năm</SelectItem>
                    <SelectItem value="3-5 năm">3-5 năm</SelectItem>
                    <SelectItem value="Trên 5 năm">Trên 5 năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm làm việc</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minSalary">Lương tối thiểu</Label>
                <Input
                  id="minSalary"
                  type="number"
                  step={100000}
                  min={0}
                  value={form.minSalary}
                  onChange={(e) => setForm({ ...form, minSalary: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxSalary">Lương tối đa</Label>
                <Input
                  id="maxSalary"
                  type="number"
                  step={100000}
                  min={0}
                  value={form.maxSalary}
                  onChange={(e) => setForm({ ...form, maxSalary: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vacancies">Số lượng tuyển</Label>
                <Input
                  id="vacancies"
                  type="number"
                  min={1}
                  value={form.vacancies}
                  onChange={(e) => setForm({ ...form, vacancies: Number(e.target.value) })}
                  required
                />
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
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang đăng...
                </>
              ) : (
                "Đăng tin"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
