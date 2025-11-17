"use client"

import { useState, useEffect, useRef } from "react"
import { Bot, X, Send, Loader2 } from "lucide-react"
import { api, AIChatResponse, ApiResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AIMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Helper messages to show every 10 seconds
const HELPER_MESSAGES = [
  "💡 Bạn có thể hỏi tôi về việc làm phù hợp với kỹ năng của bạn",
  "🔍 Tôi có thể giúp bạn tìm công việc Java, Python, React...",
  "📝 Bạn cần tư vấn về cách viết CV hoặc cover letter?",
  "💼 Hãy cho tôi biết bạn đang tìm việc gì?",
  "🎯 Tôi có thể tìm việc làm theo địa điểm, mức lương, kinh nghiệm",
  "📚 Cần hướng dẫn chuẩn bị phỏng vấn? Hãy hỏi tôi!",
  "🏢 Bạn muốn tìm hiểu về các công ty trong hệ thống?",
  "✨ Tôi có thể gợi ý công việc phù hợp dựa trên profile của bạn"
]

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<string>("")
  const [helperMessage, setHelperMessage] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const helperIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isLoadingRef = useRef<boolean>(false)

  // Update isLoading ref when isLoading changes
  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: AIMessage = {
        id: "welcome",
        role: "assistant",
        content: "Xin chào! Tôi là trợ lý AI của iWork4SE. Tôi có thể giúp bạn:\n\n• Tư vấn về cách viết CV và cover letter\n• Hướng dẫn chuẩn bị phỏng vấn\n• Tìm kiếm việc làm phù hợp\n• Tư vấn phát triển sự nghiệp\n• Trả lời câu hỏi về quy trình ứng tuyển\n\nBạn cần tôi giúp gì hôm nay?",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen])

  // Show helper messages every 10 seconds (both when open and closed)
  useEffect(() => {
    // Clear any existing interval
    if (helperIntervalRef.current) {
      clearInterval(helperIntervalRef.current)
      helperIntervalRef.current = null
    }

    const showNextHelper = () => {
      // Don't show if loading
      if (isLoadingRef.current) {
        return
      }
      
      const randomMessage = HELPER_MESSAGES[Math.floor(Math.random() * HELPER_MESSAGES.length)]
      setHelperMessage(randomMessage)
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setHelperMessage((current) => {
          // Only clear if it's still the same message (not replaced by another)
          return current === randomMessage ? "" : current
        })
      }, 5000)
    }

    // Show first helper message after 10 seconds
    const firstTimeoutId = setTimeout(() => {
      showNextHelper()
    }, 10000)

    // Set up interval to show helper messages every 10 seconds
    helperIntervalRef.current = setInterval(() => {
      showNextHelper()
    }, 10000)

    return () => {
      clearTimeout(firstTimeoutId)
      if (helperIntervalRef.current) {
        clearInterval(helperIntervalRef.current)
        helperIntervalRef.current = null
      }
    }
  }, []) // Run once on mount, not dependent on isOpen

  const sendMessage = async () => {
    if (!messageInput.trim() || isLoading) return

    // Hide helper message when user sends a message
    setHelperMessage("")

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageInput.trim(),
      timestamp: new Date(),
    }

    const content = messageInput.trim()
    setMessageInput("")
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      console.log("[AI CHAT] Sending message:", content)
      const response = await api.sendAIMessage(content, conversationHistory)
      console.log("[AI CHAT] Received response:", response)
      
      // Handle both wrapped and unwrapped responses
      let responseData: AIChatResponse | null = null
      if (response && 'data' in response) {
        // Wrapped in ApiResponse
        const apiResp = response as ApiResponse<AIChatResponse>
        responseData = apiResp.data
      } else if (response && 'response' in response) {
        // Direct AIChatResponse
        responseData = response as AIChatResponse
      }
      
      if (responseData?.response) {
        const aiResponse: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: responseData.response,
          timestamp: new Date(),
        }
        
        setMessages((prev) => [...prev, aiResponse])
        
        // Update conversation history for context
        if (responseData.conversationHistory) {
          setConversationHistory(responseData.conversationHistory)
        } else {
          // Build conversation history from messages
          const history = [...messages, userMessage, aiResponse]
            .map((msg) => `${msg.role === "user" ? "Người dùng" : "Trợ lý"}: ${msg.content}`)
            .join("\n")
          setConversationHistory(history)
        }
      } else {
        console.error("[AI CHAT] Invalid response format:", response)
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("[AI CHAT] Failed to send message:", error)
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Xin lỗi, đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setConversationHistory("")
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isOpen) {
    return (
      <>
        {/* Helper Message Bubble - Outside popup */}
        {helperMessage && (
          <div className="fixed bottom-28 right-2 md:right-4 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 md:p-4 max-w-xs relative">
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
              <p className="text-sm md:text-base font-semibold md:font-bold text-gray-800 relative z-10">{helperMessage}</p>
            </div>
          </div>
        )}
        <div className="fixed bottom-6 right-2 md:right-4 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-14 w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg p-0 flex items-center justify-center"
          >
            <img
              src="https://img.icons8.com/?size=100&id=8SQ5YC8kxJOf&format=png&color=FFFFFF"
              alt="AI Assistant"
              width={64}
              height={64}
              className="brightness-0 invert w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16"
            />
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Helper Message Bubble - Outside popup, above the chat window */}
      {helperMessage && (
        <div className="fixed bottom-[calc(100vh-4rem+1rem+0.5rem)] md:bottom-[calc(600px+1.5rem+0.5rem)] right-2 md:right-4 z-[60] max-w-xs">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 md:p-4 relative animate-in slide-in-from-bottom-2 fade-in duration-300">
            {/* Arrow pointing down */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
            <p className="text-sm md:text-base font-semibold md:font-bold text-gray-800 relative z-10">{helperMessage}</p>
          </div>
        </div>
      )}
      <div className="fixed bottom-2 right-2 md:bottom-6 md:right-4 z-50 w-[calc(100vw-1rem)] md:w-96 h-[calc(100vh-4rem)] md:h-[600px] max-h-[600px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold">Trợ lý AI</h3>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-white hover:bg-blue-700 text-xs"
            >
              Xóa chat
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false)
            }}
            className="text-white hover:bg-blue-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user"
            const prevMsg = index > 0 ? messages[index - 1] : null
            const showTime = !prevMsg || 
              msg.timestamp.getTime() - prevMsg.timestamp.getTime() > 300000 // 5 minutes

            return (
              <div key={msg.id}>
                {showTime && (
                  <div className="text-center text-xs text-gray-400 my-2">
                    {formatTime(msg.timestamp)}
                  </div>
                )}
                <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-1`}>
                  <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                    {!isUser && (
                      <div className="flex items-center gap-1 mb-1">
                        <Bot className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-gray-500">Trợ lý AI</span>
                      </div>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        isUser
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                    </div>
                    <span
                      className={`text-xs mt-1 px-2 ${
                        isUser ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          {isLoading && (
            <div className="flex justify-start mb-1">
              <div className="max-w-[85%] flex flex-col items-start">
                <div className="flex items-center gap-1 mb-1">
                  <Bot className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-gray-500">Trợ lý AI</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Đang suy nghĩ...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading || !messageInput.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Trợ lý AI có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng.
        </p>
      </div>
    </div>
    </>
  )
}

