"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import Stepper, { Step } from "@/components/stepper"
import StepOneAccountType from "@/components/register/step-one-account-type"
import StepTwoApplicantForm from "@/components/register/step-two-applicant-form"
import StepTwoEmployerForm from "@/components/register/step-two-employer-form"

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [accountType, setAccountType] = useState<"APPLICANT" | "EMPLOYER" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [applicantForm, setApplicantForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  })

  const [employerForm, setEmployerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyName: "",
    industry: "",
    address: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
    setError("")
  }

  const handleAccountTypeSelect = (type: "APPLICANT" | "EMPLOYER") => {
    setAccountType(type)
    setError("")
  }

  const handleRegistrationSuccess = (response: any) => {
    console.log("Registration response:", response)

    if (response.data) {
      localStorage.setItem("token", response.data.accessToken)
      localStorage.setItem("refreshToken", response.data.refreshToken)
      localStorage.setItem("userId", response.data.id)
      localStorage.setItem("userType", response.data.userType || accountType)
      localStorage.setItem("fullName", `${response.data.firstName} ${response.data.lastName}`)
      localStorage.setItem("email", response.data.email)
      localStorage.setItem("phone", response.data.phone || "")
      localStorage.setItem("role", response.data.userType || accountType)
    }

    window.dispatchEvent(new Event("auth:changed"))
    router.push("/")
    router.refresh()
  }

  const handleApplicantSubmit = async () => {
    setError("")
    setIsLoading(true)

    if (!applicantForm.firstName.trim()) {
      setError("Vui lòng nhập họ")
      setIsLoading(false)
      return
    }
    if (!applicantForm.lastName.trim()) {
      setError("Vui lòng nhập tên")
      setIsLoading(false)
      return
    }
    if (!applicantForm.email.trim()) {
      setError("Vui lòng nhập email")
      setIsLoading(false)
      return
    }
    if (!applicantForm.userName.trim()) {
      setError("Vui lòng nhập tên đăng nhập")
      setIsLoading(false)
      return
    }
    if (applicantForm.password !== applicantForm.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      setIsLoading(false)
      return
    }
    if (applicantForm.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      setIsLoading(false)
      return
    }

    try {
      const response = await api.register({
        firstName: applicantForm.firstName,
        lastName: applicantForm.lastName,
        email: applicantForm.email,
        userName: applicantForm.userName,
        password: applicantForm.password,
        userType: "APPLICANT",
      })

      handleRegistrationSuccess(response)
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmployerSubmit = async () => {
    setError("")
    setIsLoading(true)

    // Validation
    if (!employerForm.firstName.trim()) {
      setError("Vui lòng nhập họ")
      setIsLoading(false)
      return
    }
    if (!employerForm.lastName.trim()) {
      setError("Vui lòng nhập tên")
      setIsLoading(false)
      return
    }
    if (!employerForm.email.trim()) {
      setError("Vui lòng nhập email")
      setIsLoading(false)
      return
    }
    if (!employerForm.userName.trim()) {
      setError("Vui lòng nhập tên đăng nhập")
      setIsLoading(false)
      return
    }
    if (!employerForm.phone.trim()) {
      setError("Vui lòng nhập số điện thoại")
      setIsLoading(false)
      return
    }
    if (!employerForm.companyName.trim()) {
      setError("Vui lòng nhập tên công ty")
      setIsLoading(false)
      return
    }
    if (!employerForm.industry.trim()) {
      setError("Vui lòng nhập ngành nghề")
      setIsLoading(false)
      return
    }
    if (!employerForm.address.trim()) {
      setError("Vui lòng nhập địa chỉ")
      setIsLoading(false)
      return
    }
    if (employerForm.password !== employerForm.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      setIsLoading(false)
      return
    }
    if (employerForm.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      setIsLoading(false)
      return
    }

    try {
      const response = await api.registerEmployer({
        firstName: employerForm.firstName,
        lastName: employerForm.lastName,
        email: employerForm.email,
        userName: employerForm.userName,
        password: employerForm.password,
        phone: employerForm.phone,
        companyName: employerForm.companyName,
        industry: employerForm.industry,
        address: employerForm.address,
      })

      handleRegistrationSuccess(response)
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 px-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
            <CardDescription>
              {currentStep === 1 ? "Chọn loại tài khoản phù hợp với bạn" : "Điền thông tin để tạo tài khoản"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Stepper
              initialStep={1}
              onStepChange={handleStepChange}
              disableStepIndicators={true}
              stepCircleContainerClassName="gap-4"
              contentClassName="min-h-[350px]"
              backButtonText="Quay lại"
              nextButtonText="Tiếp tục"
            >
              {/* Step 1: Account Type Selection */}
              <Step>
                <StepOneAccountType
                  selectedType={accountType}
                  onSelectType={handleAccountTypeSelect}
                  isDisabled={isLoading}
                />
              </Step>

              {/* Step 2: Form (Applicant or Employer) */}
              <Step>
                {accountType === "APPLICANT" ? (
                  <StepTwoApplicantForm
                    formData={applicantForm}
                    setFormData={setApplicantForm}
                    onSubmit={handleApplicantSubmit}
                    isLoading={isLoading}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    showConfirmPassword={showConfirmPassword}
                    setShowConfirmPassword={setShowConfirmPassword}
                  />
                ) : (
                  <StepTwoEmployerForm
                    formData={employerForm}
                    setFormData={setEmployerForm}
                    onSubmit={handleEmployerSubmit}
                    isLoading={isLoading}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    showConfirmPassword={showConfirmPassword}
                    setShowConfirmPassword={setShowConfirmPassword}
                  />
                )}
              </Step>
            </Stepper>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
