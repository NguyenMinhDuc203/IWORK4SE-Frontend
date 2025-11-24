"use client"

import { useEffect, useState } from "react"
import LogoLoop from "@/components/logo-loop"
import { api } from "@/lib/api"

interface Company {
  companyName: string
  industry: string
  location: string
  logoUrl: string
}

interface LogoItem {
  src: string
  alt: string
  title?: string
  href?: string
}

export default function CompanyLogoLoop() {
  const [logos, setLogos] = useState<LogoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const response = await api.getDistinctCompanies()
        const companies: Company[] = response.data || []

        const logoItems: LogoItem[] = companies.map((company) => ({
          src: company.logoUrl,
          alt: company.companyName,
          title: company.companyName,
          href: `/companies/${encodeURIComponent(company.companyName)}`,
        }))

        setLogos(logoItems)
        setError(null)
      } catch (err) {
        console.error("[Failed to fetch companies:", err)
        setError("Failed to load companies")
        setLogos([])
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Đang tải danh sách công ty...</div>
      </div>
    )
  }

  if (error || logos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">{error || "Không có công ty nào để hiển thị"}</div>
      </div>
    )
  }

  return (
    <div className="relative">
      <LogoLoop
        logos={logos}
        speed={80}
        direction="left"
        logoHeight={64}
        gap={48}
        pauseOnHover
        fadeOut
        fadeOutColor="#ffffff"
        scaleOnHover
        ariaLabel="Top companies"
      />
    </div>
  )
}
