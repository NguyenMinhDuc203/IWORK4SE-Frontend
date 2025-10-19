"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"

export default function TestNotificationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [result, setResult] = useState("")

  const createTestNotification = async () => {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        setResult("Không tìm thấy userId")
        return
      }

      await api.createNotification({
        userId,
        type: "TEST",
        message: message || "Đây là thông báo test từ hệ thống"
      })

      setResult("Tạo thông báo thành công!")
    } catch (error: any) {
      setResult(`Lỗi: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const createApplicationNotification = async () => {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        setResult("Không tìm thấy userId")
        return
      }

      await api.createApplicationNotification(
        userId,
        "test-application-id",
        "Có ứng viên Nguyễn Văn A ứng tuyển vào vị trí 'Software Engineer' của bạn"
      )

      setResult("Tạo thông báo ứng tuyển thành công!")
    } catch (error: any) {
      setResult(`Lỗi: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Notification System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập nội dung thông báo..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={createTestNotification}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Đang tạo..." : "Tạo thông báo test"}
              </Button>
              
              <Button 
                onClick={createApplicationNotification}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                {isLoading ? "Đang tạo..." : "Tạo thông báo ứng tuyển"}
              </Button>
            </div>

            {result && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm">{result}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
