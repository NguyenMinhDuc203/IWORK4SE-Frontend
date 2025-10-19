"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Briefcase, User, Calendar, Check, Trash2, Eye } from "lucide-react"
import { api } from "@/lib/api"

interface Notification {
  id: string
  userId: string
  userName: string
  applicationId?: string
  type: string
  message: string
  createdAt: string
  isRead?: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) return

      setIsLoading(true)
      const response = await api.getNotificationsByUser(userId, currentPage, 20)
      
      if (response.data) {
        const newNotifications = response.data.content || []
        setNotifications(prev => currentPage === 0 ? newNotifications : [...prev, ...newNotifications])
        setHasMore(newNotifications.length === 20)
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
      setError("Không thể tải thông báo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) return

      await api.markAllNotificationsAsRead(userId)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await api.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Vừa xong"
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} ngày trước`
    
    return date.toLocaleDateString('vi-VN')
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPLICATION_RECEIVED":
      case "JOB_APPLICATION":
        return <Briefcase className="h-5 w-5 text-blue-600" />
      case "SYSTEM":
        return <Bell className="h-5 w-5 text-gray-600" />
      default:
        return <User className="h-5 w-5 text-green-600" />
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "APPLICATION_RECEIVED":
      case "JOB_APPLICATION":
        return "Ứng tuyển"
      case "SYSTEM":
        return "Hệ thống"
      default:
        return "Khác"
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="text-primary hover:underline">
            Trang chủ
          </Link>
          {" / "}
          <Link href="/employer/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
          {" / "}
          <span>Thông báo</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Thông báo
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} chưa đọc
              </Badge>
            )}
          </h1>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Đọc tất cả
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Notifications List */}
        {isLoading && notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Đang tải thông báo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có thông báo nào</h3>
              <p className="text-gray-600">Bạn sẽ nhận được thông báo khi có ứng viên ứng tuyển vào tin tuyển dụng của bạn.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className={`transition-all hover:shadow-md ${
                !notification.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {getNotificationTypeLabel(notification.type)}
                            </Badge>
                            {!notification.isRead && (
                              <Badge variant="destructive" className="text-xs">
                                Chưa đọc
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-900 mb-2 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage(prev => prev + 1)
                    loadNotifications()
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang tải..." : "Tải thêm"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
