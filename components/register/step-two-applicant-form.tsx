"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import PasswordValidator, { validatePassword } from "@/components/password-validator"

interface StepTwoApplicantFormProps {
  formData: {
    firstName: string
    lastName: string
    email: string
    userName: string
    password: string
    confirmPassword: string
  }
  setFormData: (data: any) => void
  onSubmit: () => Promise<void>
  isLoading: boolean
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (show: boolean) => void
}

export default function StepTwoApplicantForm({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}: StepTwoApplicantFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmitWithValidation = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validatePassword(formData.password)
    if (!validation.isValid) {
      alert("Mật khẩu không đáp ứng yêu cầu. Vui lòng kiểm tra lại.")
      return
    }

    await onSubmit()
  }

  return (
    <form onSubmit={handleSubmitWithValidation} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="firstName" className="text-sm">
            Họ
          </Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Họ"
            value={formData.firstName}
            onChange={handleInputChange}
            disabled={isLoading}
            className="h-9"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName" className="text-sm">
            Tên
          </Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Tên"
            value={formData.lastName}
            onChange={handleInputChange}
            disabled={isLoading}
            className="h-9"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="email" className="text-sm">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Nhập email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
          className="h-9"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="userName" className="text-sm">
          Tên đăng nhập
        </Label>
        <Input
          id="userName"
          name="userName"
          type="text"
          placeholder="Tên đăng nhập"
          value={formData.userName}
          onChange={handleInputChange}
          disabled={isLoading}
          className="h-9"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password" className="text-sm">
          Mật khẩu
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            className="h-9 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-9 px-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <PasswordValidator password={formData.password} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="confirmPassword" className="text-sm">
          Xác nhận mật khẩu
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={isLoading}
            className="h-9 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-9 px-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex items-start space-x-2 pt-1">
        <input id="terms" type="checkbox" className="rounded border-gray-300 mt-0.5" required />
        <Label htmlFor="terms" className="text-xs leading-tight">
          Tôi đồng ý với{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Điều khoản sử dụng
          </Link>{" "}
          và{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Chính sách bảo mật
          </Link>
        </Label>
      </div>

      <Button type="submit" className="w-full h-9 mt-2" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang đăng ký...
          </>
        ) : (
          "Đăng ký"
        )}
      </Button>
    </form>
  )
}
