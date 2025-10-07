# 🔍 Comprehensive Debug Guide - API Connection Issues

## 🎯 **Vấn đề hiện tại:**
Frontend báo lỗi "Không thể kết nối đến server" mặc dù backend hoạt động bình thường.

## ✅ **Đã kiểm tra và OK:**

### 1. **Backend Configuration:**
- ✅ CORS: `@CrossOrigin(origins = "*", maxAge = 3600)` trong tất cả controllers
- ✅ CorsConfig: Cấu hình global CORS cho tất cả endpoints
- ✅ Endpoint `/job-post/active` tồn tại và hoạt động
- ✅ Database connection: PostgreSQL Supabase
- ✅ Repository method `findActiveJobPosts` đúng cú pháp

### 2. **Frontend Configuration:**
- ✅ API URL: `http://localhost:8080` (default)
- ✅ Error handling: Timeout 10s, proper error messages
- ✅ TypeScript types: Đã sửa lỗi implicit any

## 🔧 **Các bước debug tiếp theo:**

### **Bước 1: Test trực tiếp với browser**
1. Truy cập: http://localhost:3000/simple-test
2. Nhấn "Test API Connection"
3. Xem console logs (F12 → Console)

### **Bước 2: Test toàn diện database**
1. Truy cập: http://localhost:3000/database-test
2. Nhấn "Test All Endpoints"
3. Kiểm tra từng endpoint có hoạt động không

### **Bước 3: Kiểm tra Network Tab**
1. Mở Developer Tools (F12)
2. Vào tab Network
3. Refresh trang và xem requests
4. Tìm request nào bị fail (màu đỏ)

### **Bước 4: Test với Swagger UI**
1. Truy cập: http://localhost:8080/swagger-ui.html
2. Test endpoint `/job-post/active` trực tiếp
3. Xem có trả về data không

### **Bước 5: Test với curl/Postman**
```bash
# Test basic connection
curl http://localhost:8080/job-post/active?page=0&size=1

# Test with headers
curl -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     http://localhost:8080/job-post/active?page=0&size=1
```

## 🚨 **Các nguyên nhân có thể:**

### **1. Database không có dữ liệu:**
- JobPost table trống
- Không có records với `jobStatus = 'ACCEPTED'`
- `closingDate` đã hết hạn

### **2. Network/Firewall issues:**
- Port 8080 bị chặn
- Antivirus chặn localhost connections
- Windows Firewall blocking

### **3. Browser security:**
- Mixed content (HTTP/HTTPS)
- Browser extensions can thiệp
- CORS preflight requests bị block

### **4. Backend startup issues:**
- Database connection failed
- JPA/Hibernate errors
- Missing dependencies

## 🔍 **Debug Commands:**

### **Backend Logs (IntelliJ Console):**
```
# Tìm các logs quan trọng:
- "Started BackendServiceApplication"
- "Tomcat started on port(s): 8080"
- "HikariPool-1 - Starting..."
- "JPA/Hibernate" errors
- "CORS" related logs
```

### **Frontend Logs (Browser Console):**
```
# Tìm các logs quan trọng:
- "API Test Error:"
- "Failed to fetch"
- "CORS" errors
- Network request details
```

## 🎯 **Kết quả mong đợi:**

### **Nếu thành công:**
```json
{
  "status": 200,
  "message": "Active job posts retrieved successfully",
  "data": {
    "content": [...],
    "pageNumber": 0,
    "pageSize": 1,
    "totalPages": 5,
    "totalElements": 10
  }
}
```

### **Nếu thất bại:**
- HTTP 500: Database/Server error
- HTTP 404: Endpoint không tồn tại
- CORS error: Cross-origin request blocked
- Network error: Connection refused/timeout

## 💡 **Giải pháp khuyến nghị:**

1. **Kiểm tra database có data không**
2. **Test với Swagger UI trước**
3. **Kiểm tra Network tab trong browser**
4. **Restart cả backend và frontend**
5. **Kiểm tra firewall/antivirus settings**

## 📞 **Next Steps:**

Sau khi chạy các test trên, hãy chia sẻ:
1. Kết quả từ http://localhost:3000/simple-test
2. Kết quả từ http://localhost:3000/database-test
3. Screenshot Network tab trong browser
4. Logs từ IntelliJ console
5. Kết quả test với Swagger UI
