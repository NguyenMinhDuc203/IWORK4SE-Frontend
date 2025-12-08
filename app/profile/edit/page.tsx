"use client"

import type React from "react"

import { useState, useEffect, type KeyboardEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Camera, X, Plus, Edit, Trash2, Loader2, CheckCircle, Shield } from "lucide-react"
import { api } from "@/lib/api"

interface Certificate {
  certificateName: string
  issuingOrganization: string
  issueDate: string
  expirationDate?: string
  certificateId?: string
  certificateUrl?: string
  notes?: string
}

interface Education {
  universityName: string
  major: string
  gpa?: number
  degreeLevel: string
  graduationYear: number
  description?: string
}

export default function ProfileEditPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userStatus, setUserStatus] = useState<"ACTIVE" | "INACTIVE" | "BANNED" | "DELETED" | "PENDING" | null>(null)
  const [isRequestingActivation, setIsRequestingActivation] = useState(false)
  const [showActivationModal, setShowActivationModal] = useState(false)

  // Check user type and redirect accordingly
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType === "EMPLOYER") {
      router.push("/employer/profile/edit")
    } else if (!userType || userType === "APPLICANT") {
      // Continue with applicant profile edit
    } else {
      router.push("/login")
    }
  }, [router])

  // Basic Info
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [birthday, setBirthday] = useState("")
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE")
  const [address, setAddress] = useState("")
  const [careerObjective, setCareerObjective] = useState("")
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0)

  // Skills
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false)

  const [education, setEducation] = useState<Education>({
    universityName: "",
    major: "",
    gpa: undefined,
    degreeLevel: "",
    graduationYear: new Date().getFullYear(),
    description: "",
  })
  const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false)

  const translateDegreeLevel = (level: string): string => {
    const translations: { [key: string]: string } = {
      ASSOCIATE: "Cao đẳng",
      BACHELOR: "Đại học",
      MASTER: "Thạc sĩ",
      DOCTORATE: "Tiến sĩ",
    }
    return translations[level] || level
  }

  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isCertificateDialogOpen, setIsCertificateDialogOpen] = useState(false)
  const [currentCertificate, setCurrentCertificate] = useState<Certificate>({
    certificateName: "",
    issuingOrganization: "",
    issueDate: "",
    expirationDate: "",
    notes: "",
  })
  const [editingCertificateIndex, setEditingCertificateIndex] = useState<number | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const userId = localStorage.getItem("userId")

      if (userId) {
        const response = await api.getApplicantById(userId)
        if (response.data) {
          const applicant = response.data
          console.log("Loaded applicant data:", applicant)

          setFirstName(applicant.firstName || "")
          setLastName(applicant.lastName || "")
          setEmail(applicant.email || "")
          setPhone(applicant.phone || "")
          setAddress(applicant.address || "")
          setBirthday(applicant.birthday || "")
          setGender(applicant.gender || "MALE")
          setYearsOfExperience(applicant.yearsOfExperience || 0)
          setCareerObjective(applicant.careerObjective || "")

          if (applicant.skills) {
            if (Array.isArray(applicant.skills)) {
              setSkills(applicant.skills)
            } else {
              setSkills(
                applicant.skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s),
              )
            }
          }

          if (applicant.universityName || applicant.major) {
            setEducation({
              universityName: applicant.universityName || "",
              major: applicant.major || "",
              gpa: applicant.gpa || undefined,
              degreeLevel: applicant.degreeLevel || "",
              graduationYear: applicant.graduationYear || new Date().getFullYear(),
            })
          }

          if (applicant.certificates && Array.isArray(applicant.certificates)) {
            setCertificates(applicant.certificates)
          }

          // Lấy userStatus từ response (có thể nằm trong userStatus hoặc status)
          if ((applicant as any).userStatus) {
            setUserStatus((applicant as any).userStatus)
          } else if ((applicant as any).status) {
            setUserStatus((applicant as any).status)
          }
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()])
      }
      setSkillInput("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleEditEducation = () => {
    setIsEducationDialogOpen(true)
  }

  const handleSaveEducation = () => {
    if (!education.universityName || !education.major || !education.degreeLevel) {
      setError("Vui lòng điền đầy đủ thông tin trường học, chuyên ngành và bằng cấp")
      return
    }

    updateProfile({
      universityName: education.universityName,
      major: education.major,
      gpa: education.gpa,
      degreeLevel: education.degreeLevel,
      graduationYear: education.graduationYear,
    })

    setIsEducationDialogOpen(false)
  }

  const handleDeleteEducation = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông tin học tập?")) {
      updateProfile({
        universityName: null,
        major: null,
        gpa: null,
        degreeLevel: null,
        graduationYear: null,
      })
      setEducation({
        universityName: "",
        major: "",
        gpa: undefined,
        degreeLevel: "",
        graduationYear: new Date().getFullYear(),
        description: "",
      })
    }
  }

  const handleAddCertificate = () => {
    setCurrentCertificate({
      certificateName: "",
      issuingOrganization: "",
      issueDate: "",
      expirationDate: "",
      notes: "",
    })
    setEditingCertificateIndex(null)
    setIsCertificateDialogOpen(true)
  }

  const handleEditCertificate = (index: number) => {
    setCurrentCertificate(certificates[index])
    setEditingCertificateIndex(index)
    setIsCertificateDialogOpen(true)
  }

  const handleSaveCertificate = () => {
    if (!currentCertificate.certificateName || !currentCertificate.issuingOrganization) {
      setError("Vui lòng điền đầy đủ tên chứng chỉ và tổ chức cấp")
      return
    }

    let updatedCertificates: Certificate[]
    if (editingCertificateIndex !== null) {
      updatedCertificates = [
        ...certificates.slice(0, editingCertificateIndex),
        currentCertificate,
        ...certificates.slice(editingCertificateIndex + 1),
      ]
    } else {
      updatedCertificates = [...certificates, currentCertificate]
    }

    setCertificates(updatedCertificates)

    updateProfile({
      certificates: updatedCertificates,
    })

    setIsCertificateDialogOpen(false)
  }

  const handleDeleteCertificate = (index: number) => {
    const updated = certificates.filter((_, i) => i !== index)
    setCertificates(updated)

    updateProfile({
      certificates: updated,
    })
  }

  const updateProfile = async (updates: any) => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        setError("Không tìm thấy thông tin người dùng")
        return
      }

      const payload: any = {
        id: userId,
        firstName,
        lastName,
        phone,
        email,
        address,
        birthday,
        gender,
        yearsOfExperience,
        skills,
        careerObjective,
        universityName: education.universityName,
        major: education.major,
        gpa: education.gpa,
        degreeLevel: education.degreeLevel,
        graduationYear: education.graduationYear,
        certificates: certificates.length > 0 ? certificates : undefined,
      }

      Object.assign(payload, updates)

      await api.updateApplicant(payload)

      setSuccess("Cập nhật hồ sơ thành công!")
      setTimeout(() => {
        setSuccess("")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Cập nhật hồ sơ thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        setError("Không tìm thấy thông tin người dùng")
        return
      }

      await api.updateApplicant({
        id: localStorage.getItem("userId"),
        firstName,
        lastName,
        phone: phone,
        email,
        address,
        birthday: birthday,
        gender,
        yearsOfExperience: yearsOfExperience,
        skills: skills,
        universityName: education.universityName,
        major: education.major,
        gpa: education.gpa,
        degreeLevel: education.degreeLevel,
        graduationYear: education.graduationYear,
        careerObjective: careerObjective,
        certificates: certificates.length > 0 ? certificates : undefined,
      })

      setSuccess("Cập nhật hồ sơ thành công!")
      // setTimeout(() => {
      //   router.push("/profile")
      // }, 1500)
    } catch (err: any) {
      setError(err.message || "Cập nhật hồ sơ thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestActivation = async () => {
    const userId = localStorage.getItem("userId")
    if (!userId) return

    setIsRequestingActivation(true)
    try {
      await api.requestActivation(userId)
      setShowActivationModal(true)
    } catch (error: any) {
      setError(error?.message || "Không thể gửi yêu cầu kích hoạt. Vui lòng thử lại sau.")
    } finally {
      setIsRequestingActivation(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="text-primary hover:underline">
            Trang chủ
          </Link>
          {" / "}
          <span>Cập nhật hồ sơ</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Cập nhật hồ sơ</h1>
          <div className="flex items-center gap-3">
            {userStatus === "ACTIVE" ? (
              <span className="text-green-600 font-medium text-sm cursor-default">Đã kích hoạt</span>
            ) : userStatus === "INACTIVE" ? (
              <Button
                onClick={handleRequestActivation}
                disabled={isRequestingActivation}
                variant="outline"
                size="lg"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              >
                {isRequestingActivation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Kích hoạt
                  </>
                )}
              </Button>
            ) : null}
            <Button onClick={handleSubmit} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Lưu lại
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Chính</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Photo */}
              {/* <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <span className="text-3xl text-gray-400">👤</span>
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
              </div> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Họ</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nhập họ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Tên</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nhập tên"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthday">Năm sinh</Label>
                  <Input id="birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  <Select value={gender} onValueChange={(value: any) => setGender(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Số năm kinh nghiệm</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Cơ Bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="careerObjectiveText">Mục tiêu nghề nghiệp</Label>
                <Textarea
                  id="careerObjectiveText"
                  value={careerObjective}
                  onChange={(e) => setCareerObjective(e.target.value)}
                  placeholder="Nhập mục tiêu nghề nghiệp của bạn"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Chỗ ở hiện tại</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Kỹ Năng Chuyên Môn</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsSkillDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm kỹ năng chuyên môn
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                  >
                    <span className="text-sm font-medium">{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-blue-100 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quá Trình Học Tập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.universityName ? (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {education.universityName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Năm tốt nghiệp: {education.graduationYear ? education.graduationYear : "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={handleEditEducation}>
                        <Edit className="h-4 w-4 mr-1" />
                        Chỉnh sửa
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteEducation}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">{education.universityName}</h3>
                  <p className="text-sm text-gray-600">
                    Bằng cấp: {education.degreeLevel ? translateDegreeLevel(education.degreeLevel) : "Chưa cập nhật"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Chuyên ngành: {education.major ? education.major : "Chưa cập nhật"}
                  </p>
                  {education.gpa && <p className="text-sm text-gray-600">GPA: {education.gpa}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Chưa có thông tin học tập.</p>
                  <Button type="button" variant="outline" size="sm" onClick={handleEditEducation}>
                    <Plus className="h-4 w-4 mr-0" />
                    Thêm mới
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Chứng Chỉ & Giấy Phép</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddCertificate}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm chứng chỉ
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificates.length > 0 ? (
                certificates.map((cert, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                          {cert.certificateName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cấp bởi: {cert.issuingOrganization}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleEditCertificate(index)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Chỉnh sửa
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCertificate(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg">{cert.certificateName}</h3>
                    <p className="text-sm text-gray-600">Ngày cấp: {cert.issueDate}</p>
                    {cert.expirationDate && <p className="text-sm text-gray-600">Hết hạn: {cert.expirationDate}</p>}
                    {cert.notes && <p className="text-sm text-gray-600 mt-2">{cert.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Chưa có chứng chỉ nào. Hãy thêm chứng chỉ của bạn.</p>
              )}
            </CardContent>
          </Card>
        </form>

        {/* Skills Dialog */}
        <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Kỹ năng chuyên môn</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="skillInput">
                  Tên kỹ năng chuyên môn <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="skillInput"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Nhập tên kỹ năng và nhấn Enter"
                  className="text-base"
                />
                <p className="text-sm text-gray-500">Nhấn Enter để thêm kỹ năng</p>
              </div>

              {/* Selected Skills */}
              {skills.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                      >
                        <span className="text-sm font-medium">{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:bg-blue-100 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold">Để Xuất Dựa Trên Hồ Sơ Của Bạn</h3>
                <p className="text-sm text-gray-500">Các kỹ năng phổ biến trong ngành của bạn</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setIsSkillDialogOpen(false)} className="w-full">
                XÁC NHẬN
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Education Dialog */}
        <Dialog open={isEducationDialogOpen} onOpenChange={setIsEducationDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Quá trình học tập</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="universityName">Trường học</Label>
                  <Input
                    id="universityName"
                    value={education.universityName}
                    onChange={(e) => setEducation({ ...education, universityName: e.target.value })}
                    placeholder="Tên trường học"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degreeLevel">Bằng cấp</Label>
                  <Select
                    value={education.degreeLevel}
                    onValueChange={(value) => setEducation({ ...education, degreeLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bằng cấp..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ASSOCIATE">Cao đẳng</SelectItem>
                      <SelectItem value="BACHELOR">Đại học</SelectItem>
                      <SelectItem value="MASTER">Thạc sĩ</SelectItem>
                      <SelectItem value="DOCTORATE">Tiến sĩ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="major">Chuyên ngành</Label>
                  <Input
                    id="major"
                    value={education.major}
                    onChange={(e) => setEducation({ ...education, major: e.target.value })}
                    placeholder="Ngành học"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.1"
                    value={education.gpa || ""}
                    onChange={(e) =>
                      setEducation({ ...education, gpa: e.target.value ? Number(e.target.value) : undefined })
                    }
                    placeholder="Ví dụ: 3.5"
                    min="0"
                    max="4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduationYear">Năm tốt nghiệp</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={education.graduationYear || ""}
                  onChange={(e) =>
                    setEducation({ ...education, graduationYear: e.target.value ? Number(e.target.value) : 0 })
                  }
                  placeholder="Nhập năm tốt nghiệp"
                  min="1950"
                  max={new Date().getFullYear() + 50}
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="description">Mô tả quá trình học tập</Label>
                <Textarea
                  id="description"
                  value={education.description || ""}
                  onChange={(e) => setEducation({ ...education, description: e.target.value })}
                  placeholder="Dự án, nghiên cứu cá nhân, thành tựu, kinh nghiệm đã tích lũy..."
                  rows={4}
                />
              </div> */}
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleSaveEducation} className="w-full">
                XÁC NHẬN
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Certificate Dialog */}
        <Dialog open={isCertificateDialogOpen} onOpenChange={setIsCertificateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chứng Chỉ & Giấy Phép</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certificateName">Tên chứng chỉ</Label>
                  <Input
                    id="certificateName"
                    value={currentCertificate.certificateName}
                    onChange={(e) => setCurrentCertificate({ ...currentCertificate, certificateName: e.target.value })}
                    placeholder="Ví dụ: Java Spring Professional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuingOrganization">Tổ chức cấp</Label>
                  <Input
                    id="issuingOrganization"
                    value={currentCertificate.issuingOrganization}
                    onChange={(e) =>
                      setCurrentCertificate({ ...currentCertificate, issuingOrganization: e.target.value })
                    }
                    placeholder="Ví dụ: Spring Academy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Ngày cấp</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={currentCertificate.issueDate}
                    onChange={(e) => setCurrentCertificate({ ...currentCertificate, issueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Ngày hết hạn (nếu có)</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={currentCertificate.expirationDate || ""}
                    onChange={(e) => setCurrentCertificate({ ...currentCertificate, expirationDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={currentCertificate.notes || ""}
                  onChange={(e) => setCurrentCertificate({ ...currentCertificate, notes: e.target.value })}
                  placeholder="Thêm ghi chú về chứng chỉ này (tùy chọn)"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleSaveCertificate} className="w-full">
                XÁC NHẬN
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activation Modal */}
        <Dialog open={showActivationModal} onOpenChange={setShowActivationModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Email kích hoạt đã được gửi</DialogTitle>
              <DialogDescription>
                Email kích hoạt tài khoản đã được gửi. Vui lòng mở hộp thư Email của bạn và nhấn vào đường dẫn kích hoạt để hoàn tất việc kích hoạt tài khoản.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowActivationModal(false)} className="w-full">
                Đã hiểu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
