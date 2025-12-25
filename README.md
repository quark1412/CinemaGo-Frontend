# CinemaGo Frontend

Ứng dụng web quản lý rạp chiếu phim được xây dựng bằng Next.js 15, React 19, TypeScript và Tailwind CSS.

## Yêu cầu hệ thống

- **Node.js** (phiên bản 18.x trở lên)
- **npm** hoặc **yarn** hoặc **pnpm**

## Cài đặt

1. **Cài đặt các dependencies**:

   ```bash
   npm install
   ```

2. **Tạo file `.env.local`** trong thư mục gốc với nội dung:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   (Thay đổi URL nếu backend của bạn chạy ở cổng khác)

## Chạy website

**Chạy ở chế độ development:**

```bash
npm run dev
```

Website sẽ chạy tại [http://localhost:3000](http://localhost:3000)

**Build cho production:**

```bash
npm run build
npm run start
```

## Các lệnh khác

- `npm run lint` - Kiểm tra lỗi code
- `npm run build` - Build ứng dụng cho production
- `npm run start` - Chạy server production

## Xử lý lỗi

- Nếu cổng 3000 đã được sử dụng, Next.js sẽ tự động chuyển sang cổng tiếp theo
- Đảm bảo backend API đang chạy và URL trong `.env.local` đúng
- Nếu gặp lỗi build, xóa thư mục `.next` và `node_modules`, sau đó cài đặt lại dependencies
