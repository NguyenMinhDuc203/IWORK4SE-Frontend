# 🔧 Troubleshooting API Connection Issues

## Vấn đề hiện tại: "Failed to fetch"

### ✅ **Đã sửa:**
1. **Hydration Error**: Thêm `suppressHydrationWarning` và `ClientOnly` component
2. **API Error Handling**: Cải thiện error handling với timeout và thông báo lỗi rõ ràng
3. **TypeScript Errors**: Sửa lỗi type trong API client

### 🔍 **Các bước kiểm tra:**

#### 1. **Kiểm tra Backend có đang chạy không:**
```bash
# Truy cập trực tiếp vào Swagger UI
http://localhost:8080/swagger-ui.html
```

#### 2. **Kiểm tra API endpoint:**
```bash
# Test endpoint trực tiếp
curl http://localhost:8080/job-post/active?page=0&size=1
```

#### 3. **Kiểm tra CORS Configuration:**
Backend đã có `@CrossOrigin(origins = "*", maxAge = 3600)` trong JobPostController

#### 4. **Kiểm tra Network Tab:**
- Mở Developer Tools (F12)
- Vào tab Network
- Refresh trang và xem có request nào bị fail không

### 🚀 **Cách test:**

1. **Backend**: Đảm bảo `BackendServiceApplication.java` đang chạy trong IntelliJ
2. **Frontend**: Chạy `npm run dev` trong VS Code
3. **Test**: Truy cập http://localhost:3000 và cuộn xuống phần "API Connection Test"

### 📊 **Thông tin debug sẽ hiển thị:**

- **API URL**: http://localhost:8080
- **Endpoint**: /job-post/active
- **Timestamp**: Thời gian test
- **Error Status**: Mã lỗi nếu có
- **Troubleshooting Tips**: Hướng dẫn khắc phục

### 🔧 **Các lỗi thường gặp:**

#### **"Failed to fetch"**
- Backend không chạy
- Port 8080 bị chặn
- CORS không được cấu hình đúng

#### **"Request timeout"**
- Backend chạy chậm
- Database connection issues
- Network latency cao

#### **"404 Not Found"**
- Endpoint không tồn tại
- URL không đúng
- Backend chưa deploy endpoint

### 💡 **Giải pháp:**

1. **Restart Backend**: Stop và start lại BackendServiceApplication
2. **Check Database**: Đảm bảo database có dữ liệu JobPost
3. **Check Logs**: Xem logs trong IntelliJ console
4. **Test với Postman**: Test API trực tiếp với Postman

### 📝 **Logs để kiểm tra:**

**Backend Logs (IntelliJ Console):**
```
Started BackendServiceApplication in X.XXX seconds
Tomcat started on port(s): 8080 (http)
```

**Frontend Logs (Browser Console):**
```
API Test Error: ApiError: Không thể kết nối đến server...
```

### 🎯 **Kết quả mong đợi:**

Khi API hoạt động đúng, bạn sẽ thấy:
- ✅ **Kết nối thành công!**
- **API hoạt động bình thường! Đã nhận được X việc làm từ backend.**
- Raw response data với cấu trúc JSON đúng
