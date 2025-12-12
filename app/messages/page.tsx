"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Send, ChevronLeft, MessageCircle, ImageIcon, Loader2, Trash2, Clock } from "lucide-react"
import { api, type ConversationResponse, type MessageResponse } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Client } from "@stomp/stompjs"

interface ChatUser {
  id: string
  firstName: string
  lastName: string
  email: string
  userType: "ADMIN" | "EMPLOYER"
  fullName: string
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // --- STATE ---
  const [conversations, setConversations] = useState<ConversationResponse[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null)
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [adminUsers, setAdminUsers] = useState<ChatUser[]>([])

  // Loading & Status States
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false)

  // --- REFS ---
  const selectedConversationRef = useRef<ConversationResponse | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- USER INFO ---
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
  const currentRole = typeof window !== "undefined" ? localStorage.getItem("role") : null

  useEffect(() => {
    selectedConversationRef.current = selectedConversation
  }, [selectedConversation])

  useEffect(() => {
    if (!currentUserId) return

    // Chuyển đổi HTTP URL sang WS URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.iwork4se.io.vn"
    const wsUrl = baseUrl.replace(/^http/, "ws") + "/ws-message"

    console.log(`[WS] Connecting to: ${wsUrl}`)

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("[WS] Connected!")
        const topic = `/topic/messages/${currentUserId}`

        client.subscribe(topic, (message) => {
          try {
            const newMessage: MessageResponse = JSON.parse(message.body)
            console.log("[WS] Received:", newMessage)

            setMessages((prev) => {
              // 1. Tránh trùng lặp (nếu hàm sendMessage đã add rồi thì thôi)
              if (prev.some((m) => m.id === newMessage.id)) {
                return prev
              }

              // 2. Chỉ add vào nếu đang mở đúng cuộc hội thoại
              const currentConv = selectedConversationRef.current
              if (!currentConv || newMessage.conversationId !== currentConv.id) {
                // Nếu tin nhắn từ người khác, refresh list conversation để hiện badge đỏ
                loadConversations()
                return prev
              }

              // 3. Thêm tin nhắn và sort lại
              const updated = [...prev, newMessage]
              updated.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())

              // 4. Scroll xuống
              setTimeout(() => scrollToBottom(), 100)

              if (newMessage.receiverId === currentUserId) {
                markAsRead(currentConv.id)
              }

              return updated
            })

            // Refresh conversation list để cập nhật Last Message
            setTimeout(() => loadConversations(), 500)
          } catch (error) {
            console.error("[WS] Parse error:", error)
          }
        })
      },
      onWebSocketError: (err) => console.error("[WS] Error:", err),
    })

    client.activate()
    setStompClient(client)

    return () => {
      if (client.active) client.deactivate()
    }
  }, [currentUserId])

  useEffect(() => {
    loadConversations()
    loadAdminUsers()
  }, [])

