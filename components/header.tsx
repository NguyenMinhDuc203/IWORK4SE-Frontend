"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import { api } from "@/lib/api"
import {
  Search,
  User,
  Bell,
  Menu,
  X,
  Building2,
  Users,
  LogOut,
  FileText,
  Eye,
  Lock,
  Heart,
  Briefcase,
  Edit,
  ChevronDown,
  BarChart3,
} from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState<"APPLICANT" | "EMPLOYER" | "ADMIN" | null>(null)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isJobSeeking, setIsJobSeeking] = useState(true)
  const [userName, setUserName] = useState("User")
  const [isPinned, setIsPinned] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const loadUserAvatar = async () => {
    try {
      const userId = localStorage.getItem("userId")
      const userTypeFromStorage = localStorage.getItem("userType") as "APPLICANT" | "EMPLOYER" | "ADMIN" | null
      
      if (!userId || !userTypeFromStorage) return
      
      if (userTypeFromStorage === "EMPLOYER") {
        const response = await api.getEmployerById(userId)
        if (response.data && (response.data as any).logoUrl) {
          setAvatarUrl((response.data as any).logoUrl)
        }
      } else if (userTypeFromStorage === "APPLICANT") {
        const response = await api.getApplicantById(userId)
        // Applicant có thể có avatarUrl hoặc profilePicture trong tương lai
        if (response.data && (response.data as any).avatarUrl) {
          setAvatarUrl((response.data as any).avatarUrl)
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

//     const syncAuthState = () => {
//       const t = localStorage.getItem("token")
//       const r = localStorage.getItem("userType") as "APPLICANT" | "EMPLOYER" | null
//       setIsLoggedIn(!!t)
//       setUserType(r)
//     }

//     const handleAuthChanged = () => syncAuthState()
//     const handleStorage = (e: StorageEvent) => {
//       if (e.key === "token" ||e.key === "userType") {
//         syncAuthState()
//       }
//     }

//     window.addEventListener("auth:changed", handleAuthChanged as EventListener)
//     window.addEventListener("storage", handleStorage)

//     return () => {
//       window.removeEventListener("auth:changed", handleAuthChanged as EventListener)
//       window.removeEventListener("storage", handleStorage)

    if (fullName) setUserName(fullName)
    
    // Load avatar if logged in (not for ADMIN)
    if (token && userTypeFromStorage && userTypeFromStorage !== "ADMIN") {
      loadUserAvatar()
    } else {
      setAvatarUrl(null)
    }
  }

  useEffect(() => {
    checkAuthState()

    const handleStorageChange = () => {
      checkAuthState()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
        setIsPinned(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleClick = () => {

    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    setIsUserDropdownOpen(newPinnedState);
  };

  const handleMouseEnter = () => {
    setIsUserDropdownOpen(true);
  };


  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsUserDropdownOpen(false);
    }
  };

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
    window.dispatchEvent(new Event("auth:changed"))
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                    <Link href="/employer/applicants">
                      <Button variant="ghost" size="sm">
                        Quản lý Ứng viên
                      </Button>
                    </Link>
                  </>
                )}

                {userType === "ADMIN" && (
                  <>
                    <Link href="/admin/dashboard">
                      <Button variant="ghost" size="sm">
                        <Building2 className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    </Link>
                    <Link href="/admin/jobs">
                      <Button variant="ghost" size="sm">
                        Quản lý việc làm
                      </Button>
                    </Link>
                    <Link href="/admin/companies">
                      <Button variant="ghost" size="sm">
                        Quản lý công ty
                      </Button>
                    </Link>
                    <Link href="/admin/applicants">
                      <Button variant="ghost" size="sm">
                        Quản lý ứng viên
                      </Button>
                    </Link>
                    <Link href="/admin/statistics">
                      <Button variant="ghost" size="sm">
                        Thống kê
                      </Button>
                    </Link>
                  </>
                )}

                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>

                <div className="relative pb-2" ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClick}

                    className="flex items-center gap-2 hover:text-current"
                  >
                    {avatarUrl ? (
                      <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={avatarUrl}
                          alt={userName}
                          className="h-full w-full object-cover"
                          onError={() => setAvatarUrl(null)}
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{userName}</span>
                      {userType === "APPLICANT" && <span className="text-xs text-primary">Đang tìm việc</span>}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>


                  {isUserDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-96 bg-background border rounded-lg shadow-lg"  >
                      <div className="p-4">
                        {/* User info header */}
                        <div className="flex items-center gap-3 mb-4">
                          {avatarUrl ? (
                            <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                              <img
                                src={avatarUrl}
                                alt={userName}
                                className="h-full w-full object-cover"
                                onError={() => setAvatarUrl(null)}
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium">{userName}</h3>
                            {userType === "APPLICANT" && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-primary">Đang tìm việc</span>
                                <Switch
                                  checked={isJobSeeking}
                                  onCheckedChange={setIsJobSeeking}
                                  className="data-[state=checked]:bg-primary"
                                />
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
                                <Building2 className="h-5 w-5 text-primary" />
                                <span className="text-sm">Admin Dashboard</span>
                              </Link>
                              <Link
                                href="/admin/jobs"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Briefcase className="h-5 w-5 text-primary" />
                                <span className="text-sm">Quản lý việc làm</span>
                              </Link>
                              <Link
                                href="/admin/companies"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Building2 className="h-5 w-5 text-primary" />
                                <span className="text-sm">Quản lý công ty</span>
                              </Link>
                              <Link
                                href="/admin/applicants"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Users className="h-5 w-5 text-primary" />
                                <span className="text-sm">Quản lý ứng viên</span>
                              </Link>
                              <Link
                                href="/admin/statistics"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <BarChart3 className="h-5 w-5 text-primary" />
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
                                <Edit className="h-5 w-5 text-primary" />
                                <span className="text-sm">Cập nhật hồ sơ</span>
                              </Link>
                              <Link
                                href="/applied-jobs"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Briefcase className="h-5 w-5 text-primary" />
                                <span className="text-sm">Việc làm đã ứng tuyển</span>
                              </Link>
                              <Link
                                href="/saved-jobs"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Heart className="h-5 w-5 text-primary" />
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
                                <Building2 className="h-5 w-5 text-primary" />
                                <span className="text-sm">Dashboard</span>
                              </Link>
                              <Link
                                href="/employer/jobs"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Briefcase className="h-5 w-5 text-primary" />
                                <span className="text-sm">Quản lý việc làm</span>
                              </Link>
                              <Link
                                href="/employer/profile/edit"
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <Edit className="h-5 w-5 text-primary" />
                                <span className="text-sm">Cập nhật hồ sơ công ty</span>
                              </Link>
                            </>
                          )}

                          <Link
                            href="/change-password"
                            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <Lock className="h-5 w-5 text-primary" />
                            <span className="text-sm">Đổi mật khẩu</span>
                          </Link>

                          <button
                            onClick={() => {
                              handleLogout()
                              setIsUserDropdownOpen(false)
                            }}
                            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 transition-colors w-full text-left bg-red-50/50"
                          >
                            <LogOut className="h-5 w-5 text-red-600" />
                            <span className="text-sm text-red-600">Đăng xuất</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {userType === "APPLICANT" && (
                  <>
                    <Link href="/employer/register">
                      <Button size="sm" className="bg-[#1e7efc] hover:bg-[#2ea3ff] text-white font-medium">
                        NHÀ TUYỂN DỤNG
                      </Button>
                    </Link>
                    {/* <Link href="/applications">
                      <Button variant="ghost" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Đơn ứng tuyển
                      </Button>
                    </Link>
                    <Link href="/saved-jobs">
                      <Button variant="ghost" size="sm">
                        Việc đã lưu
                      </Button>
                    </Link> */}
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
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
