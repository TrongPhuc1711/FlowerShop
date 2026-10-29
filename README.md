# 🌸 Flower Shop — Hệ Thống Quản Lý Cửa Hàng Hoa Tươi

Hệ thống quản lý bán hàng (POS), tồn kho theo phương pháp FEFO, phiếu nhập hàng và quản lý khách hàng/nhà cung cấp thiết kế chuẩn 3NF, hỗ trợ giao diện **Mobile First** mượt mà trên điện thoại và máy tính.

---

## 🚀 Công Nghệ
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend**: Node.js, Express, TypeScript, Zod, MySQL2 (Raw Queries & Connection Pool).
- **Database**: MySQL 8.0 Cloud (Aiven Cloud) với chuẩn 3NF và 31 bảng & views.

---

## 📱 Tính Năng Mobile First
- **Thanh điều hướng dưới (Mobile Bottom Navigation Bar)**: Tiện lợi thao tác một tay với các mục Tổng quan, Bán hàng, Sản phẩm, Tồn kho, Menu.
- **Menu Drawer cảm ứng**: Trượt mượt mà cùng hiệu ứng nền mờ (Backdrop blur).
- **Bán hàng POS tại quầy**: Giao diện chọn hoa, tính chiết khấu và tạo hóa đơn tối ưu cho màn hình cảm ứng.
- **Quản lý kho FEFO**: Giám sát tồn kho thực tế, số lượng giữ chỗ và cảnh báo ngưỡng tồn tối thiểu.

---

## 🛠 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Khởi chạy
```bash
# Chạy Backend (cổng 3001)
cd backend
npm run dev

# Chạy Frontend (cổng 5173)
cd ../frontend
npm run dev
```

Truy cập: `http://localhost:5173`
- Tài khoản quản trị mặc định: `admin` / `password`