useEffect(() => {
    const conversationIdParam = searchParams.get("conversationId")

    // Chỉ chạy khi CÓ param và danh sách hội thoại đã load xong
    if (conversationIdParam && conversations.length > 0) {
      const targetId = Number(conversationIdParam)
      const conversation = conversations.find((c) => c.id === targetId)

      if (conversation) {
        // 1. Set hội thoại được chọn
        setSelectedConversation(conversation)

        // 2. DỌN DẸP URL: Xóa param đi để trả về "/messages" thuần túy
        // Dùng replace để không lưu vào lịch sử duyệt web
        router.replace("/messages", { scroll: false })
      }
    }
  }, [searchParams, conversations, router])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      markAsRead(selectedConversation.id)
    }
  }, [selectedConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadConversations = async () => {
    try {
      const response = await api.getActiveConversations()
      if (Array.isArray(response)) {
        let organized: ConversationResponse[] = []
        if (currentRole === "EMPLOYER") {
          const adminConvs = response.filter(
            (conv) =>
              (conv.user1Id !== currentUserId && adminUsers.some((u) => u.id === conv.user1Id)) ||
              (conv.user2Id !== currentUserId && adminUsers.some((u) => u.id === conv.user2Id)),
          )
          const applicantConvs = response.filter((conv) => !adminConvs.find((c) => c.id === conv.id))
          organized = [...adminConvs, ...applicantConvs]
        } else {
          organized = response
        }
        setConversations(organized)
      }
    } catch (error) {
      console.error("Load conversations failed:", error)
    }
  }

  const loadMessages = async (conversationId: number) => {
    try {
      setIsLoadingMessages(true)
      const response = await api.getConversationMessages(conversationId, 0, 100)

      let messagesData: MessageResponse[] = []
      // Xử lý các định dạng response khác nhau
      if (response?.content) messagesData = response.content
      else if (response?.data?.content) messagesData = response.data.content
      else if (Array.isArray(response)) messagesData = response

      messagesData.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
      setMessages(messagesData)

      setTimeout(() => scrollToBottom(), 100)
    } catch (error) {
      console.error("Load messages failed:", error)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const loadAdminUsers = async () => {
    try {
      const response = await api.getAdminAndEmployerUsers()
      if (Array.isArray(response)) setAdminUsers(response)
    } catch (error) {
      console.error("Load admin users failed:", error)
    }
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !currentUserId || isSending) return

    const receiverId =
      selectedConversation.user1Id === currentUserId ? selectedConversation.user2Id : selectedConversation.user1Id

    const contentToSend = messageInput.trim()
    setMessageInput("")
    setIsSending(true)

    try {
      console.log("Sending message to:", receiverId)
      const response = await api.sendMessage({ receiverId, content: contentToSend })

      // Lấy data từ response (linh hoạt với axios response)
      const sentMessage = response?.data || response

      if (sentMessage) {
        setMessages((prev) => {
          // Check trùng ID
          if (sentMessage.id && prev.some((m) => m.id === sentMessage.id)) {
            return prev
          }

          // Tạo object hiển thị an toàn (phòng trường hợp BE trả thiếu field)
          const messageDisplay: MessageResponse = {
            ...sentMessage,
            conversationId: selectedConversation.id,
            senderId: currentUserId,
            sentAt: sentMessage.sentAt || new Date().toISOString(),
            content: sentMessage.content || contentToSend,
          }

          const updated = [...prev, messageDisplay]
          // Sort lại theo thời gian
          updated.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
          return updated
        })

        // Scroll xuống ngay lập tức
        setTimeout(() => scrollToBottom(), 50)

        // Cập nhật list bên trái sau
        setTimeout(() => loadConversations(), 500)
      }
    } catch (error) {
      console.error("Send message failed:", error)
      setMessageInput(contentToSend) // Trả lại text nếu lỗi
      alert("Không thể gửi tin nhắn.")
    } finally {
      setIsSending(false)
    }
  }

  const sendImage = async (file: File) => {
    if (!selectedConversation || !currentUserId || isSending) return

    const receiverId =
      selectedConversation.user1Id === currentUserId ? selectedConversation.user2Id : selectedConversation.user1Id

    setIsSending(true)
    try {
      const response = await api.sendImageMessage(receiverId, file)
      const sentMessage = response?.data || response

      if (sentMessage) {
        setMessages((prev) => {
          if (sentMessage.id && prev.some((m) => m.id === sentMessage.id)) return prev

          const messageDisplay: MessageResponse = {
            ...sentMessage,
            conversationId: selectedConversation.id,
            senderId: currentUserId,
            sentAt: sentMessage.sentAt || new Date().toISOString(),
            messageType: "IMAGE", // Đảm bảo type đúng
          }

          const updated = [...prev, messageDisplay]
          updated.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
          return updated
        })

        setTimeout(() => scrollToBottom(), 50)
        setTimeout(() => loadConversations(), 500)
      }
    } catch (error) {
      console.error("Send image failed:", error)
      alert("Không thể gửi hình ảnh.")
    } finally {
      setIsSending(false)
    }
  }

  const deleteMessage = async (messageId: number) => {
    if (!confirm("Bạn có chắc muốn xóa tin nhắn này?")) return
    try {
      await api.deleteMessage(messageId)
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    } catch (error) {
      alert("Lỗi khi xóa tin nhắn")
    }
  }

  const markAsRead = async (conversationId: number) => {
    if (!currentUserId || isMarkingAsRead) return
    setIsMarkingAsRead(true)
    try {
      await api.markMessagesAsRead(conversationId)
      setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)))
    } catch (error) {
      console.error("Mark as read failed:", error)
    } finally {
      setIsMarkingAsRead(false)
    }
  }

  const getOtherUserName = (conversation: ConversationResponse): string => {
    if (!currentUserId) return ""
    const otherUserId = conversation.user1Id === currentUserId ? conversation.user2Id : conversation.user1Id
    const otherUserName = conversation.user1Id === currentUserId ? conversation.user2Name : conversation.user1Name

    if (currentRole === "EMPLOYER") {
      const isAdmin = adminUsers.some((u) => u.id === otherUserId)
      return isAdmin ? `Admin (${otherUserName})` : `${otherUserName}`
    }
    if (currentRole === "ADMIN") {
      const isEmployer = adminUsers.some((u) => u.id === otherUserId && u.userType === "EMPLOYER")
      return isEmployer ? `${otherUserName}` : otherUserName
    }
    return otherUserName
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "Vừa xong"
    if (minutes < 60) return `${minutes}p`
    const hours = Math.floor(diff / 3600000)
    if (hours < 24) return `${hours}h`
    return date.toLocaleDateString("vi-VN")
  }

  const formatFullTime = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isAdminConversation = (conversation: ConversationResponse): boolean => {
    if (!currentUserId) return false
    const otherUserId = conversation.user1Id === currentUserId ? conversation.user2Id : conversation.user1Id
    return adminUsers.some((u) => u.id === otherUserId)
  }

  if (!currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-150px bg-background px-20">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          <div className="lg:col-span-1 flex flex-col bg-white rounded-lg border border-border overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-gradient-to-r from-primary to-blue-600 text-white">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5" />
                <h1 className="text-xl font-bold">Tin nhắn</h1>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10 bg-white/20 text-white placeholder:text-gray-300 border-0 rounded-lg focus:ring-2 focus:ring-white"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Chưa có cuộc trò chuyện nào</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conv) => {
                      const otherUserName = getOtherUserName(conv)
                      const isAdmin = isAdminConversation(conv)
                      const isSelected = selectedConversation?.id === conv.id
                      const matchesSearch =
                        searchKeyword === "" || otherUserName.toLowerCase().includes(searchKeyword.toLowerCase())
                      if (!matchesSearch) return null

                      return (
                        <button
                          key={conv.id}
                          onClick={() => {
                            setSelectedConversation(conv)
                            if (conv.unreadCount > 0) {
                              markAsRead(conv.id)
                            }
                          }}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            isSelected
                              ? "bg-blue-100 border border-blue-300"
                              : "hover:bg-gray-100 border border-transparent"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p
                              className={`font-medium truncate ${isAdmin ? "text-blue-600 font-bold" : "text-foreground"}`}
                            >
                              {otherUserName}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge className="bg-red-500">{conv.unreadCount > 9 ? "9+" : conv.unreadCount}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{formatTime(conv.lastMessageTime)}</p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* === MAIN: CHAT AREA === */}
          <div className="lg:col-span-2 flex flex-col bg-white rounded-lg border border-border overflow-hidden shadow-sm">
            {selectedConversation ? (
              <>
                {/* HEADER */}
                <div className="p-4 border-b bg-gradient-to-r from-primary to-blue-600 text-white flex justify-between items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden p-2 hover:bg-blue-700 rounded-lg"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                      <h2 className="font-semibold truncate text-lg">{getOtherUserName(selectedConversation)}</h2>
                      <p className="text-xs text-blue-100 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Cập nhật {formatTime(selectedConversation.lastMessageTime)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* MESSAGES LIST */}
                <ScrollArea className="flex-1 p-4 bg-gray-50">
                  {isLoadingMessages ? (
                    <div className="flex justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex justify-center h-full items-center text-muted-foreground">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p>Bắt đầu cuộc trò chuyện</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => {
                        const isSent = msg.senderId === currentUserId
                        return (
                          <div key={msg.id} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                            <div className="max-w-xs lg:max-w-md group">
                              <div
                                className={`px-4 py-2 rounded-lg ${
                                  isSent
                                    ? "bg-primary text-white rounded-br-none"
                                    : "bg-gray-200 text-foreground rounded-bl-none"
                                }`}
                              >
                                {msg.messageType === "IMAGE" && msg.imageUrl ? (
                                  <img
                                    src={msg.imageUrl || "/placeholder.svg"}
                                    alt="chat"
                                    className="max-w-xs rounded-lg max-h-64 object-cover"
                                  />
                                ) : (
                                  <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 px-2">
                                <p className="text-xs text-muted-foreground">{formatFullTime(msg.sentAt)}</p>
                                {isSent && (
                                  <button
                                    onClick={() => deleteMessage(msg.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* INPUT AREA */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSending}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground hover:text-primary"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          sendImage(e.target.files[0])
                          e.target.value = ""
                        }
                      }}
                    />

                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      placeholder="Nhập tin nhắn..."
                      disabled={isSending}
                      className="flex-1"
                    />

                    <button
                      onClick={sendMessage}
                      disabled={!messageInput.trim() || isSending}
                      className="p-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center h-full items-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
