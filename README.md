# iWork4SE Frontend

Frontend cho nền tảng tìm việc làm IT iWork4SE, được xây dựng với Next.js 15 và TypeScript.

## 🚀 Tính năng chính

### Cho ứng viên:
- **Tìm kiếm việc làm**: Tìm kiếm thông minh với nhiều bộ lọc
- **Xem chi tiết việc làm**: Thông tin đầy đủ về công việc và công ty
- **Ứng tuyển**: Gửi đơn ứng tuyển với CV và thư xin việc
- **Quản lý ứng tuyển**: Theo dõi trạng thái các đơn ứng tuyển
- **Lưu việc làm**: Lưu các việc làm quan tâm
- **Dashboard**: Tổng quan về hoạt động tìm việc

### Cho nhà tuyển dụng:
- **Đăng việc làm**: Tạo và quản lý tin tuyển dụng
- **Quản lý ứng viên**: Xem và phản hồi đơn ứng tuyển
- **Dashboard**: Thống kê và quản lý tổng quan
- **Tìm kiếm ứng viên**: Tìm kiếm ứng viên phù hợp

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 15 với App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Fetch API với custom wrapper
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Mono

## 📁 Cấu trúc thư mục

```
iwork4se-fe/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Dashboard ứng viên
│   ├── employer/          # Dashboard nhà tuyển dụng
│   ├── jobs/              # Trang việc làm
│   ├── login/             # Đăng nhập
│   ├── register/          # Đăng ký
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Trang chủ
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── header.tsx         # Header component
│   ├── footer.tsx         # Footer component
│   └── theme-provider.tsx # Theme provider
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   └── utils.ts          # Utility functions
├── hooks/                 # Custom hooks
└── public/               # Static assets
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc pnpm

### Cài đặt dependencies
```bash
cd iwork4se-fe
npm install
# hoặc
pnpm install
```

### Chạy development server
```bash
npm run dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

### Build cho production
```bash
npm run build
npm start
```

## 🔧 Cấu hình

### Environment Variables
Tạo file `.env.local` trong thư mục root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### API Configuration
API client được cấu hình trong `lib/api.ts` với các tính năng:
- Automatic token management
- Error handling
- TypeScript support
- Request/response interceptors

## 📱 Responsive Design

Ứng dụng được thiết kế responsive với:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface
- Optimized for mobile devices

## 🎨 Design System

### Colors
- **Primary**: Deep blue (#1e3a8a)
- **Accent**: Teal/Cyan (#0d9488)
- **Background**: Clean white
- **Muted**: Light gray

### Typography
- **Font Family**: Geist Sans (primary), Geist Mono (code)
- **Font Sizes**: Responsive scale từ 12px đến 48px
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Components
Sử dụng shadcn/ui components với custom styling:
- Button, Input, Card, Select, Alert
- Consistent spacing và border radius
- Dark mode support

## 🔐 Authentication

### Flow
1. User đăng ký với email và password
2. Email verification (mock)
3. Đăng nhập với username/password
4. JWT token được lưu trong localStorage
5. Token được gửi trong header của mọi API request

### Protected Routes
- Dashboard pages yêu cầu authentication
- Automatic redirect to login nếu chưa đăng nhập
- Role-based routing (APPLICANT vs EMPLOYER)

## 📊 API Integration

### Endpoints được tích hợp:
- **Authentication**: `/auth/login`, `/auth/refresh-token`, `/auth/logout`
- **User Management**: `/user/sign-up`, `/user/change-pwd`
- **Job Posts**: `/job-post/`, `/job-post/{id}`, `/job-post/search`
- **Applications**: `/application/`, `/application/{id}`
- **CV Management**: `/cv/upload`, `/cv/applicant/{id}`
- **Saved Jobs**: `/saved-job/save`, `/saved-job/applicant/{id}`

### Error Handling
- Global error boundary
- API error messages
- Loading states
- Retry mechanisms

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.

---

**iWork4SE** - Nền tảng tìm việc làm IT hàng đầu Việt Nam 🚀
