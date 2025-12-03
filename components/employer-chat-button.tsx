"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
// Thêm import thư viện icon
import { MessageSquare, MessageCircle, QrCode, Copy, Loader2 } from "lucide-react"

// Import các component UI (Shadcn/ui)
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { QRCodeCanvas } from "qrcode.react"

import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface EmployerChatButtonProps {
  employerId: string
  employerName: string
  employerPhone: string
}

export function EmployerChatButton({ employerId, employerName, employerPhone }: EmployerChatButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showZaloQR, setShowZaloQR] = useState(false)
  
  // Đã xóa biến qrRef vì khai báo "null as any" trong body function là sai logic React và bạn chưa dùng nó để download ảnh.

  // Get current user info (Chạy an toàn trên client)
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
  const currentUserType = typeof window !== "undefined" ? localStorage.getItem("userType") : null

  const generateZaloQRData = () => {
    // Chuyển đổi số điện thoại 09xx -> 849xx nếu cần, hoặc giữ nguyên tùy Zalo yêu cầu
    const zaloUrl = `https://zalo.me/${employerPhone}`
    return zaloUrl
  }

  const handleDirectChat = async () => {
    try {
      if (!currentUserId) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để sử dụng tính năng chat",
        })
        return
      }

      setIsLoading(true)

      const response = await api.sendMessage({
        receiverId: employerId,
        content: `Xin chào ${employerName}, tôi rất quan tâm đến các cơ hội việc làm tại công ty bạn.`,
      })

      const conversationId = response?.data?.conversationId || response?.conversationId

      toast({
        title: "Thành công",
        description: "Cuộc trò chuyện đã được tạo. Chuyển hướng đến chat...",
      })

      setTimeout(() => {
        setIsOpen(false)
        router.push(`/messages?conversationId=${conversationId}`)
      }, 500)
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo cuộc trò chuyện. Vui lòng thử lại.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyZaloLink = () => {
    const zaloUrl = generateZaloQRData()
    navigator.clipboard.writeText(zaloUrl)
    toast({
      title: "Đã sao chép",
      description: "Liên kết Zalo đã được sao chép vào clipboard",
    })
  }

  // Check if user is applicant
  if (currentUserType !== "APPLICANT") {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 w-full mt-3 text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
        >
          <MessageSquare className="h-4 w-4" />
          Chat với tôi
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Liên hệ với {employerName}</DialogTitle>
          <DialogDescription>Chọn cách thức liên hệ bạn muốn sử dụng</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Direct Chat Option */}
          <button
            onClick={handleDirectChat}
            disabled={isLoading}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed hover:border-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-foreground">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo...
                  </span>
                ) : (
                  "Chat trực tiếp"
                )}
              </p>
              <p className="text-xs text-muted-foreground">Nhắn tin trực tiếp trong ứng dụng</p>
            </div>
          </button>

          {/* Zalo Chat Option */}
          <button
            onClick={() => setShowZaloQR(true)}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed hover:border-blue-600 hover:bg-blue-50 transition-all"
          >
            <div className="p-3 bg-blue-100 rounded-lg">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-foreground">Chat qua Zalo</p>
              <p className="text-xs text-muted-foreground">Quét mã QR hoặc nhấn liên kết</p>
            </div>
          </button>
        </div>

        {/* Zalo QR Code Section */}
        {showZaloQR && (
          <div className="flex flex-col items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="font-semibold text-sm mb-2">Mã QR Zalo</p>
              <p className="text-xs text-muted-foreground mb-3">Quét mã này để nhắn tin với {employerName} trên Zalo</p>
            </div>

            <div className="p-3 bg-white rounded-lg border">
              {/* --- SỬA LỖI 1: Dùng QRCodeCanvas --- */}
              <QRCodeCanvas 
                value={generateZaloQRData()} 
                size={200} 
                level="H" 
                includeMargin={true} 
              />
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Số điện thoại: <span className="font-semibold">{employerPhone}</span>
            </p>

            <div className="flex gap-2 w-full">
              <Button onClick={copyZaloLink} variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                <Copy className="h-4 w-4" />
                Sao chép liên kết
              </Button>
              <Button
                onClick={() => {
                  window.open(generateZaloQRData(), "_blank")
                }}
                size="sm"
                className="flex-1"
              >
                Mở Zalo
              </Button>
            </div>

            <Button onClick={() => setShowZaloQR(false)} variant="ghost" size="sm" className="w-full">
              Quay lại
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}