# AES Security Lab - Đồ án An toàn thông tin

Đây là kho lưu trữ mã nguồn mở cho ứng dụng mô phỏng và phân tích thuật toán mã hóa chuẩn tiên tiến (AES). Ứng dụng được thiết kế trực quan nhằm phục vụ mục đích học tập, nghiên cứu cơ chế hoạt động của mật mã học và các lỗ hổng bảo mật liên quan.

## 🚀 Các tính năng chính
- **Mô phỏng thuật toán lõi:** Cung cấp giao diện tra cứu và phân tích đặc tính toán học của hộp thay thế S-Box và Inverse S-Box trong quá trình mã hóa/giải mã.
- **Thực nghiệm tấn công mật mã (Cryptanalysis):**
  - **Side-Channel Attack (Timing Analysis):** Mô phỏng rò rỉ thông tin qua thời gian thực thi (early-exit).
  - **Padding Oracle Attack:** Khai thác lỗi đệm (PKCS#7) trong chế độ CBC để khôi phục bản rõ.
  - **Brute-Force & Dictionary Attacks:** Phân tích điểm yếu của khóa dẫn xuất (PBKDF2) từ mật khẩu người dùng.
  - **Meet-in-the-Middle (MITM):** Chứng minh lỗ hổng của kiến trúc mã hóa kép (Double-AES).

## 🛠️ Công nghệ sử dụng
- Giao diện người dùng: HTML5, CSS3
- Xử lý logic & Thuật toán: Vanilla JavaScript (ES6+)
- Đóng gói ứng dụng: Node.js

## 📝 Khuyến cáo
Mã nguồn này được xây dựng hoàn toàn cho mục đích giáo dục và nghiên cứu học thuật. Vui lòng không áp dụng trực tiếp các mô phỏng tấn công vào các hệ thống thực tế khi chưa có sự cho phép.
