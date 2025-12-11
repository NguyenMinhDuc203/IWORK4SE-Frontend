"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, MessageCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface ApplicantContactButtonProps {
  applicantId: string
  applicantName: string
  applicantEmail: string
  onContact?: () => void | Promise<void>
  triggerSize?: "default" | "sm" | "lg"
  triggerVariant?: "default" | "outline" | "secondary"
  className?: string
}

export function ApplicantContactButton({
  applicantId,
  applicantName,
  applicantEmail,
  onContact,
  triggerSize = "sm",
  triggerVariant = "outline",
  className,
}: ApplicantContactButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
  const currentUserType = typeof window !== "undefined" ? localStorage.getItem("userType") : null

  const gmailComposeUrl = useMemo(() => {
    const subject = "Liên hệ phỏng vấn/trao đổi công việc từ IWORK4SE"
    const body = `Xin chào ${applicantName},\n\nTôi là nhà tuyển dụng từ IWORK4SE. Tôi muốn trao đổi thêm về cơ hội hợp tác với bạn.\n\nTrân trọng,`
    // Gmail compose URL format with proper encoding
    const params = new URLSearchParams({
      view: "cm",
      to: applicantEmail,
      su: subject,
      body: body,
    })
    return `https://mail.google.com/mail/?${params.toString()}`
  }, [applicantEmail, applicantName])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  const handleEmail = async () => {
    if (!applicantEmail) {
      toast({
        title: "Không tìm thấy email ứng viên",
        description: "Vui lòng kiểm tra lại thông tin ứng viên",
      })
      return
    }
    // Close modal before opening Gmail
    setIsOpen(false)
    // Open Gmail compose in a new tab
    window.open(gmailComposeUrl, "_blank")
    onContact && onContact()
  }

  const handleDirectMessage = async () => {
    try {
      if (!currentUserId || currentUserType !== "EMPLOYER") {
        toast({
          title: "Vui lòng đăng nhập",
          description: "Đăng nhập với vai trò nhà tuyển dụng để nhắn tin ứng viên",
        })
        router.push("/login")
        return
      }

      setIsSending(true)
      const response = await api.sendMessage({
        receiverId: applicantId,
        content: `Xin chào ${applicantName}, tôi là nhà tuyển dụng từ IWORK4SE và muốn trao đổi về cơ hội việc làm phù hợp với bạn.`,
      })

      const conversationId = (response as any)?.data?.conversationId || (response as any)?.conversationId

      toast({
        title: "Đã tạo cuộc trò chuyện",
        description: "Chuyển đến trang nhắn tin...",
      })

      onContact && onContact()

      setIsOpen(false)
      setTimeout(() => {
        router.push(
          conversationId ? `/messages?conversationId=${conversationId}` : "/messages",
        )
      }, 400)
    } catch (error: any) {
      toast({
        title: "Không thể gửi tin nhắn",
        description: error?.message || "Vui lòng thử lại sau",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size={triggerSize}
          variant={triggerVariant}
          className={className}
          onClick={() => setIsOpen(true)}
        >
          <Mail className="h-4 w-4 mr-2" />
          Liên hệ
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Liên hệ ứng viên</DialogTitle>
          <DialogDescription>
            Chọn cách bạn muốn liên hệ với {applicantName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <button
            onClick={handleDirectMessage}
            disabled={isSending}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed hover:border-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-foreground">
                {isSending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo...
                  </span>
                ) : (
                  "Nhắn tin trực tiếp"
                )}
              </p>
              <p className="text-xs text-muted-foreground">Trao đổi ngay trên hệ thống</p>
            </div>
          </button>

          <button
            onClick={handleEmail}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed hover:border-blue-600 hover:bg-blue-50 transition-all"
          >
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-foreground">Liên hệ qua email</p>
              <p className="text-xs text-muted-foreground break-all">{applicantEmail}</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

