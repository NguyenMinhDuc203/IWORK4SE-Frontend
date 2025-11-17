"use client"

import { useEffect, useState } from "react"
import AIChatWidget from "./ai-chat-widget"

export default function AIChatWidgetWrapper() {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Check if user is logged in and has APPLICANT role
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      const role = localStorage.getItem("role") // Assuming role is stored in localStorage after login
      
      // Show AI chat widget only for APPLICANT
      if (token && role === "APPLICANT") {
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
        
        if (token && role === "APPLICANT") {
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

  return <AIChatWidget />
}

