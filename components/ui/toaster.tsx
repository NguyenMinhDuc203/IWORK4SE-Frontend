"use client"

import {
  ToastProvider,
  ToastViewport,
} from "@radix-ui/react-toast"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, open, onOpenChange }) {
        return (
          <Toast
            key={id}
            open={open}
            onOpenChange={onOpenChange}
          >
            {title && <div className="font-medium">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
            {action}
          </Toast>
        )
      })}

      <ToastViewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-3 w-96 max-w-screen" />
    </ToastProvider>
  )
}
