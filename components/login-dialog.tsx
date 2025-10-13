"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: () => void
}

export function LoginDialog({ open, onOpenChange, onLoginSuccess }: LoginDialogProps) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await api.login({
        username: username.trim(),
        password: password.trim(),
      })

      if (response.data) {
        // Save to localStorage
        localStorage.setItem("token", response.data.accessToken)
        localStorage.setItem("refreshToken", response.data.refreshToken)
        localStorage.setItem("role", response.data.role)
        localStorage.setItem("userId", response.data.userId)
        localStorage.setItem("fullName", response.data.fullName)
        localStorage.setItem("email", response.data.email)
        localStorage.setItem("phone", response.data.phone || "")

        // Close dialog and trigger success callback
        onOpenChange(false)
        if (onLoginSuccess) {
          onLoginSuccess()
        }
      }
    } catch (error: any) {
      setError(error.message || "Đăng nhập thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterClick = () => {
    onOpenChange(false)
    router.push("/register")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Đăng nhập</DialogTitle>
          <DialogDescription>Đăng nhập để ứng tuyển việc làm</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập hoặc Email</Label>
            <Input
              id="username"
              placeholder="Nhập tên đăng nhập hoặc email..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </Button>
        </form>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <div className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Button variant="link" className="p-0 h-auto font-semibold text-primary" onClick={handleRegisterClick}>
              Đăng ký ngay
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
