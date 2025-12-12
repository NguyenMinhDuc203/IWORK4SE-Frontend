"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordValidatorProps {
  password: string
  className?: string
}

export interface PasswordValidation {
  isValid: boolean
  hasMinLength: boolean
  hasUpperCase: boolean
  hasLowerCase: boolean
  hasNumber: boolean
}

export function validatePassword(password: string): PasswordValidation {
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  return {
    isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
  }
}

export default function PasswordValidator({ password, className }: PasswordValidatorProps) {
  const validation = validatePassword(password)

  const requirements = [
    { label: "Tối thiểu 8 ký tự", met: validation.hasMinLength },
    { label: "Có ít nhất 1 chữ hoa (A-Z)", met: validation.hasUpperCase },
    { label: "Có ít nhất 1 chữ thường (a-z)", met: validation.hasLowerCase },
    { label: "Có ít nhất 1 số (0-9)", met: validation.hasNumber },
  ]

  // Only show when user starts typing
  if (!password) return null

  return (
    <div className={cn("space-y-2 p-3 bg-gray-50 rounded-lg border", className)}>
      <p className="text-xs font-medium text-gray-700">Yêu cầu mật khẩu:</p>
      <ul className="space-y-1.5">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            )}
            <span className={cn("transition-colors", req.met ? "text-green-700 font-medium" : "text-gray-600")}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
