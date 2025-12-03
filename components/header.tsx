"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { api, type NotificationResponse } from "@/lib/api"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"

import { Search, Bell, Menu, X, ChevronDown, Shield } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState<"APPLICANT" | "EMPLOYER" | "ADMIN" | null>(null)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isJobSeeking, setIsJobSeeking] = useState(true)
  const [userName, setUserName] = useState("User")
  const [isPinned, setIsPinned] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [userStatus, setUserStatus] = useState<"ACTIVE" | "INACTIVE" | "BANNED" | "DELETED" | "PENDING" | null>(null)
  const [isRequestingActivation, setIsRequestingActivation] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const notificationsEndRef = useRef<HTMLDivElement>(null)

  const loadUserAvatar = async () => {
    try {
      const userId = localStorage.getItem("userId")
      const userTypeFromStorage = localStorage.getItem("userType") as "APPLICANT" | "EMPLOYER" | "ADMIN" | null

      if (!userId || !userTypeFromStorage) return

      if (userTypeFromStorage === "EMPLOYER") {
        const response = await api.getEmployerById(userId)
        if (response.data) {
          if ((response.data as any).logoUrl) {
            setAvatarUrl((response.data as any).logoUrl)
          }
          if ((response.data as any).userStatus) {
            setUserStatus((response.data as any).userStatus)
          }
        }
      } else if (userTypeFromStorage === "APPLICANT") {
        const response = await api.getApplicantById(userId)
        // Applicant có thể có avatarUrl hoặc profilePicture trong tương lai
        if (response.data) {
          if ((response.data as any).avatarUrl) {
            setAvatarUrl((response.data as any).avatarUrl)
          }
          if ((response.data as any).userStatus) {
            setUserStatus((response.data as any).userStatus)
          }
        }
      }
      // ADMIN không có avatar riêng
    } catch (error) {
      console.error("Error loading avatar:", error)
    }
  }

  const checkAuthState = () => {
    const token = localStorage.getItem("token")
    const userTypeFromStorage = localStorage.getItem("userType") as "APPLICANT" | "EMPLOYER" | "ADMIN" | null
    const fullName = localStorage.getItem("fullName")
    setIsLoggedIn(!!token)
    setUserType(userTypeFromStorage)

    if (fullName) setUserName(fullName)

    // Load avatar & status if logged in (not for ADMIN)
    if (token && userTypeFromStorage && userTypeFromStorage !== "ADMIN") {
      loadUserAvatar()
    } else {
      setAvatarUrl(null)
      setUserStatus(null)
    }
  }

  useEffect(() => {
    checkAuthState()

    const handleAuthChanged = () => {
      checkAuthState()
    }

    const handleStorageChange = () => {
      checkAuthState()
    }

    window.addEventListener("auth:changed", handleAuthChanged as EventListener)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("auth:changed", handleAuthChanged as EventListener)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
        setIsPinned(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef, notificationRef])

  // Initialize WebSocket connection for realtime notifications
  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const role = localStorage.getItem("role")
    if (!userId || !role) return

    const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/ws-notification`)
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("[NOTIFICATION WEBSOCKET] Connected")

        // Determine topic based on user role
        let topic: string
        if (role === "APPLICANT") {
          topic = `/topic/notifications/applicant/${userId}`
        } else if (role === "EMPLOYER") {
          topic = `/topic/notifications/employer/${userId}`
        } else if (role === "ADMIN") {
          topic = `/topic/notifications/admin/${userId}`
        } else {
          topic = `/topic/notifications/user/${userId}`
        }

        // Subscribe to notification topic
        const subscription = client.subscribe(topic, (message) => {
          try {
            const notification: NotificationResponse = JSON.parse(message.body)
            console.log("[NOTIFICATION WEBSOCKET] Received new notification:", notification)

            // Add notification to the list
            setNotifications((prev) => {
              const exists = prev.some((n) => n.id === notification.id)
              if (exists) {
                return prev
              }
              return [notification, ...prev]
            })

            // Update unread count
            setUnreadCount((prev) => prev + 1)
          } catch (error) {
            console.error("[NOTIFICATION WEBSOCKET] Error parsing notification:", error)
          }
        })

        return subscription
      },
      onStompError: (frame) => {
        console.error("[NOTIFICATION WEBSOCKET] STOMP error:", frame)
      },
    })

    client.activate()
    setStompClient(client)

    return () => {
      client.deactivate()
    }
  }, [])

  // Load notifications and unread count
  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (userId) {
      loadNotifications()
      loadUnreadCount()
    }
  }, [isLoggedIn])

  // Scroll to top when notifications change
  useEffect(() => {
    if (isNotificationOpen && notificationsEndRef.current) {
      notificationsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [notifications, isNotificationOpen])

  const loadNotifications = async () => {
    const userId = localStorage.getItem("userId")
    if (!userId) return
    try {
      setIsLoadingNotifications(true)
      const response = await api.getNotificationsByUser(userId, 0, 50)
      if (response.data?.content) {
        setNotifications(response.data.content)
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await api.getUnreadNotificationCount()
      if (response.data !== undefined) {
        setUnreadCount(response.data)
      }
    } catch (error) {
      console.error("Failed to load unread count:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      loadUnreadCount()
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPLICATION_STATUS":
        return "📋"
      case "JOB_MATCH":
        return "💼"
      case "SYSTEM":
        return "🔔"
      default:
        return "📢"
    }
  }

  const handleClick = () => {
    const newPinnedState = !isPinned
    setIsPinned(newPinnedState)
    setIsUserDropdownOpen(newPinnedState)
  }

  const handleMouseEnter = () => {
    setIsUserDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsUserDropdownOpen(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("userType")
    localStorage.removeItem("role")
    localStorage.removeItem("userId")
    localStorage.removeItem("fullName")
    localStorage.removeItem("email")
    localStorage.removeItem("phone")
    localStorage.removeItem("isAdmin")
    setIsLoggedIn(false)
    setUserType(null)
    setAvatarUrl(null)
    setUserStatus(null)
    window.dispatchEvent(new Event("auth:changed"))
    window.location.href = "/"
  }

  const handleRequestActivation = async () => {
    const userId = localStorage.getItem("userId")
    if (!userId) return

    setIsRequestingActivation(true)
    try {
      await api.requestActivation(userId)
      alert("Yêu cầu kích hoạt tài khoản đã được gửi đến admin. Vui lòng chờ phê duyệt.")
    } catch (error: any) {
      console.error("Error requesting activation:", error)
      alert(error?.message || "Không thể gửi yêu cầu kích hoạt. Vui lòng thử lại sau.")
    } finally {
      setIsRequestingActivation(false)
    }
  }

  const getInitial = (name: string) => {
    if (!name) return "?"
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.charAt(0).toUpperCase()
    const last = parts[parts.length - 1]?.charAt(0).toUpperCase()

    if (parts.length === 1) return first

    return first + last
  }

  const getColorFromName = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-teal-500",
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-20">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/assets/Full_logo_iwork4se_no_background.png"
              alt="iWork4SE Logo"
              width={260}
              height={100}
              priority
              className="h-26 w-auto"
            />
          </Link>

          {/* Search Bar - Desktop */}
          {/* <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm việc làm, công ty..." className="pl-10 pr-4" />
            </div>
          </div> */}

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/jobs"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors mr-8"
            >
              Việc làm
            </Link>
            <Link
              href="/companies"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors mr-8"
            >
              Công ty
            </Link>
            <Link
              href="/messages"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors mr-8"
            >
              Tin nhắn
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {userType === "EMPLOYER" && (
                  <>
                    <Link href="/employer/dashboard">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/employer/jobs">
                      <Button
                        variant="ghost"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        size="sm"
                      >
                        Quản lý việc làm
                      </Button>
                    </Link>
                    <Link href="/employer/applicants">
                      <Button
                        variant="ghost"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        size="sm"
                      >
                        Quản lý Ứng viên
                      </Button>
                    </Link>
                    <Link href="/messages">
                      <Button
                        variant="ghost"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        size="sm"
                      >
                        Tin nhắn
                      </Button>
                    </Link>
                  </>
                )}

                {userType === "ADMIN" && (
                  <>
                    <Link href="/admin/dashboard">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/admin/jobs">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Quản lý việc làm
                      </Button>
                    </Link>
                    <Link href="/admin/companies">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Quản lý công ty
                      </Button>
                    </Link>
                    <Link href="/admin/applicants">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Quản lý ứng viên
                      </Button>
                    </Link>
                    <Link href="/admin/statistics">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Thống kê
                      </Button>
                    </Link>
                    <Link href="/messages">
                      <Button
                        variant="ghost"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        size="sm"
                      >
                        Tin nhắn
                      </Button>
                    </Link>
                  </>
                )}

                {/* Nút Kích hoạt cho user INACTIVE (ứng viên / nhà tuyển dụng) */}
                {/* {userStatus === "INACTIVE" && (userType === "APPLICANT" || userType === "EMPLOYER") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRequestActivation}
                    disabled={isRequestingActivation}
                    className="text-sm font-medium text-orange-600 border-orange-600 hover:bg-orange-50 bg-transparent"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {isRequestingActivation ? "Đang gửi..." : "Kích hoạt"}
                  </Button>
                )} */}

                <div className="relative" ref={notificationRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative mt-1"
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>

                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-96 h-[600px] bg-background border rounded-lg shadow-lg flex flex-col z-50">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
                        <div className="flex items-center gap-2">
                          <Bell className="h-5 w-5" />
                          <h3 className="font-semibold">Thông báo</h3>
                          {unreadCount > 0 && (
                            <Badge className="bg-red-500 ml-2">{unreadCount > 9 ? "9+" : unreadCount}</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsNotificationOpen(false)}
                          className="text-white hover:bg-blue-700"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Notifications List */}
                      <ScrollArea className="flex-1 p-4">
                        {isLoadingNotifications ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-gray-500">Đang tải...</div>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>Không có thông báo</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="text-2xl flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 mb-1">{notification.message}</p>
                                        <p className="text-xs text-gray-500">{formatTime(notification.createdAt)}</p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteNotification(notification.id)}
                                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div ref={notificationsEndRef} />
                          </div>
                        )}
                      </ScrollArea>

                      {/* Footer */}
                      <div className="p-3 border-t bg-gray-50 rounded-b-lg">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadNotifications}
                          className="w-full bg-transparent"
                          disabled={isLoadingNotifications}
                        >
                          {isLoadingNotifications ? "Đang tải..." : "Tải lại"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="relative pb-2 mt-2.5"
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClick}
                    className="flex items-center gap-2 hover:text-current pr-40"
                  >
                    {avatarUrl ? (
                      <div
                        className={`
                          h-8 w-8
                          rounded-full
                          flex items-center justify-center
                          text-white
                          ${getColorFromName(userName)}
                      `}
                        style={{
                          fontSize: "1rem",
                          fontWeight: 500,
                        }}
                      >
                        {getInitial(userName)}
                      </div>
                    ) : (
                      <div
                        className={`
                          h-8 w-8
                          rounded-full
                          flex items-center justify-center
                          text-white
                          ${getColorFromName(userName)}
                      `}
                        style={{
                          fontSize: "1rem",
                          fontWeight: 500,
                        }}
                      >
                        {getInitial(userName)}
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{userName}</span>
                      {userType === "APPLICANT" && <span className="text-xs text-primary">Đang tìm việc</span>}
                    </div>
                    <ChevronDown className="h-4 w-4 mt-1" />
                  </Button>

                  {isUserDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-60 bg-background border rounded-lg shadow-lg ">
                      <div className="p-4">
                        {/* User info header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`
                              h-12 w-12
                              rounded-full
                              flex items-center justify-center
                              text-white
                              ${getColorFromName(userName)}
                            `}
                            style={{
                              fontSize: "1rem",
                              fontWeight: 500,
                            }}
                          >
                            {getInitial(userName)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{userName}</h3>
                            {userType === "APPLICANT" && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-primary">Đang tìm việc</span>
                                {/* <Switch
                                  checked={isJobSeeking}
                                  onCheckedChange={setIsJobSeeking}
                                  className="data-[state=checked]:bg-primary"
                                /> */}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CV Actions - Only for applicants */}
                        {/* {userType === "APPLICANT" && (
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <Link href="/cv/create">
                              <div className="bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg p-4 text-center cursor-pointer hover:opacity-90 transition-opacity">
                                <div className="h-16 flex items-center justify-center mb-2">
                                  <FileText className="h-8 w-8 text-white" />
                                </div>
                                <Button
                                  size="sm"
                                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
                                >
                                  TẠO CV MỚI
                                </Button>
                              </div>
                            </Link>
                            <Link href="/cv/analyze">
                              <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-4 text-center cursor-pointer hover:opacity-90 transition-opacity">
                                <div className="h-16 flex items-center justify-center mb-2">
                                  <Eye className="h-8 w-8 text-white" />
                                </div>
                                <Button
                                  size="sm"
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                >
                                  PHÂN TÍCH CV
                                </Button>
                              </div>
                            </Link>
                          </div>
                        )} */}

                        {/* Menu items */}
                        <div className="space-y-1">
                          {userType === "ADMIN" ? (
                            <>
                              <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Image
                                  src="/assets/dashboard.png"
                                  width={40}
                                  height={40}
                                  alt="Dashboard"
                                  className="h-6 w-6"
                                />
                                <span className="text-sm">Dashboard</span>
                              </Link>
                              <Link
                                href="/admin/jobs"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Image
                                  src="/assets/job-description.png"
                                  width={40}
                                  height={40}
                                  alt="Job Management"
                                  className="h-6 w-6"
                                />
                                <span className="text-sm">Quản lý việc làm</span>
                              </Link>
                              <Link
                                href="/admin/companies"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Image
                                  src="/assets/software-as-service.png"
                                  width={40}
                                  height={40}
                                  alt="Company Management"
                                  className="h-6 w-6"
                                />
                                <span className="text-sm">Quản lý công ty</span>
                              </Link>
                              <Link
                                href="/admin/applicants"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Image
                                  src="/assets/team.png"
                                  width={40}
                                  height={40}
                                  alt="Applicant Management"
                                  className="h-6 w-6"
                                />
                                <span className="text-sm">Quản lý ứng viên</span>
                              </Link>
                              <Link
                                href="/admin/statistics"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Image
                                  src="/assets/analytics.png"
                                  width={40}
                                  height={40}
                                  alt="Admin Statistics"
                                  className="h-6 w-6"
                                />
                                <span className="text-sm">Thống kê</span>
                              </Link>
                            </>
                          ) : userType === "APPLICANT" ? (
                            <>
                              {/* <Link
                                href="/profile"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <User className="h-5 w-5 text-primary" />
                                <span className="text-sm">Quản lý hồ sơ</span>
                              </Link> */}
                              <Link
                                href="/profile/edit"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Image
                                  src="/assets/update.png"
                                  width={40}
                                  height={40}
                                  alt="Update Profile"
                                  className="h-6 w-6"
                                />
                                <span className="text-sm">Cập nhật hồ sơ</span>
                              </Link>
                              <Link
                                href="/applied-jobs"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Image
                                  src="/assets/job.png"
                                  width={40}
                                  height={40}
                                  alt="Job Applied"
                                  className="h-6 w-6"
                                />
                                <span className="text-sm">Việc làm đã ứng tuyển</span>
                              </Link>
                              <Link
                                href="/saved-jobs"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Image
                                  src="/assets/job-search.png"
                                  width={40}
                                  height={40}
                                  alt="Saeved Jobs"
                                  className="h-6 w-6"
                                />
                                <span className="text-sm">Việc làm đã lưu</span>
                              </Link>
                              {/* <Link
                                href="/viewed-jobs"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <FileText className="h-5 w-5 text-primary" />
                                <span className="text-sm">Việc làm đã xem</span>
                              </Link> */}
                              {/* <Link
                                href="/profile-views"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Eye className="h-5 w-5 text-primary" />
                                <span className="text-sm">NTD đã xem hồ sơ</span>
                              </Link> */}
                            </>
                          ) : (
                            <>
                              <Link
                                href="/employer/dashboard"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Image
                                  src="/assets/dashboard.png"
                                  width={40}
                                  height={40}
                                  alt="Dashboard"
                                  className="h-6 w-6"
                                />
                                <span className="text-sm">Dashboard</span>
                              </Link>
                              <Link
                                href="/employer/jobs"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Image
                                  src="/assets/project-management.png"
                                  width={40}
                                  height={40}
                                  alt="Job Management"
                                  className="h-6 w-6 ml-0.5"
                                />
                                <span className="text-sm">Quản lý việc làm</span>
                              </Link>
                              <Link
                                href="/employer/profile/edit"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Image
                                  src="/assets/company.png"
                                  width={40}
                                  height={40}
                                  alt="update Company Profile"
                                  className="h-6 w-6 ml-0.5"
                                />
                                <span className="text-sm">Cập nhật hồ sơ công ty</span>
                              </Link>
                            </>
                          )}

                          <Link
                            href="/change-password"
                            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <Image
                              src="/assets/reset-password.png"
                              width={40}
                              height={40}
                              alt="Change Password"
                              className="h-6 w-6"
                            />
                            <span className="text-sm">Đổi mật khẩu</span>
                          </Link>

                          <button
                            onClick={() => {
                              handleLogout()
                              setIsUserDropdownOpen(false)
                            }}
                            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 transition-colors w-full text-left bg-red-50/50"
                          >
                            <Image src="/assets/logout.png" width={40} height={40} alt="Logout" className="h-6 w-6" />
                            <span className="text-sm text-red-600">Đăng xuất</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {userType === "APPLICANT" && (
                  <>
                    {/* <Link href="/employer/register">
                      <Button size="sm" className="bg-[#1e7efc] hover:bg-[#2ea3ff] text-white font-medium">
                        NHÀ TUYỂN DỤNG
                      </Button>
                    </Link> */}
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm việc làm, công ty..." className="pl-10 pr-4" />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="py-4 space-y-2">
              <Link
                href="/jobs"
                className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Việc làm
              </Link>
              <Link
                href="/companies"
                className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Công ty
              </Link>

              {isLoggedIn ? (
                <>
                  {userType === "APPLICANT" && (
                    <>
                      <Link
                        href="/employer/register"
                        className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        NHÀ TUYỂN DỤNG
                      </Link>
                      <Link
                        href="/applications"
                        className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Đơn ứng tuyển
                      </Link>
                      <Link
                        href="/saved-jobs"
                        className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Việc đã lưu
                      </Link>
                    </>
                  )}

                  {userType === "EMPLOYER" && (
                    <>
                      <Link
                        href="/employer/dashboard"
                        className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/employer/jobs"
                        className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Quản lý việc làm
                      </Link>
                      <Link
                        href="/messages"
                        className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tin nhắn
                      </Link>
                    </>
                  )}

                  {userType === "ADMIN" && (
                    <>
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                      <Link
                        href="/admin/jobs"
                        className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Quản lý việc làm
                      </Link>
                      <Link
                        href="/admin/companies"
                        className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Quản lý công ty
                      </Link>
                      <Link
                        href="/admin/applicants"
                        className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Quản lý ứng viên
                      </Link>
                      <Link
                        href="/admin/statistics"
                        className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Thống kê
                      </Link>
                      <Link
                        href="/messages"
                        className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tin nhắn
                      </Link>
                    </>
                  )}

                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Hồ sơ cá nhân
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
