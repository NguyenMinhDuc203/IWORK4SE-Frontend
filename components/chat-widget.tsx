"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Search, Send, Paperclip, ChevronDown } from "lucide-react"
import { api, ConversationResponse, MessageResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"

interface ChatUser {
  id: string
  firstName: string
  lastName: string
  email: string
  userType: "ADMIN" | "EMPLOYER"
  fullName: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [conversations, setConversations] = useState<ConversationResponse[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null)
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [users, setUsers] = useState<ChatUser[]>([])
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [unreadCount, setUnreadCount] = useState(0)
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null

  // Initialize WebSocket connection
  useEffect(() => {
    if (!currentUserId || !isOpen) return

    const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/ws-message`)
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("[WEBSOCKET] Connected")
        // Subscribe to user's message topic
        const subscription = client.subscribe(`/topic/messages/${currentUserId}`, (message) => {
          try {
            const newMessage: MessageResponse = JSON.parse(message.body)
            console.log("[WEBSOCKET] Received new message:", newMessage)
            
            // Add message to current conversation if it matches
            setMessages((prev) => {
              // Check if message already exists
              const exists = prev.some(m => m.id === newMessage.id)
              if (exists) {
                return prev
              }
              
              // Only add if it belongs to the current conversation
              if (selectedConversation && 
                  (newMessage.conversationId === selectedConversation.id)) {
                // Add and sort
                const updated = [...prev, newMessage]
                updated.sort((a, b) => 
                  new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
                )
                return updated
              }
              
              return prev
            })
            
            // Update unread count
            if (newMessage.receiverId === currentUserId) {
              setUnreadCount((prev) => prev + 1)
              // Reload conversations to update unread count
              loadConversations()
            }
          } catch (error) {
            console.error("[WEBSOCKET] Error parsing message:", error)
          }
        })
        
        // Store subscription for cleanup
        return subscription
      },
      onStompError: (frame) => {
        console.error("[WEBSOCKET] STOMP error:", frame)
      },
    })

    client.activate()
    setStompClient(client)

    return () => {
      client.deactivate()
    }
  }, [currentUserId, isOpen, selectedConversation?.id])

  // Load conversations and users
  useEffect(() => {
    if (!isOpen) return
    loadConversations()
    loadUnreadCount()
    loadUsers() // Load users when popup opens
  }, [isOpen])

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      markAsRead(selectedConversation.id)
    }
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Search users
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchKeyword.trim()) {
        loadUsers(searchKeyword)
      } else {
        loadUsers()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchKeyword])

  const loadConversations = async () => {
    try {
      const response = await api.getActiveConversations()
      if (Array.isArray(response)) {
        // Remove duplicates - keep only one conversation per user pair
        const uniqueConversations = new Map<string, ConversationResponse>()
        response.forEach((conv) => {
          // Create a unique key for each user pair (sorted to handle both directions)
          const userPair = [conv.user1Id, conv.user2Id].sort().join("-")
          if (!uniqueConversations.has(userPair)) {
            uniqueConversations.set(userPair, conv)
          } else {
            // Keep the one with the most recent message
            const existing = uniqueConversations.get(userPair)!
            if (new Date(conv.lastMessageTime) > new Date(existing.lastMessageTime)) {
              uniqueConversations.set(userPair, conv)
            }
          }
        })
        setConversations(Array.from(uniqueConversations.values()))
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    }
  }

  const loadMessages = async (conversationId: number) => {
    try {
      console.log("[CHAT] Loading messages for conversation:", conversationId)
      const response = await api.getConversationMessages(conversationId, 0, 100)
      console.log("[CHAT] Response from API:", response)
      
      // Backend returns Page object: { content: [...], totalElements, totalPages, ... }
      let messagesData = []
      if (response?.content && Array.isArray(response.content)) {
        // Spring Page format
        messagesData = response.content
      } else if (response?.data?.content && Array.isArray(response.data.content)) {
        // Wrapped in ApiResponse
        messagesData = response.data.content
      } else if (Array.isArray(response?.data)) {
        messagesData = response.data
      } else if (Array.isArray(response)) {
        messagesData = response
      }
      
      console.log("[CHAT] Parsed messages:", messagesData)
      
      // Sort by sentAt ascending (oldest first)
      messagesData.sort((a: MessageResponse, b: MessageResponse) => 
        new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      )
      setMessages(messagesData)
      console.log("[CHAT] Set messages count:", messagesData.length)
    } catch (error) {
      console.error("[CHAT] Failed to load messages:", error)
      setMessages([])
    }
  }

  const loadUsers = async (keyword?: string) => {
    try {
      const response = await api.getAdminAndEmployerUsers(keyword)
      if (Array.isArray(response)) {
        setUsers(response)
      }
    } catch (error) {
      console.error("Failed to load users:", error)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await api.getUnreadMessageCount()
      if (response.data !== undefined) {
        setUnreadCount(response.data)
      }
    } catch (error) {
      console.error("Failed to load unread count:", error)
    }
  }

  const markAsRead = async (conversationId: number) => {
    try {
      await api.markMessagesAsRead(conversationId)
      loadUnreadCount()
      loadConversations()
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !currentUserId) return

    const receiverId =
      selectedConversation.user1Id === currentUserId
        ? selectedConversation.user2Id
        : selectedConversation.user1Id

    const content = messageInput.trim()
    setMessageInput("") // Clear input immediately for better UX

    try {
      console.log("[CHAT] Sending message to:", receiverId, "Content:", content)
      const response = await api.sendMessage({ receiverId, content })
      console.log("[CHAT] Message sent, response:", response)
      
      // If WebSocket didn't add the message, add it manually
      // This handles cases where WebSocket might be slow or disconnected
      setTimeout(() => {
        if (response?.data) {
          const sentMessage = response.data
          setMessages((prev) => {
            const exists = prev.some(m => m.id === sentMessage.id)
            if (exists) return prev
            const updated = [...prev, sentMessage]
            updated.sort((a, b) => 
              new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
            )
            return updated
          })
        }
        // Reload messages to ensure we have the latest
        loadMessages(selectedConversation.id)
      }, 500)
    } catch (error) {
      console.error("[CHAT] Failed to send message:", error)
      setMessageInput(content) // Restore message on error
    }
  }

  const sendImage = async (file: File) => {
    if (!selectedConversation || !currentUserId) return

    const receiverId =
      selectedConversation.user1Id === currentUserId
        ? selectedConversation.user2Id
        : selectedConversation.user1Id

    try {
      console.log("[CHAT] Sending image to:", receiverId)
      const response = await api.sendImageMessage(receiverId, file)
      console.log("[CHAT] Image sent, response:", response)
      
      // If WebSocket didn't add the message, add it manually
      setTimeout(() => {
        if (response?.data) {
          const sentMessage = response.data
          setMessages((prev) => {
            const exists = prev.some(m => m.id === sentMessage.id)
            if (exists) return prev
            const updated = [...prev, sentMessage]
            updated.sort((a, b) => 
              new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
            )
            return updated
          })
        }
        // Reload messages to ensure we have the latest
        loadMessages(selectedConversation.id)
      }, 500)
    } catch (error) {
      console.error("[CHAT] Failed to send image:", error)
    }
  }

  const createNewConversation = async () => {
    if (!selectedUserId || !currentUserId) return

    // Send a test message to create conversation
    try {
      await api.sendMessage({ receiverId: selectedUserId, content: "Xin chào!" })
      // Reload conversations
      setTimeout(async () => {
        await loadConversations()
        // Find and select the new conversation
        setTimeout(() => {
          // Get updated conversations
          api.getActiveConversations().then((response) => {
            if (Array.isArray(response)) {
              const newConv = response.find(
                (c) => c.user1Id === selectedUserId || c.user2Id === selectedUserId
              )
              if (newConv) {
                setSelectedConversation(newConv)
                setIsChatOpen(true)
                setSelectedUserId("") // Reset selection
              }
            }
          })
        }, 300)
      }, 300)
    } catch (error) {
      console.error("Failed to create conversation:", error)
    }
  }

  const getOtherUserName = (conversation: ConversationResponse) => {
    if (!currentUserId) return ""
    return conversation.user1Id === currentUserId ? conversation.user2Name : conversation.user1Name
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Vừa xong"
    if (minutes < 60) return `${minutes} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    if (days < 7) return `${days} ngày trước`
    return date.toLocaleDateString("vi-VN")
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-red-600 text-white rounded-t-lg">
        <h3 className="font-semibold">Tin nhắn</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false)
            setIsChatOpen(false)
            setSelectedConversation(null)
          }}
          className="text-white hover:bg-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!isChatOpen ? (
        /* Conversations List */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search and Create */}
          <div className="p-4 border-b space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm admin/employer..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Chọn người nhận" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName} ({user.userType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={createNewConversation} disabled={!selectedUserId} size="sm">
                Tạo chat
              </Button>
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {conversations.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Chưa có cuộc trò chuyện nào
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv)
                      setIsChatOpen(true)
                    }}
                    className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer mb-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex items-start gap-2">
                        {/* Red dot indicator for unread messages */}
                        {conv.unreadCount > 0 && (
                          <div className="mt-1.5 h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{getOtherUserName(conv)}</p>
                          </div>
                          <p className="text-sm text-gray-500">{formatTime(conv.lastMessageTime)}</p>
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-red-500 ml-2 flex-shrink-0">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      ) : (
        /* Chat Window */
        selectedConversation && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsChatOpen(false)
                    setSelectedConversation(null)
                    setMessages([])
                  }}
                  className="mr-2"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <span className="font-semibold">{getOtherUserName(selectedConversation)}</span>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Chưa có tin nhắn nào
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwn = msg.senderId === currentUserId
                    const prevMsg = index > 0 ? messages[index - 1] : null
                    const showSenderName = !prevMsg || prevMsg.senderId !== msg.senderId
                    const showTime = !prevMsg || 
                      new Date(msg.sentAt).getTime() - new Date(prevMsg.sentAt).getTime() > 300000 // 5 minutes
                    
                    return (
                      <div key={msg.id}>
                        {showTime && (
                          <div className="text-center text-xs text-gray-400 my-2">
                            {formatTime(msg.sentAt)}
                          </div>
                        )}
                        <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
                          <div className={`max-w-[80%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                            {!isOwn && showSenderName && (
                              <span className="text-xs text-gray-500 mb-1 px-2">
                                {msg.senderName}
                              </span>
                            )}
                            <div
                              className={`rounded-lg p-3 ${
                                isOwn
                                  ? "bg-red-600 text-white rounded-br-none"
                                  : "bg-gray-200 text-gray-900 rounded-bl-none"
                              }`}
                            >
                              {msg.messageType === "IMAGE" && msg.imageUrl ? (
                                <img
                                  src={msg.imageUrl}
                                  alt="Sent image"
                                  className="max-w-full rounded max-h-64 object-contain"
                                />
                              ) : (
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              )}
                            </div>
                            <span
                              className={`text-xs mt-1 px-2 ${
                                isOwn ? "text-gray-500" : "text-gray-400"
                              }`}
                            >
                              {new Date(msg.sentAt).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      sendImage(file)
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage()
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="sm" className="bg-red-600 hover:bg-red-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}

