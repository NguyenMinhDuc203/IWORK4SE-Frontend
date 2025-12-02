"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/footer"

export default function FooterWrapper() {
  const pathname = usePathname()
  const hiddenRoutes = ["/messages"]
  const shouldHide = hiddenRoutes.some((route) => pathname.startsWith(route))
  if (shouldHide) {
    return null
  }

  return <Footer />
}