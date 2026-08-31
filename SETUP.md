# Hướng dẫn cài đặt lần đầu — Heo Đất Planner

App chạy hoàn toàn trong trình duyệt. Dữ liệu lưu thành 1 file JSON trong một **repo GitHub riêng tư** của anh — đồng bộ mọi thiết bị, kèm lịch sử mọi lần thay đổi, không cần server, không cần thẻ ngân hàng.

Cần làm 2 việc một lần duy nhất (~3 phút):

## 1. Tạo repo riêng tư chứa dữ liệu

1. Vào github.com → **New repository**.
2. Tên: `budget-planner-data` (tên gì cũng được) → chọn **Private** → Create repository.
3. Không cần tạo file gì — app tự tạo file `budget-data.json` khi kết nối lần đầu.

> Repo này KHÁC với repo `budget-planner` chứa code app. Code public, dữ liệu private — tách riêng.

## 2. Tạo mã truy cập (Personal Access Token)

1. github.com → bấm ảnh đại diện → **Settings** → kéo xuống **Developer settings** → **Personal access tokens → Fine-grained tokens** → **Generate new token**.
2. Điền:
   - **Token name**: `heo-dat-planner`
   - **Expiration**: chọn dài nhất có thể (hết hạn thì tạo token mới và dán lại vào app)
   - **Repository access**: chọn **Only select repositories** → chọn `budget-planner-data`
   - **Permissions → Repository permissions → Contents: Read and write** (chỉ cần đúng 1 quyền này)
3. Generate token → copy chuỗi bắt đầu bằng `github_pat_…`

## 3. Kết nối app

Mở app tại `https://icepigsmile-dotcom.github.io/budget-planner/`:
- Ô repo: `icepigsmile-dotcom/budget-planner-data`
- Ô mã truy cập: dán token
- Bấm **Kết nối**

Làm lại đúng 2 ô này trên mỗi thiết bị (máy tính, điện thoại). Token chỉ nằm trên thiết bị của anh.

## 4. Dùng trên điện thoại

Mở địa chỉ app bằng Chrome/Safari → menu trình duyệt → **Thêm vào màn hình chính**.

## Lưu ý bảo mật

- Repo dữ liệu phải là **Private** — app sẽ từ chối kết nối nếu repo đang public.
- Token chỉ có quyền đọc/ghi nội dung đúng 1 repo dữ liệu — lộ token cũng không đụng được repo khác. Lỡ lộ thì vào Developer settings xóa token, tạo cái mới.
- Muốn xem dữ liệu bằng Excel: vào app → Cài đặt → **Xuất Excel (CSV)**.

## Chạy thử trên máy (dành cho dev)

```bash
cd app
npm install
npm run dev      # mở http://localhost:5199/budget-planner/
npm test         # unit test
npm run build    # build production
```

Xem giao diện với dữ liệu mẫu, không cần kết nối: thêm `?demo=1` vào địa chỉ.
