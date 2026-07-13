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

## Đồng bộ dữ liệu qua GitHub (cho bản deploy trên GitHub Pages)

GitHub Pages chỉ phục vụ file tĩnh — nó **không chạy được `server.ts`**. Vì vậy khi
xem bản deploy trên GitHub Pages, mọi lời gọi tới server (`/api/get-data`,
`/api/save-raw-data`...) sẽ thất bại, và app sẽ tự động chuyển sang đọc/ghi
trực tiếp file `src/db_store.json` **trong chính repo GitHub này** thông qua
GitHub Contents API. Nhờ vậy Admin/Editor sửa dữ liệu ở đâu, Viewer ở nơi
khác cũng sẽ nhận được sau vài giây (nhờ cơ chế polling có sẵn của app).

Để bật tính năng này:

1. Tạo một **Fine-grained Personal Access Token** tại
   https://github.com/settings/personal-access-tokens/new
   - **Repository access**: chỉ chọn repo `marketing_report_v2` này (không chọn "All repositories")
   - **Permissions**: chỉ cấp `Contents: Read and write` — không cấp thêm quyền nào khác
2. Thêm vào `.env.local` (không commit file này lên Git):
   ```
   VITE_GITHUB_OWNER=kdung1206
   VITE_GITHUB_REPO=marketing_report_v2
   VITE_GITHUB_BRANCH=main
   VITE_GITHUB_TOKEN=<token vừa tạo>
   ```
3. Khi build & deploy qua GitHub Actions (`.github/workflows/static.yml`),
   thêm các biến trên vào **Settings → Secrets and variables → Actions**
   của repo, rồi khai báo chúng trong bước build của workflow (dạng
   `env:` với `${{ secrets.VITE_GITHUB_TOKEN }}` v.v.) để giá trị được
   nhúng vào bản build tĩnh.

⚠️ **Lưu ý bảo mật quan trọng**: vì GitHub Pages không có server để giữ bí
mật, token này **sẽ nằm trong file JS công khai** sau khi build (ai mở dev
tools cũng xem được). Giới hạn token đúng như hướng dẫn ở bước 1 (chỉ 1 repo,
chỉ quyền Contents) để nếu bị lộ, thiệt hại chỉ giới hạn ở việc ai đó có thể
commit vào đúng repo báo cáo này — không ảnh hưởng tài khoản GitHub hay các
repo khác của bạn. Nên đổi token định kỳ.

Mỗi lần lưu dữ liệu qua đường này sẽ tạo một commit mới (kèm `[skip ci]`
trong nội dung commit để không kích hoạt lại quy trình build/deploy mỗi lần
lưu dữ liệu).
