"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import RotatingText from "@/components/RotatingText"
import CountUp from "@/components/CountUp"
import CompanyLogoLoop from "@/components/company-logo-loop"
import { Search, Briefcase, Building2, Users, MapPin, ArrowRight, CheckCircle, Loader2, Flag } from "lucide-react"
import { api, type JobPost } from "@/lib/api"
import { useSavedJobs } from "@/context/saved-jobs-context"

export default function HomePage() {
  const [featuredJobs, setFeaturedJobs] = useState<JobPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchLocation, setSearchLocation] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const savedJobsContext = useSavedJobs()

  const { isSaved, toggleSaveJob: toggleSaveJobContext } = savedJobsContext

  useEffect(() => {
    fetchFeaturedJobs()
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
  }, [])

  const fetchFeaturedJobs = async () => {
    setIsLoading(true)
    try {
      const response = await api.getActiveJobs({
        page: 0,
        size: 6,
        sort: "postedDate,desc",
      })
      console.log("Featured Jobs Response:", response)

      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        setFeaturedJobs(response.data.content)
      } else {
        console.log("Unexpected response structure:", response)
        setFeaturedJobs([])
      }
    } catch (error) {
      console.error("Error fetching featured jobs:", error)
      setFeaturedJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSaveJob = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const token = localStorage.getItem("token")
    if (!token) {
      alert("Vui lòng đăng nhập để lưu việc làm")
      return
    }

    try {
      console.log("[v0] Toggling save for job:", jobId, "Current saved state:", isSaved(jobId))
      await toggleSaveJobContext(jobId)
      console.log("[v0] Toggle complete. New saved state:", !isSaved(jobId))
    } catch (error) {
      console.error("Error saving job:", error)
      alert("Không thể lưu việc làm. Vui lòng thử lại.")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchKeyword) params.append("keyword", searchKeyword)
    if (searchLocation) params.append("location", searchLocation)

    const queryString = params.toString()
    window.location.href = `/jobs${queryString ? `?${queryString}` : ""}`
  }

  const formatSalaryShort = (salary: number) => {
    if (salary >= 1000000) {
      const millions = salary / 1000000
      return `${Number(millions.toFixed(1))} Triệu`
    }

    return salary.toLocaleString()
  }
  return (
    <div className="min-h-screen px-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 ">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto ">
            <div className="flex flex-col items-center justify-start -pt-20 md:pt-32 ml-15 mb-30">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground flex items-baseline flex-wrap gap-x-3 text-center -mt-35">
                <span>Tìm việc làm IT</span>
                <div className="w-[380px] text-left overflow-hidden relative">
                  <RotatingText
                    texts={["chất lượng", "nhanh chóng", "phù hợp"]}
                    mainClassName="text-primary"
                    staggerFrom={"last"}
                    initial={{ y: "120%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-150%" }}
                    staggerDuration={0.05}
                    splitLevelClassName="overflow-hidden py-2 will-change-transform"
                    transition={{ type: "spring", damping: 50, stiffness: 450 }}
                    rotationInterval={3000}
                  />
                </div>
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Kết nối với hàng nghìn cơ hội việc làm IT từ các công ty hàng đầu Việt Nam. Tìm kiếm công việc phù hợp với
              kỹ năng và kinh nghiệm của bạn.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Tìm việc làm, công ty, kỹ năng..."
                    className="pl-10 h-12 text-lg"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Địa điểm"
                    className="pl-10 h-12 text-lg"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-8">
                  <Search className="h-5 w-5 mr-2" />
                  Tìm kiếm
                </Button>
              </form>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <CountUp
                  from={9910}
                  to={10000}
                  duration={0.5}
                  separator=","
                  suffix="+"
                  enableScrollSpy={true}
                  scrollSpyOnce={true}
                  className="text-2xl font-bold text-primary"
                />
                <span className="text-2xl font-bold text-primary">+</span>
                <div className="text-sm text-muted-foreground">Việc làm</div>
              </div>
              <div className="text-center">
                <CountUp
                  from={2410}
                  to={2500}
                  duration={0.5}
                  separator=","
                  suffix="+"
                  enableScrollSpy={true}
                  scrollSpyOnce={true}
                  className="text-2xl font-bold text-primary"
                />
                <span className="text-2xl font-bold text-primary">+</span>
                <div className="text-sm text-muted-foreground">Công ty</div>
              </div>
              <div className="text-center">
                <CountUp
                  from={49910}
                  to={50000}
                  duration={0.5}
                  separator=","
                  suffix="+"
                  enableScrollSpy={true}
                  scrollSpyOnce={true}
                  className="text-2xl font-bold text-primary"
                />
                <span className="text-2xl font-bold text-primary">+</span>
                <div className="text-sm text-muted-foreground">Ứng viên</div>
              </div>
              <div className="text-center">
                <CountUp
                  from={5}
                  to={95}
                  duration={0.5}
                  suffix="%"
                  enableScrollSpy={true}
                  scrollSpyOnce={true}
                  className="text-2xl font-bold text-primary"
                />
                <span className="text-2xl font-bold text-primary">%</span>
                <div className="text-sm text-muted-foreground">Hài lòng</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Việc làm nổi bật</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Khám phá những cơ hội việc làm hấp dẫn từ các công ty công nghệ hàng đầu
            </p>
          </div>

          {isLoading ? (
            <div className="container mx-auto px-4 py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Đang tải...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.length > 0 ? (
                featuredJobs.map((job) => (
                  <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block group h-full"
              >
                <Card className="h-full flex flex-col justify-between hover:shadow-lg hover:border-primary/50 transition-all duration-200">
                  <CardHeader className="pb-0 min-h-[10px]">
                    <div className="flex items-start justify-between gap-3 h-full">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Logo */}
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
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

                        {/* Job Info */}
                        <div className="w-4/5 min-w-0 flex flex-col">
                          <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                      
                            {job.title}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {job.companyName || job.employerName || "Công ty chưa cập nhật"}
                          </CardDescription>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => toggleSaveJob(job.id, e)}
                        className={`flex-shrink-0 h-8 w-8 p-0 ${isSaved(job.id)
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-muted-foreground hover:text-yellow-500"
                          }`}
                      >
                        <Flag className={`h-4 w-4 ${isSaved(job.id) ? "fill-yellow-500" : ""}`} />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Image
                        src="/assets/placeholder.png"
                        width={40}
                        height={40}
                        alt="Position"
                        className="h-5 w-5 mr-2 flex-shrink-0 object-contain"
                      />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Image
                        src="/assets/position.png"
                        width={40}
                        height={40}
                        alt="Job Type"
                        className="h-5 w-5 mr-2 flex-shrink-0 object-contain"
                      />
                      <span>
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
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Image
                        src="/assets/salary.png"
                        width={40}
                        height={40}
                        alt="Salary"
                        className="h-5 w-5 mr-2 flex-shrink-0 object-contain"
                      />
                      <span className="truncate">
                        {job.minSalary && job.maxSalary
                          ? `${formatSalaryShort(job.minSalary)} - ${formatSalaryShort(job.maxSalary)} VNĐ`
                          : job.minSalary
                            ? `Từ ${formatSalaryShort(job.minSalary)} VNĐ`
                            : job.maxSalary
                              ? `Đến ${formatSalaryShort(job.maxSalary)} VNĐ`
                              : "Thỏa thuận"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Chưa có việc làm nào</h3>
                  <p className="text-muted-foreground mb-4">Hiện tại chưa có việc làm nào được đăng tuyển</p>
                  <Link href="/jobs">
                    <Button variant="outline">Xem tất cả việc làm</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/jobs">
              <Button size="lg" variant="outline">
                Xem tất cả việc làm
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tại sao chọn iWork4SE?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chúng tôi cung cấp những công cụ và dịch vụ tốt nhất để giúp bạn tìm được công việc mơ ước
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tìm kiếm thông minh</h3>
              <p className="text-muted-foreground">
                Công nghệ AI giúp bạn tìm được việc làm phù hợp nhất dựa trên kỹ năng và kinh nghiệm
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chất lượng đảm bảo</h3>
              <p className="text-muted-foreground">
                Tất cả việc làm đều được kiểm duyệt kỹ lưỡng để đảm bảo tính chính xác và uy tín
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cộng đồng lớn</h3>
              <p className="text-muted-foreground">
                Tham gia cộng đồng hơn 50,000 ứng viên và 2,500+ công ty công nghệ hàng đầu
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Công ty hàng đầu</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Khám phá cơ hội việc làm từ các công ty công nghệ hàng đầu Việt Nam
            </p>
          </div>

          <CompanyLogoLoop />
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng tìm việc làm mơ ước?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Tham gia ngay để khám phá hàng nghìn cơ hội việc làm IT hấp dẫn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Đăng ký ngay
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Khám phá việc làm
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
