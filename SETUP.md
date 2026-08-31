# Hướng dẫn cài đặt lần đầu — Heo Đất Planner

App chạy hoàn toàn trong trình duyệt, dữ liệu nằm trong 1 file Excel trên OneDrive cá nhân của anh.
Cần làm 3 việc một lần duy nhất: (1) tạo file Excel, (2) đăng ký app với Microsoft để lấy Client ID, (3) đưa app lên GitHub Pages.

## 1. Tạo file Excel trên OneDrive

1. Vào https://onedrive.live.com bằng tài khoản Microsoft cá nhân của anh.
2. Tạo file Excel mới, đặt tên ví dụ `KeHoachMuaSam.xlsx`. Để trống — app tự tạo các sheet.
3. Bấm chuột phải vào file → **Sao chép liên kết** (Copy link). Giữ quyền mặc định là được —
   app truy cập file bằng chính tài khoản của anh, **không cần** mở quyền "bất kỳ ai có link"
   (và không nên mở, để người khác cầm link không sửa được dữ liệu).
   Link này sẽ dán vào màn hình "Kết nối dữ liệu" của app.

## 2. Đăng ký app với Microsoft (lấy Client ID)

Miễn phí, làm 1 lần:

1. Vào https://entra.microsoft.com và đăng nhập bằng chính tài khoản Microsoft cá nhân.
2. Vào **Identity → Applications → App registrations → New registration**.
3. Điền:
   - **Name**: `Heo Dat Planner` (tên gì cũng được)
   - **Supported account types**: chọn **Personal Microsoft accounts only**
   - **Redirect URI**: chọn loại **Single-page application (SPA)** và điền địa chỉ app.
     - Khi chạy thử trên máy: `http://localhost:5199/budget-planner/`
     - Khi đã lên GitHub Pages: `https://<tên-github>.github.io/budget-planner/`
     - Có thể thêm cả 2 (mục Authentication → Add URI).
4. Bấm **Register**. Ở trang Overview, copy **Application (client) ID** — chuỗi dạng `xxxxxxxx-xxxx-...`.
5. Mở app → màn hình Kết nối dữ liệu → mục **Cài đặt nâng cao** → dán Client ID vào. Chỉ cần dán 1 lần trên mỗi thiết bị.

Không cần tạo secret hay cấp quyền admin: app dùng quyền delegated `Files.ReadWrite` + `User.Read`, Microsoft sẽ hỏi anh đồng ý ngay lần đăng nhập đầu.

## 3. Đưa app lên GitHub Pages

1. Tạo repo GitHub mới tên `budget-planner` (public hoặc private đều được — Pages với repo private cần gói trả phí, nên chọn public; app không chứa bí mật gì, dữ liệu vẫn nằm trong OneDrive của anh).
2. Đẩy toàn bộ thư mục `app/` lên repo (file workflow deploy đã có sẵn trong `.github/workflows/deploy.yml`).
3. Trong repo: **Settings → Pages → Source: GitHub Actions**.
4. Sau lần push đầu, app có địa chỉ `https://<tên-github>.github.io/budget-planner/`.
5. Nhớ thêm địa chỉ này vào Redirect URI ở bước 2.

> Nếu đặt tên repo khác `budget-planner`: sửa biến `VITE_BASE` trong `.github/workflows/deploy.yml` (hoặc `base` trong `vite.config.ts`) thành `/<tên-repo>/`.

## 4. Dùng trên điện thoại

Mở địa chỉ GitHub Pages bằng Chrome/Safari trên điện thoại → menu trình duyệt → **Thêm vào màn hình chính**. App chạy như app cài đặt bình thường.

## Chạy thử trên máy (dành cho dev)

```bash
cd app
npm install
npm run dev      # mở http://localhost:5199/budget-planner/
npm test         # unit test bộ tính khả thi
npm run build    # build production
```

Xem giao diện với dữ liệu mẫu, không cần đăng nhập: thêm `?demo=1` vào địa chỉ.
