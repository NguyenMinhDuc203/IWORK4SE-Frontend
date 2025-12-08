"use client"

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ActivationSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-primary/10">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Kích hoạt tài khoản thành công</CardTitle>
            <CardDescription className="text-base">
              Tài khoản của bạn đã được kích hoạt. Bây giờ bạn có thể đăng nhập và sử dụng đầy đủ các chức năng của iWork4SE.
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


