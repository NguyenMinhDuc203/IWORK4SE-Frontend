"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ActivationFailedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-red-50 via-background to-amber-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-red-100">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Kích hoạt tài khoản thất bại</CardTitle>
            <CardDescription className="text-base">
              Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại email kích hoạt hoặc yêu cầu gửi lại email
              kích hoạt từ trang hồ sơ tài khoản.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 items-center">
            <Link href="/login" className="w-full">
              <Button className="w-full" size="lg">
                Đến trang đăng nhập
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full" size="lg">
                Về trang chủ iWork4SE
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


