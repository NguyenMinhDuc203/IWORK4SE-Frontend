"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import Image from "next/image"

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    })
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false,
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)





    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (!token) {
            setError("Token không hợp lệ hoặc đường dẫn bị lỗi.")
            return
        }

        if (!formData.newPassword || !formData.confirmPassword) {
            setError("Vui lòng nhập đầy đủ mật khẩu mới và xác nhận")
            return
        }

        if (formData.newPassword.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự")
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Mật khẩu mới và xác nhận không khớp")
            return
        }

        setIsLoading(true)

        try {
            const response = await api.resetPassword({
                token: token,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
            })
            console.log("Response từ API:", response);
            const resData = response as any;

            if (resData.success || (resData.data && resData.data.success)) {
                setIsSuccess(true)
                setFormData({ newPassword: "", confirmPassword: "" })
            } else {
                const msg = resData.message || resData.data?.message || "Lỗi khi đặt lại mật khẩu.";
                setError(msg)
            }

        } catch (err: any) {
            console.error("Reset password error:", err)
            setError(err.message || "Lỗi khi đặt lại mật khẩu. Vui lòng thử lại.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm py-16 px-6 text-center space-y-6">
            <div className="flex justify-center mb-8">
              <img src="/assets/Full_logo_iwork4se.png" alt="iWork4SE" className="h-30 w-auto" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-blue-500 mb-3">Tạo mật khẩu thành công!</h1>
              <p className="text-gray-600 text-base leading-relaxed max-w-lg mx-auto">
                Đăng nhập ngay để bắt đầu xây dựng một hồ sơ nổi bật cho bạn và nhận được các cơ hội sự nghiệp lý tưởng
              </p>
            </div>

            <Button
              onClick={() => router.push("/login")}
              className="w-full max-w-sm mx-auto h-12 text-base font-semibold bg-blue-500 hover:bg-blue-600"
            >
              Đăng nhập ngay
            </Button>

            
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">© 2016. All Rights Reserved. iWork4SE Vietnam JSC.</p>
          </div>
        </div>
      </div>
    )
  }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Tạo lại mật khẩu của bạn</CardTitle>
                        <CardDescription>
                            Đăng nhập ngay để bắt đầu xây dựng một hồ sơ nổi bật cho bạn và nhận được các cơ hội sự nghiệp lý tưởng
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showPasswords.new ? "text" : "password"}
                                        placeholder="Nhập mật khẩu mới"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        required
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                                    >
                                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showPasswords.confirm ? "text" : "password"}
                                        placeholder="Nhập lại mật khẩu"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                                    >
                                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang tạo mật khẩu...
                                    </>
                                ) : (
                                    "Tạo mật khẩu mới"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 space-y-2 text-center">
                            <p className="text-sm text-muted-foreground">
                                <a href="/login" className="text-primary hover:underline">
                                    Quay lại đăng nhập
                                </a>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Chưa có tài khoản?{" "}
                                <a href="/register" className="text-primary hover:underline">
                                    Đăng ký ngay
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>


            </div>
        </div>
    )
}
