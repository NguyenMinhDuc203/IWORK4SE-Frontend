"use client"

import { useEffect, useRef, useState } from "react"

interface GoogleLoginButtonProps {
  onSuccess?: (token: string) => void
  onError?: (error: any) => void
  isLoading?: boolean
  buttonText?: string
  fullWidth?: boolean
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  isLoading = false,
  buttonText = "Đăng nhập với Google",
  fullWidth = true,
}: GoogleLoginButtonProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const isScriptLoaded = useRef(false)
  const [isLoadingLocal, setIsLoadingLocal] = useState(false)

  useEffect(() => {
    // Load Google Sign-In script
    if (!isScriptLoaded.current && typeof window !== "undefined") {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.google && googleButtonRef.current) {
          window.google.accounts.id.initialize({
            client_id: "1051995011454-pke3gqjcskskrbgt8okfs35td8i9fqdl.apps.googleusercontent.com",
            callback: handleGoogleLogin,
          })

          // Render the Google sign-in button
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: "standard",
            size: "large",
            text: "signin",
            locale: "vi",
            width: fullWidth ? "100%" : "auto",
          })
        }
      }
      document.head.appendChild(script)
      isScriptLoaded.current = true
    }

    return () => {
      // Cleanup
    }
  }, [fullWidth])

  const handleGoogleLogin = (response: any) => {
    try {
      if (response.credential) {
        console.log("[v0] Google Token (Credential) received, calling onSuccess...")
        setIsLoadingLocal(true)
        if (onSuccess) {
          onSuccess(response.credential)
        }
      }
    } catch (error) {
      console.error("[v0] Google login error:", error)
      setIsLoadingLocal(false)
      if (onError) {
        onError(error)
      }
    }
  }

  return <div ref={googleButtonRef} className="w-full flex justify-center" />
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement | null, options: any) => void
          prompt: (callback: any) => void
        }
      }
    }
  }
}
