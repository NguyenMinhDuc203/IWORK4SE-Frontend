"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"

interface StepTwoEmployerFormProps {
  formData: {
    firstName: string
    lastName: string
    email: string
    userName: string
    password: string
    confirmPassword: string
    phone: string
    companyName: string
    industry: string
    address: string
  }
  setFormData: (data: any) => void
  onSubmit: () => Promise<void>
  isLoading: boolean
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (show: boolean) => void
}

export default function StepTwoEmployerForm({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}: StepTwoEmployerFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="space-y-3"
    >
      {/* Personal Info Section */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Thông tin cá nhân</p>
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
      </div>

      {/* Contact Info Section */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Thông tin liên hệ</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-9"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone" className="text-sm">
              Số điện thoại
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-9"
              required
            />
          </div>
        </div>
      </div>

      {/* Account Info Section */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Tài khoản</p>
        <div className="space-y-3">
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
          <div className="grid grid-cols-2 gap-3">
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
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm">
                Xác nhận
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
          </div>
        </div>
      </div>

      {/* Company Info Section */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Thông tin công ty</p>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="companyName" className="text-sm">
              Tên công ty
            </Label>
            <Input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="Tên công ty"
              value={formData.companyName}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-9"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="industry" className="text-sm">
                Ngành nghề
              </Label>
              <Input
                id="industry"
                name="industry"
                type="text"
                placeholder="VD: CNTT, Tài chính"
                value={formData.industry}
                onChange={handleInputChange}
                disabled={isLoading}
                className="h-9"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="address" className="text-sm">
                Địa chỉ
              </Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Địa chỉ công ty"
                value={formData.address}
                onChange={handleInputChange}
                disabled={isLoading}
                className="h-9"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-2 pt-1">
        <input id="terms" type="checkbox" className="rounded border-gray-300 mt-0.5" required />
        <Label htmlFor="terms" className="text-xs leading-tight mt-0.48">
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
