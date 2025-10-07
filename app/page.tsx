"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Briefcase, 
  Building2, 
  Users, 
  TrendingUp,
  Star,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Loader2
} from "lucide-react"
import { api, JobPost } from "@/lib/api"
import ApiTestComponent from "@/components/api-test"
import ClientOnly from "@/components/client-only"

export default function HomePage() {
  const [featuredJobs, setFeaturedJobs] = useState<JobPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchLocation, setSearchLocation] = useState("")

  useEffect(() => {
    fetchFeaturedJobs()
  }, [])

  const fetchFeaturedJobs = async () => {
    setIsLoading(true)
    try {
      const response = await api.getActiveJobs({ 
        page: 0, 
        size: 6,
        sort: "postedDate,desc"
      })
      console.log("Featured Jobs Response:", response)
      
      // Handle response structure from backend
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchKeyword) params.append("keyword", searchKeyword)
    if (searchLocation) params.append("location", searchLocation)
    
    const queryString = params.toString()
    window.location.href = `/jobs${queryString ? `?${queryString}` : ""}`
  }
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Tìm việc làm IT{" "}
              <span className="text-primary">chất lượng cao</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Kết nối với hàng nghìn cơ hội việc làm IT từ các công ty hàng đầu Việt Nam. 
              Tìm kiếm công việc phù hợp với kỹ năng và kinh nghiệm của bạn.
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
                <div className="text-2xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Việc làm</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2,500+</div>
                <div className="text-sm text-muted-foreground">Công ty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50,000+</div>
                <div className="text-sm text-muted-foreground">Ứng viên</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">95%</div>
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
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.length > 0 ? (
                featuredJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg line-clamp-2">
                              <Link href={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                                {job.title}
                              </Link>
                            </CardTitle>
                            <CardDescription>{job.employerName || "Công ty chưa cập nhật"}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm ml-1">4.8</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {job.minSalary && job.maxSalary 
                            ? `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} VNĐ`
                            : job.minSalary 
                              ? `Từ ${job.minSalary.toLocaleString()} VNĐ`
                              : job.maxSalary 
                                ? `Đến ${job.maxSalary.toLocaleString()} VNĐ`
                                : "Thỏa thuận"
                          }
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          {job.jobType === "FULL_TIME" ? "Toàn thời gian" :
                           job.jobType === "PART_TIME" ? "Bán thời gian" :
                           job.jobType === "CONTRACT" ? "Hợp đồng" : "Thực tập"}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">React</span>
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">TypeScript</span>
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Next.js</span>
                        </div>
                        <div className="flex items-center justify-between pt-4">
                          <span className="text-sm text-green-600 font-medium">Mới đăng</span>
                          <Link href={`/jobs/${job.id}`}>
                            <Button size="sm">
                              Xem chi tiết
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Chưa có việc làm nào</h3>
                  <p className="text-muted-foreground mb-4">
                    Hiện tại chưa có việc làm nào được đăng tuyển
                  </p>
                  <Link href="/jobs">
                    <Button variant="outline">
                      Xem tất cả việc làm
                    </Button>
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

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((company) => (
              <Card key={company} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">TechCorp</h3>
                  <p className="text-sm text-muted-foreground mb-2">50+ việc làm</p>
                  <div className="flex items-center justify-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm ml-1">4.9</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Test Section - Remove this in production */}
      {/* <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">API Connection Test</h2>
            <p className="text-muted-foreground">
              Test connection to backend API (Development only)
            </p>
          </div>
          <ClientOnly fallback={<div className="text-center py-8">Đang tải API test...</div>}>
            <ApiTestComponent />
          </ClientOnly>
        </div>
      </section> */}

      {/* CTA Section */}
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
    </div>
  )
}
