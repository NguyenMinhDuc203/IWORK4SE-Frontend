"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  User, 
  Bell, 
  Menu, 
  X,
  Briefcase,
  Building2,
  Users,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState<"APPLICANT" | "EMPLOYER" | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const userTypeFromStorage = localStorage.getItem("userType") as "APPLICANT" | "EMPLOYER" | null
    setIsLoggedIn(!!token)
    setUserType(userTypeFromStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("userType")
    setIsLoggedIn(false)
    setUserType(null)
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">iWork4SE</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm việc làm, công ty..."
                className="pl-10 pr-4"
              />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/jobs" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Việc làm
            </Link>
            <Link 
              href="/companies" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Công ty
            </Link>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {userType === "APPLICANT" && (
                  <>
                    <Link href="/applications">
                      <Button variant="ghost" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Đơn ứng tuyển
                      </Button>
                    </Link>
                    <Link href="/saved-jobs">
                      <Button variant="ghost" size="sm">
                        Việc đã lưu
                      </Button>
                    </Link>
                  </>
                )}
                
                {userType === "EMPLOYER" && (
                  <>
                    <Link href="/employer/dashboard">
                      <Button variant="ghost" size="sm">
                        <Building2 className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/employer/jobs">
                      <Button variant="ghost" size="sm">
                        Quản lý việc làm
                      </Button>
                    </Link>
                  </>
                )}
                
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                
                <div className="relative group">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Tài khoản
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-muted">
                        Hồ sơ cá nhân
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                      >
                        <LogOut className="h-4 w-4 mr-2 inline" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm việc làm, công ty..."
              className="pl-10 pr-4"
            />
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
