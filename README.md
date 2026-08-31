# Heo Đất Planner 🐷

App cá nhân quản lý ngân sách và kế hoạch mua sắm:

- Danh sách món đồ cần mua, chi tiết từng món, độ ưu tiên, thời điểm mong muốn có.
- Nhập báo giá từ nhiều nơi bán, so sánh giá + đánh giá, app gợi ý phương án cân bằng, giữ lịch sử giá theo thời gian.
- Khai báo khoản tiết kiệm từng tháng (mỗi tháng một con số), app tính khả thi cho từng món; không khả thi thì đề xuất dời thời điểm hoặc mức tiết kiệm thêm mỗi tháng.
- Dữ liệu lưu trong 1 file JSON trong repo GitHub riêng tư của bạn — không có server nào giữ dữ liệu, kèm lịch sử mọi thay đổi; xuất Excel (CSV) trong Cài đặt.
- 2 chủ đề giao diện: **Heo Đất pastel** (mặc định) và **Xanh tối giản** — đổi trong Cài đặt.
- Chạy trên máy tính và điện thoại (PWA, cài lên màn hình chính được).

## Bắt đầu

Xem [SETUP.md](./SETUP.md) — tạo repo dữ liệu riêng tư + mã truy cập (3 phút), và cách deploy.

## Kỹ thuật

- React 19 + TypeScript + Vite, không router (điều hướng bằng state), không thư viện UI ngoài.
- `src/lib/feasibility.ts` — bộ tính phân bổ tiết kiệm và khả thi (có unit test: `npm test`).
- `src/lib/github-storage.ts` — đọc/ghi file dữ liệu trong repo GitHub qua Contents API (token do người dùng tự tạo, kiểm soát phiên bản bằng sha).
- `src/styles/themes.css` — 2 chủ đề bằng CSS variables; thêm chủ đề mới chỉ cần thêm 1 block `[data-theme='…']`.
- Xem giao diện với dữ liệu mẫu: thêm `?demo=1` vào địa chỉ.
