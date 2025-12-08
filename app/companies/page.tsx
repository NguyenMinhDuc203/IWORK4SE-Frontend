"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Building2, MapPin, Loader2, ArrowRight } from "lucide-react"
import { api } from "@/lib/api"
import { ApiError } from "@/lib/api"

interface Company {
  companyName: string
  industry: string
  location: string
  logoUrl: string
  description: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState("")

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.getDistinctCompanies()

      if (response.data && Array.isArray(response.data)) {
        setCompanies(response.data)
        setFilteredCompanies(response.data)
      } else {
        setCompanies([])
        setFilteredCompanies([])
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Có lỗi xảy ra khi tải danh sách công ty")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    if (!value) {
      setFilteredCompanies(companies)
    } else {
      const filtered = companies.filter(
        (company) =>
          company.companyName.toLowerCase().includes(value.toLowerCase()) ||
          company.industry?.toLowerCase().includes(value.toLowerCase()) ||
          company.location?.toLowerCase().includes(value.toLowerCase()) ||
          company.description?.toLowerCase().includes(value.toLowerCase()),
      )
      setFilteredCompanies(filtered)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải danh sách công ty...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Danh sách công ty</h1>
            <p className="text-lg text-muted-foreground">
              Khám phá các công ty công nghệ hàng đầu Việt Nam và cơ hội việc làm tuyệt vời từ các nhà tuyển dụng uy tín
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Tìm công ty, ngành nghề, địa điểm..."
                className="pl-10 h-12 text-lg"
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {error && (
            <Alert className="mb-8 border-destructive bg-destructive/10">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Summary */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground">
              Tìm thấy <span className="font-semibold text-foreground">{filteredCompanies.length}</span> công ty
            </p>
          </div>

          {/* Companies Grid */}
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Không tìm thấy công ty nào</h3>
              <p className="text-muted-foreground mb-6">
                {searchKeyword ? "Thử thay đổi từ khóa tìm kiếm để xem thêm kết quả" : "Hiện tại chưa có công ty nào"}
              </p>
              {searchKeyword && (
                <Button variant="outline" onClick={() => handleSearch("")} className="gap-2">
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company, index) => (
                <Link
                  key={`${company.companyName}-${index}`}
                  href={`/companies/${encodeURIComponent(company.companyName)}`}
                  className="block group h-full"
                >
                  <Card className="h-full flex flex-col hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        {/* Company Logo */}
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                          {company.logoUrl ? (
                            <img
                              src={company.logoUrl || "/placeholder.svg"}
                              alt={company.companyName}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <Building2 className="h-8 w-8 text-primary" />
                          )}
                        </div>

                        {/* Company Name - Fixed 2 lines */}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2 h-14 flex items-start">
                            {company.companyName}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow flex flex-col gap-3">
                      {/* Industry */}
                      {company.industry && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          <span className="font-semibold text-foreground">Ngành:</span> {company.industry}
                        </p>
                      )}

                      {/* Location */}
                      {company.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground line-clamp-1">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>{company.location}</span>
                        </div>
                      )}

                      {/* Description - Fixed height */}
                      <div className="h-20 overflow-hidden">
                        <p className="text-sm text-muted-foreground line-clamp-4">
                          {company.description || "Không có mô tả"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* View All CTA */}
          {filteredCompanies.length > 0 && filteredCompanies.length < companies.length && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" onClick={() => handleSearch("")} className="gap-2">
                Xem tất cả công ty
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
