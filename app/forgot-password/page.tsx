"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email) {
            setError("Vui lòng nhập địa chỉ email của bạn")
            return
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError("Vui lòng nhập địa chỉ email hợp lệ")
            return
        }

        setIsLoading(true)

        try {
            const data = await api.forgotPassword({ email });

            console.log("Success:", data.message);

            if (data.status === 200) {
                setIsSuccess(true)
                setEmail("")
            } else {
                setError(data.message || "Lỗi khi gửi email reset mật khẩu.")
            }
        } catch (err: any) {
            setError(err.message || "Lỗi khi gửi email reset mật khẩu")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
                <div className="w-full max-w-md">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-green-600">Email đã được gửi!</CardTitle>
                            <CardDescription className="mt-2">
                                Nếu địa chỉ email này tồn tại trong hệ thống, bạn sẽ nhận được email với link reset mật khẩu.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert className="bg-blue-50 border-blue-200">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    Vui lòng kiểm tra hộp thư của bạn (hoặc thư mục Spam) để tìm email từ chúng tôi.
                                </AlertDescription>
                            </Alert>

                            <Button onClick={() => router.push("/login")} className="w-full">
                                Quay lại đăng nhập
                            </Button>

                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Chưa nhận được email?{" "}
                                    <button onClick={() => setIsSuccess(false)} className="text-primary hover:underline">
                                        Thử lại
                                    </button>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Quên mật khẩu?</CardTitle>
                        <CardDescription>Nhập địa chỉ email của bạn để nhận link reset mật khẩu</CardDescription>
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
                                <Label htmlFor="email">Địa chỉ email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Nhập địa chỉ email của bạn"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    "Gửi link reset mật khẩu"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 space-y-2 text-center">
                            <p className="text-sm text-muted-foreground">
                                <Link href="/login" className="text-primary hover:underline">
                                    Quay lại đăng nhập
                                </Link>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Chưa có tài khoản?{" "}
                                <Link href="/register" className="text-primary hover:underline">
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>


            </div>
        </div>
    )
}
