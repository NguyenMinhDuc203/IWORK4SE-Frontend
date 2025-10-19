"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Filter, User, MapPin, GraduationCap, Star, Loader2, Mail, Phone, Calendar, Save, Plus } from "lucide-react"
import { api, type ApplicantDocument, type ApplicantSearchRequest } from "@/lib/api"

export default function ApplicantSearchPage() {
  const router = useRouter()
  const [applicants, setApplicants] = useState<ApplicantDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 20,
    totalPages: 0,
    totalElements: 0,
  })

  const [searchParams, setSearchParams] = useState<ApplicantSearchRequest>({
    keywords: "",
    minExperience: undefined,
    minGpa: undefined,
    skill: "",
    major: "",
    university: "",
    gender: undefined,
    userStatus: "ACTIVE",
    page: 0,
    size: 20,
  })

  const [showFilters, setShowFilters] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantDocument | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [availableLists, setAvailableLists] = useState<any[]>([])
  const [saveForm, setSaveForm] = useState({
    listId: "",
    notes: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem("userType")
    if (role !== "EMPLOYER") {
      router.push("/login")
    }
  }, [router])

  const handleSearch = async () => {
    setIsLoading(true)
    setError("")
    try {
      console.log("Search params:", searchParams)
      const response = await api.searchApplicants(searchParams)
      console.log("API response:", response)
      
      // Check if response has the expected Spring Boot Page structure
      if (response && response.content && Array.isArray(response.content)) {
        setApplicants(response.content)
        setPagination({
          pageNumber: response.number || 0,
          pageSize: response.size || 20,
          totalPages: response.totalPages || 1,
          totalElements: response.totalElements || 0,
        })
      } else {
        console.error("Unexpected response structure:", response)
        setError("Cấu trúc dữ liệu không đúng định dạng")
        setApplicants([])
      }
    } catch (e: any) {
      console.error("Search error:", e)
      setError(e?.message || "Tìm kiếm ứng viên thất bại")
      setApplicants([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    const newParams = { ...searchParams, page: newPage }
    setSearchParams(newParams)
    // Trigger search with new page
    handleSearch()
  }

  const clearFilters = () => {
    setSearchParams({
      keywords: "",
      minExperience: undefined,
      minGpa: undefined,
      skill: "",
      major: "",
      university: "",
      gender: undefined,
      userStatus: "ACTIVE",
      page: 0,
      size: 20,
    })
    setApplicants([])
  }

  const handleSaveApplicant = (applicant: ApplicantDocument) => {
    setSelectedApplicant(applicant)
    setShowSaveDialog(true)
    // TODO: Load available lists
    setAvailableLists([
      { id: "LIST001", listName: "Java Developers" },
      { id: "LIST002", listName: "Senior Candidates" },
    ])
  }

  const handleSave = async () => {
    if (!selectedApplicant || !saveForm.listId) return

    setIsSaving(true)
    try {
      // TODO: Implement API call to save applicant
      // await api.saveApplicant({
      //   listId: saveForm.listId,
      //   applicantId: selectedApplicant.id,
      //   notes: saveForm.notes
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setShowSaveDialog(false)
      setSaveForm({ listId: "", notes: "" })
      setSelectedApplicant(null)
      
      // Show success message
      alert("Đã lưu ứng viên vào danh sách thành công!")
    } catch (e: any) {
      setError(e?.message || "Lưu ứng viên thất bại")
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getExperienceText = (years: number) => {
    if (years === 0) return "Chưa có kinh nghiệm"
    if (years === 1) return "1 năm kinh nghiệm"
    return `${years} năm kinh nghiệm`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tìm kiếm ứng viên</h1>
        <p className="text-gray-600">Tìm kiếm ứng viên phù hợp với yêu cầu tuyển dụng của bạn</p>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm kiếm ứng viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Keywords Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Tìm kiếm theo tên, kỹ năng, trường đại học..."
                value={searchParams.keywords || ""}
                onChange={(e) => setSearchParams({ ...searchParams, keywords: e.target.value })}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Tìm kiếm
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium">Kinh nghiệm tối thiểu</label>
                  <Select
                    value={searchParams.minExperience?.toString() || ""}
                    onValueChange={(value) => setSearchParams({ 
                      ...searchParams, 
                      minExperience: value ? parseInt(value) : undefined 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kinh nghiệm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 năm</SelectItem>
                      <SelectItem value="1">1 năm</SelectItem>
                      <SelectItem value="2">2 năm</SelectItem>
                      <SelectItem value="3">3 năm</SelectItem>
                      <SelectItem value="5">5 năm</SelectItem>
                      <SelectItem value="10">10 năm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">GPA tối thiểu</label>
                  <Select
                    value={searchParams.minGpa?.toString() || ""}
                    onValueChange={(value) => setSearchParams({ 
                      ...searchParams, 
                      minGpa: value ? parseFloat(value) : undefined 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn GPA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2.0">2.0</SelectItem>
                      <SelectItem value="2.5">2.5</SelectItem>
                      <SelectItem value="3.0">3.0</SelectItem>
                      <SelectItem value="3.5">3.5</SelectItem>
                      <SelectItem value="3.7">3.7</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Giới tính</label>
                  <Select
                    value={searchParams.gender || "all"}
                    onValueChange={(value) => setSearchParams({ 
                      ...searchParams, 
                      gender: value === "all" ? undefined : value as "MALE" | "FEMALE" 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Kỹ năng</label>
                  <Input
                    placeholder="Ví dụ: Java, React, Python..."
                    value={searchParams.skill || ""}
                    onChange={(e) => setSearchParams({ ...searchParams, skill: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Chuyên ngành</label>
                  <Input
                    placeholder="Ví dụ: Công nghệ thông tin, Kinh tế..."
                    value={searchParams.major || ""}
                    onChange={(e) => setSearchParams({ ...searchParams, major: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Trường đại học</label>
                  <Input
                    placeholder="Ví dụ: Đại học Bách Khoa, Đại học Kinh tế..."
                    value={searchParams.university || ""}
                    onChange={(e) => setSearchParams({ ...searchParams, university: e.target.value })}
                  />
                </div>

                <div className="col-span-full flex gap-2">
                  <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Tìm kiếm
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      <div className="space-y-4">
        {applicants.length > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Tìm thấy {pagination.totalElements} ứng viên
            </p>
            <div className="text-sm text-gray-600">
              Trang {pagination.pageNumber + 1} / {pagination.totalPages}
            </div>
          </div>
        )}

        {/* Applicant Cards */}
        <div className="grid gap-4">
          {applicants.map((applicant) => (
            <Card key={applicant.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {applicant.firstName} {applicant.lastName}
                      </h3>
                      <p className="text-gray-600">{applicant.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {applicant.userStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {applicant.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {applicant.address}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {getExperienceText(applicant.yearsOfExperience)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="h-4 w-4" />
                      {applicant.universityName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {applicant.major} - {applicant.degreeLevel}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="h-4 w-4" />
                      GPA: {applicant.gpa}
                    </div>
                  </div>
                </div>

                {applicant.careerObjective && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Mục tiêu nghề nghiệp</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {applicant.careerObjective}
                    </p>
                  </div>
                )}

                {applicant.skills && applicant.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Kỹ năng</h4>
                    <div className="flex flex-wrap gap-2">
                      {applicant.skills.slice(0, 8).map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                      {applicant.skills.length > 8 && (
                        <Badge variant="outline">
                          +{applicant.skills.length - 8} khác
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {applicant.certificateNames && applicant.certificateNames.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Chứng chỉ</h4>
                    <div className="flex flex-wrap gap-2">
                      {applicant.certificateNames.slice(0, 5).map((cert, index) => (
                        <Badge key={index} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                      {applicant.certificateNames.length > 5 && (
                        <Badge variant="outline">
                          +{applicant.certificateNames.length - 5} khác
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-xs text-gray-500">
                    Tham gia: {formatDate(applicant.createAt)}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Liên hệ
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleSaveApplicant(applicant)}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Lưu vào danh sách
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.pageNumber - 1)}
              disabled={pagination.pageNumber === 0}
            >
              Trước
            </Button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + Math.max(0, pagination.pageNumber - 2)
              if (page >= pagination.totalPages) return null
              return (
                <Button
                  key={page}
                  variant={page === pagination.pageNumber ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                >
                  {page + 1}
                </Button>
              )
            })}
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.pageNumber + 1)}
              disabled={pagination.pageNumber >= pagination.totalPages - 1}
            >
              Sau
            </Button>
          </div>
        )}

        {/* No Results */}
        {!isLoading && applicants.length === 0 && searchParams.keywords && (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Không tìm thấy ứng viên</h3>
              <p className="text-gray-600 mb-4">
                Không có ứng viên nào phù hợp với tiêu chí tìm kiếm của bạn.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Thử lại với bộ lọc khác
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save Applicant Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Lưu ứng viên vào danh sách
            </DialogTitle>
            <DialogDescription>
              Chọn danh sách để lưu ứng viên {selectedApplicant?.firstName} {selectedApplicant?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="listId">Chọn danh sách *</Label>
              <Select
                value={saveForm.listId}
                onValueChange={(value) => setSaveForm({ ...saveForm, listId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh sách" />
                </SelectTrigger>
                <SelectContent>
                  {availableLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.listName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="notes"
                placeholder="Thêm ghi chú về ứng viên này..."
                value={saveForm.notes}
                onChange={(e) => setSaveForm({ ...saveForm, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isSaving || !saveForm.listId}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu vào danh sách
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}