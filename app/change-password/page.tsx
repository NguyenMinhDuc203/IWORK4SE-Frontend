"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import PasswordValidator, { validatePassword } from "@/components/password-validator"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp")
      return
    }

    const validation = validatePassword(newPassword)
    if (!validation.isValid) {
      setError("Mật khẩu mới không đáp ứng yêu cầu. Vui lòng kiểm tra lại.")
      return
    }

    if (currentPassword === newPassword) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại")
      return
    }

    setIsLoading(true)

    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
        setIsLoading(false)
        return
      }

      await api.changePassword({
        id: userId,
        oldPassword: currentPassword,
        newPassword,
        confirmPassword,
      })

      setShowSuccessModal(true)
      // Reset form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      setError(error.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false)
    router.push("/") // Redirect to home page after successful password change
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
          <span>Thay đổi mật khẩu</span>
        </div>

        {/* Change Password Form */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Thay đổi mật khẩu</CardTitle>
              <CardDescription>Cập nhật mật khẩu của bạn để bảo mật tài khoản</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Xác nhận mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu hiện tại"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordValidator password={newPassword} />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : "Lưu lại"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent
          className="
      sm:max-w-md 
      
      /* 1. GHI ĐÈ VỊ TRÍ: Đưa lên phía trên thay vì ở giữa */
      top-[10%] 
      translate-y-0 
      
      /* 2. CHỈNH ANIMATION: Trượt từ tít trên cao xuống */
      data-[state=open]:slide-in-from-top-[-20%]
      
      /* (Tùy chọn) Bo góc đẹp hơn cho kiểu top modal */
      rounded-3xl
  "
        >
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 ring-8 ring-blue-50 animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="h-10 w-10 text-blue-600" strokeWidth={2.5} />
            </div>

            <div className="text-center space-y-2 px-4">
              <DialogTitle className="text-xl font-bold text-gray-900">Đổi mật khẩu thành công!</DialogTitle>
              <DialogDescription className="text-base text-gray-500">
                Mật khẩu mới của bạn đã được cập nhật. Bạn có thể sử dụng nó để đăng nhập ngay bây giờ.
              </DialogDescription>
            </div>

            <div className="w-full px-4 pt-4">
              <Button
                onClick={handleSuccessConfirm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11 text-base rounded-xl"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
