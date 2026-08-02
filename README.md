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

⚠️ Đừng đặt `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` trong `.env.local`.
Local dev **cố tình** không kết nối Supabase thật — không có 2 biến này, server
tự lưu dữ liệu vào `src/db_store.json` (gitignored) và dùng rate-limit/audit
log trong bộ nhớ. Việc này tách biệt hoàn toàn testing cục bộ khỏi dữ liệu
production (xem `src/server/supabaseClient.ts`). Chỉ khai báo 2 biến đó trên
Vercel — không bao giờ ở máy local.

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
file [supabase/schema.sql](supabase/schema.sql). File này dùng
`create table if not exists` / `create or replace function` nên chạy lại
toàn bộ (kể cả trên project đã có `app_state`) là an toàn — cần chạy lại nếu
project của bạn được tạo trước khi có bảng `login_attempts` (rate limiting
đăng nhập).

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
   `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `ENCRYPTION_KEY`,
   `SESSION_SECRET`, và các biến SMTP nếu dùng — tất cả đều là biến server,
   không cần tiền tố `VITE_`.

   ⚠️ `ENCRYPTION_KEY` và `SESSION_SECRET` **bắt buộc phải có** — server sẽ
   crash ngay khi khởi động nếu thiếu (không còn giá trị mặc định fallback
   nào nữa, vì bất kỳ giá trị hardcode nào trong code cũng công khai cùng
   repo). Tạo mỗi giá trị bằng:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Vercel tự nhận diện `vercel.json` (build bằng `vite build`, route
   `/api/*` vào serverless function `api/index.ts`) — không cần chỉnh gì
   thêm.
4. Deploy. Từ giờ Admin sửa dữ liệu ở đâu, Viewer ở máy khác cũng thấy sau
   vài giây (nhờ cơ chế polling có sẵn của app), vì cả hai đều đọc/ghi cùng
   một Supabase, không phụ thuộc trình duyệt hay repo GitHub nữa.

## Social Report (menu "Social Report"): tự động YouTube Analytics + Google Ads

Menu **Social Report** (sidebar bên trái, dưới "MKT Weekly") đối soát Organic
(YouTube Analytics) và Paid Ads (Google Ads) theo từng video — tự động mỗi
sáng thứ Hai qua Vercel Cron (`vercel.json` → `/api/cron/social-report-sync`),
không cần export CSV thủ công. Code nằm ở `src/server/socialReport/` (backend)
và `src/components/SocialReport/SocialReportPage.tsx` (giao diện).

**Không tự động hoá được 100%**: đây là lựa chọn có chủ đích, không phải thiếu
sót — reach (unique viewers) không được thu thập vì YouTube Analytics API chỉ
đáng tin cậy trong cửa sổ ~28 ngày, không phù hợp với số liệu lũy kế từ ngày
đăng; hai chỉ số Views và Impressions organic+paid vẫn cộng dồn an toàn.

### 1. Tạo OAuth Client trên Google Cloud

1. Vào [Google Cloud Console](https://console.cloud.google.com) → tạo project mới (hoặc dùng lại project đã có).
2. **APIs & Services → Library**: bật **YouTube Data API v3** và **YouTube Analytics API**.
3. **APIs & Services → OAuth consent screen**:
   - Nếu tài khoản Google nằm trong Google Workspace của công ty, chọn **Internal** — bỏ qua hoàn toàn bước duyệt "sensitive scopes" của Google.
   - Nếu chọn **External**, ứng dụng cần được đưa qua bước xác minh "sensitive scopes" (thường vài tuần) trước khi refresh token dùng được ổn định lâu dài. Quan trọng: phải chuyển app sang trạng thái **"In production"** (không để ở "Testing") — ở chế độ Testing, refresh token tự hết hạn sau 7 ngày và việc đồng bộ hàng tuần sẽ âm thầm dừng lại mà không có cảnh báo rõ ràng.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID** (loại "Web application"). Authorized redirect URI phải khớp **chính xác** với `GOOGLE_OAUTH_REDIRECT_URI`, ví dụ:
   `https://<domain-vercel-của-bạn>/api/social-report/oauth/google/callback`

### 2. Lấy Channel ID

YouTube Studio → **Cài đặt → Kênh → Thông tin cơ bản → "ID kênh của bạn"**
(dạng `UCxxxxxxxxxxxxxxxxxxxxxx`, không phải `@handle`).

### 3. (Tuỳ chọn) Google Ads — để tự động lấy chi tiêu

Thiếu bước này thì Social Report vẫn chạy — chỉ bỏ qua cột chi tiêu Ads, phần
organic vẫn đầy đủ.

1. Google Ads → **Tools & Settings → API Center** (cần tài khoản Google Ads Manager) → xin **Developer Token**, chọn mức **Basic Access** (đủ để đọc dữ liệu tài khoản của chính mình). Duyệt trong vài ngày làm việc.
2. Ghi lại **Customer ID** (định dạng `1234567890`, bỏ dấu gạch ngang). Nếu tài khoản này là tài khoản con quản lý qua một tài khoản Manager (MCC), ghi thêm ID tài khoản Manager vào `GOOGLE_ADS_LOGIN_CUSTOMER_ID`.

### 4. Khai báo biến môi trường

Thêm vào `.env.local` (dev) và Vercel Environment Variables (production) —
xem chú thích đầy đủ trong [.env.example](.env.example):

```
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=
YOUTUBE_CHANNEL_ID=
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CUSTOMER_ID=
GOOGLE_ADS_LOGIN_CUSTOMER_ID=
```

### 5. Kết nối & chạy thử

1. Vào menu **Social Report** (cần tài khoản **Admin**) → bấm **"Kết nối Google"** → đăng nhập/cấp quyền trên màn hình Google → được chuyển hướng ngược lại app.
2. Bấm **"Đồng bộ ngay"** để chạy thử ngay, không cần chờ tới thứ Hai. Log của lần chạy gần nhất hiển thị ngay trong panel cấu hình.
3. Từ giờ, cron tự chạy mỗi sáng thứ Hai (giờ Việt Nam) — chọn sáng thứ Hai thay vì thứ Sáu vì cả YouTube Analytics lẫn Google Ads đều cần vài ngày để số liệu ổn định.
