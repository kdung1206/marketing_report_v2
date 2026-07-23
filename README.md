<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/343fafab-6b69-41e6-8e2a-c767c4ddf347

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy: Vercel + Supabase

Bản deploy trước dùng GitHub Pages (thuần static) nên không chạy được
`server.ts`, và phải "chữa cháy" bằng cách ghi thẳng `src/db_store.json` lên
chính repo GitHub qua Contents API (token lộ trong bundle JS, dữ liệu công
khai cho bất kỳ ai có link repo). Cách deploy hiện tại thay thế hoàn toàn cơ
chế đó bằng:

- **Vercel**: chạy `src/server/app.ts` (chứa toàn bộ route `/api/*`) dưới
  dạng Serverless Function (`api/index.ts`), nên `/api/get-data`,
  `/api/save-raw-data`... luôn hoạt động thật — không còn fallback nào cần
  thiết nữa.
- **Supabase (Postgres)**: là nơi lưu dữ liệu thật (bảng `app_state`), vì
  filesystem của Vercel Serverless Function không giữ được dữ liệu qua các
  lần gọi/deploy khác nhau. Đây là bước bắt buộc đi kèm — deploy lên Vercel
  mà không đổi chỗ lưu trữ thì dữ liệu ghi vào sẽ mất ngay lập tức.

### 1. Tạo bảng trong Supabase

Vào **Supabase Dashboard → SQL Editor → New query**, dán và chạy nội dung
file [supabase/schema.sql](supabase/schema.sql).

### 2. Cấu hình biến môi trường

Lấy `Project URL` và `service_role` key tại **Project Settings → API**, rồi
thêm vào `.env.local` (không commit file này):

```
SUPABASE_URL=<project url>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

⚠️ Đây là 2 biến **phía server** (không có tiền tố `VITE_`), nên không bao
giờ bị nhúng vào file JS công khai. Tuyệt đối không đặt `service_role` key
vào biến `VITE_*` — làm vậy sẽ lộ toàn quyền đọc/ghi database ra trình
duyệt.

### 3. Di chuyển dữ liệu hiện có (chạy một lần)

```
npm run migrate:supabase
```

Lệnh này đọc `src/db_store.json` (dữ liệu báo cáo hiện tại) và ghi vào bảng
`app_state` trên Supabase. Sau bước này, `src/db_store.json` không còn được
dùng nữa (đã được thêm vào `.gitignore`).

### 4. Deploy lên Vercel

1. Import repo này vào Vercel (New Project → chọn repo).
2. Ở phần **Environment Variables**, khai báo: `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `ENCRYPTION_KEY`, và các
   biến SMTP nếu dùng — tất cả đều là biến server, không cần tiền tố `VITE_`.
3. Vercel tự nhận diện `vercel.json` (build bằng `vite build`, route
   `/api/*` vào serverless function `api/index.ts`) — không cần chỉnh gì
   thêm.
4. Deploy. Từ giờ Admin sửa dữ liệu ở đâu, Viewer ở máy khác cũng thấy sau
   vài giây (nhờ cơ chế polling có sẵn của app), vì cả hai đều đọc/ghi cùng
   một Supabase, không phụ thuộc trình duyệt hay repo GitHub nữa.
