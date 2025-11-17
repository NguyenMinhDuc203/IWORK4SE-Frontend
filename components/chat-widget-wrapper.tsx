"use client"

import { useEffect, useState } from "react"
import ChatWidget from "./chat-widget"

export default function ChatWidgetWrapper() {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Check if user is logged in and has ADMIN or EMPLOYER role
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      const role = localStorage.getItem("role") // Assuming role is stored in localStorage after login
      
      // Show chat widget only for ADMIN and EMPLOYER
      if (token && (role === "ADMIN" || role === "EMPLOYER")) {
        setShouldShow(true)
      } else {
        setShouldShow(false)
      }
    }
  }, [])

  // Listen for storage changes (when user logs in/out)
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token")
        const role = localStorage.getItem("role")
        
        if (token && (role === "ADMIN" || role === "EMPLOYER")) {
          setShouldShow(true)
        } else {
          setShouldShow(false)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    // Also check periodically in case role is updated
    const interval = setInterval(handleStorageChange, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  if (!shouldShow) {
    return null
  }

  return <ChatWidget />
}

