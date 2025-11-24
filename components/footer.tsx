import Link from "next/link"
import { Briefcase, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"
export function Footer() {
  return (
    <footer className="bg-muted/50 border-t ">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-20 justify-items-center">
          {/* Logo & Description */}
          <div className="max-w-xs -mt-6">
            <Link href="/" className="block">
              <Image
                src="/assets/Full_logo_iwork4se_no_background.png"
                alt="iWork4SE Logo"
                width={260}
                height={100}
                priority
                className="h-20 w-auto -ml-4.5"
              />
            </Link>
            <p className="mt-0 text-sm text-muted-foreground">
              Nền tảng tìm việc làm IT chuyên nghiệp, kết nối ứng viên với nhà tuyển dụng hàng đầu Việt Nam.
            </p>
          </div>


          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="text-muted-foreground hover:text-primary transition-colors">
                  Tìm việc làm
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-muted-foreground hover:text-primary transition-colors">
                  Công ty
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-4">
            <h3 className="font-semibold">Dành cho nhà tuyển dụng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/employer/register" className="text-muted-foreground hover:text-primary transition-colors">
                  Đăng ký tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/employer/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Bảng giá
                </Link>
              </li>
              <li>
                <Link href="/employer/support" className="text-muted-foreground hover:text-primary transition-colors">
                  Hỗ trợ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Liên hệ</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@iwork4se.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 iWork4SE. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
