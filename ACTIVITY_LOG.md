# Nhật ký hoạt động — marketing_report_v2

Ghi lại lịch sử các đợt push và tình trạng theo từng giai đoạn, để theo dõi tổng thể tiến độ dự án.
Khác với `HANDOFF.md` (dùng để *tiếp tục code ngay*, chỉ giữ việc còn dở), file này là **nhật ký
đầy đủ theo thời gian** — kể cả việc đã xong hẳn, không đổi/xoá khi việc đó đã hoàn tất.

Quy ước trạng thái: ✅ Xong, đang chạy ổn định · ⚠️ Xong nhưng có lưu ý/giới hạn · 🟡 Đang dở/chờ ·
⏸️ Tạm dừng theo yêu cầu · ❌ Đã bỏ/không làm.

---

## Giai đoạn 1 — Khởi tạo (05/07 – 18/07/2026)

Dựng khung ứng dụng ban đầu: dashboard báo cáo tuần, lưu dữ liệu bằng file JSON local
(`src/db_store.json`), CRUD cơ bản, export/import Excel, đăng nhập admin hardcode. Nhiều commit nhỏ
kiểu "Update App.tsx" trong giai đoạn này — vá lỗi/thử nghiệm liên tục khi mới xây, không tách
riêng từng tính năng.

**Trạng thái**: ✅ Nền tảng ban đầu, đã bị thay thế phần lưu trữ ở Giai đoạn 2.

---

## Giai đoạn 2 — Chuyển hạ tầng lên Vercel + Supabase (23/07/2026)

- `2cf914c` Chuyển từ lưu file JSON local sang Supabase (Postgres) + deploy Vercel, thêm giao diện
  quản trị người dùng.
- `908b9a1`, `b4ab88b` — vá lỗi build/deploy Vercel (bundle sai cách khiến function crash).

**Trạng thái**: ✅ Xong, đây là kiến trúc production hiện tại (Supabase khi deploy, JSON local khi
`npm run dev`).

## Giai đoạn 3 — Bảo mật & quản trị dữ liệu (27/07/2026)

- `4d484f1` Thêm session token ký HMAC bảo vệ toàn bộ API (trước đó API không có xác thực).
- `c4170f7` Ngừng lộ password hash qua API đồng bộ dữ liệu.
- `62679ae`, `5e43136` Bộ lọc tuần/tháng + phân trang cho bảng quản trị dữ liệu.

**Trạng thái**: ✅ Xong.

## Giai đoạn 4 — Social Report & Digital Ads Report lần đầu (02/08 – 07/08/2026)

- `d80fe47` Social Report (YouTube Analytics + Google Ads), rate-limit đăng nhập, audit log.
- `733d09e` Tạm gỡ Social Report để xây lại an toàn hơn (⏸️ tạm dừng có chủ đích).
- `913089c` Facebook Page Insights.
- `cb47680` Digital Ads Report (Facebook/Google/TikTok) — bảng số liệu quảng cáo trả phí.
- `21a0d26`, `dff41a2`, `d8ce9d0`, `124a8f6` — vá lỗi truy vấn rỗng, timeout đồng bộ, phân trang
  Supabase >1000 dòng, không lưu secret dạng plaintext.
- `3716efc` → `4e6d612` (07/08) — TikTok organic insights, YouTube organic insights, gộp lại thành
  Social Report thống nhất (3 nền tảng). `0351115` Admin giới hạn được Editor/Viewer xem hạng mục
  báo cáo nào.

**Trạng thái**: ✅ Facebook/TikTok — chạy thật, ổn định. ⚠️ YouTube — chạy được nhưng phụ thuộc
OAuth consent screen (xem Giai đoạn 6).

## Giai đoạn 5 — Cron tự động & cảnh báo hết hạn (17/08/2026)

- `ec605b2` Sửa lỗi cron hàng ngày xoá mất lịch sử follower Facebook mỗi sáng.
- `e6c9633` Cảnh báo token Facebook sắp hết hạn (trước khi chết, không phải sau).
- `2183c8a` Cảnh báo token TikTok, thêm URL riêng `/admin`, nhập liệu weekly report từ spreadsheet.
- `804dea5` Tự động đồng bộ hàng tuần từ Google Sheets/Drive (cron thứ Hai ~12h trưa).
- `735d8f4`, `747d713` Ép màn hình chọn tài khoản Google khi kết nối YouTube, cảnh báo token YouTube
  hết hạn theo chu kỳ Testing-mode (7 ngày).

**Trạng thái**: ✅ Cron hàng ngày (Facebook/TikTok/YouTube) và hàng tuần (spreadsheet) đều đã verify
chạy thật trên production, không cần bấm tay.

## Giai đoạn 6 — Backup & cảnh báo qua Telegram (26/08/2026)

- `9c6cb95` Backup toàn bộ database lên Google Drive hàng ngày (thay thế backup qua email).
- `451c4fb` Cảnh báo hết hạn kết nối qua Telegram, gộp tab Google/YouTube trong Control Panel.
- `9abd47b` Thêm cảnh báo khẩn cấp khi còn 1 ngày là hết hạn.

**Trạng thái**: ✅ Xong.

## Giai đoạn 7 — Google Ads / TikTok Ads API connector (29/08 – 31/08/2026)

- `dd1a23e` Thêm connector Google Ads API + TikTok Ads API.
- `4e31470`, `96bc7c2` Cải thiện chẩn đoán lỗi OAuth Google Ads.
- `dc21bbd` Thêm trang chính sách Google (Privacy/Terms), chuẩn hoá Ads Manager ID.

**Trạng thái**: 🟡 Đang chờ — đơn xin quyền Google Ads API (case `5-7008000041887`) bị Google hỏi lại
về loại công ty, user tự trả lời email; chưa xác nhận đã xong. TikTok Ads: đang dùng key Sandbox
tạm thời (xem `HANDOFF.md` mục 4), phải đổi lại khi TikTok duyệt app thật.

## Giai đoạn 8 — Website Report (GA4 + Search Console) lần đầu (06/09/2026)

- `94e66be` Xây tính năng Website Report (GA4 + Search Console).
- `90429f0`, `03fcc50`, `b473782` Trang `/about`, xác minh quyền sở hữu site với Google Search
  Console (đổi từ meta tag sang file HTML) — phục vụ xét duyệt OAuth.
- `71d4b1a` Hiện nội dung public tại `/` trước khi đăng nhập — cũng để qua vòng duyệt OAuth Google.

**Trạng thái**: ⚠️ Code xong nhưng **không hoạt động được cho tới 24/09** — 2 lý do phát hiện muộn:
(1) schema Supabase cho module này chưa từng được chạy trên production dù code đã deploy (xem Giai
đoạn 10), (2) thiếu scope `openid` khiến kết nối OAuth luôn báo lỗi (xem Giai đoạn 11).

## Giai đoạn 9 — Đổi thương hiệu & chuẩn bị TikTok Marketing API (14/09/2026)

- `f70d62f` Đổi tên app thành "Livotec & Karofi Analytical Hub", thêm cấu hình redirect URL cho
  TikTok Marketing/Accounts API.

**Trạng thái**: ✅ Xong.

## Giai đoạn 10 — Campaign Calendar/Task + tự động hoá báo cáo tuần (24/09/2026)

- `8c4867e` Campaign Calendar & Campaign Task (Phase 1); tự động gắn Facebook Ads + GA4/GSC vào
  báo cáo tuần thay vì nhập tay.
- `c206731` Phát hiện + sửa lỗi thứ tự SQL khi áp schema migration lên production qua Composio
  (bảng Campaign Calendar VÀ bảng Website Report đều chưa từng được tạo trên Supabase thật, dù code
  đã deploy từ Giai đoạn 8/10) — đã chạy migration thật, verify bằng truy vấn trực tiếp.
- `a4f516d` Ghép dữ liệu organic + paid Facebook cho cùng 1 bài đăng (join qua `post_id`).
- `21eb9f1` Sửa lỗi responsive: menu chuyển tab bị ẩn hoàn toàn trên mobile/tablet (người dùng thật
  báo lỗi, không tìm ra cách chuyển tab), + lỗi tràn layout trang Campaign Marketing.
- `ec74c89` Digital Ads Report: đổi bảng phẳng → cây Campaign → Ad set → Ad có thể mở rộng.
- `d782b8b` Script tạo template Excel upload TikTok Ads thủ công (trong lúc chờ API TikTok Ads
  được duyệt).

**Trạng thái**: ✅ Tất cả đã deploy, verify bằng dữ liệu thật (local + production qua Supabase/
Vercel). ⚠️ Campaign Calendar: schema đã đúng nhưng **production chưa có campaign/task thật nào** —
mới test bằng dữ liệu demo ở local, chưa dùng thật.

## Giai đoạn 11 — Redesign giao diện thẻ (card) & sửa lỗi kết nối Website (26/09/2026)

- `546dc25` Social Report: đổi bảng bài đăng → grid thẻ (ảnh, ngày, caption, chỉ số). Digital Ads
  Report: thêm gallery "Top Ads" dạng thẻ, hiển thị mặc định phía trên bảng cây.
- `381404d` **Sửa bug thật**: lỗi "Google không trả về id_token" khi kết nối Website — thiếu scope
  `openid`, không phải lỗi cấu hình OAuth Client như tưởng ban đầu.
- `e516667` Tự động nhận diện brand khi kết nối Website (bỏ dropdown chọn tay trước khi kết nối).
- `cd54951` Route "Xem URL thật" — lấy live danh sách URL từ Search Console để xây quy tắc phân
  loại trang dựa trên dữ liệu thật, không đoán.
- `fc075a7` Cập nhật `HANDOFF.md` với đặc tả đầy đủ cho phần Website Report redesign còn dở.

**Sự cố phát sinh + đã xử lý trong giai đoạn này**: 1 kết nối Website thật (karofi.com) bị gán nhầm
brand="Livotec" do kết nối rơi đúng vài phút trước khi commit `e516667` kịp deploy — đã sửa thẳng
trong Supabase, xác nhận qua log thời gian deploy vs thời gian kết nối.

**Trạng thái**: ✅ Card redesign — đã deploy, verify bằng dữ liệu thật. ✅ Bug id_token — đã sửa,
user xác nhận kết nối thành công. 🟡 **Website Report redesign (KPI/chart/table theo kênh, Top
pages, Organic pages, từ khoá SEO) — đã duyệt hướng đầy đủ, CHƯA CODE** — xem đặc tả chi tiết trong
`HANDOFF.md` mục 0.

---

## Tổng hợp trạng thái theo tính năng (tính đến 26/09/2026)

| Tính năng | Trạng thái |
|---|---|
| Báo cáo tuần (dashboard chính) | ✅ Ổn định |
| Facebook Page Insights + Ads | ✅ Ổn định, cron tự động hàng ngày |
| TikTok organic + Ads (upload Excel) | ✅ Ổn định · ⚠️ TikTok Ads API thật đang chờ duyệt, dùng key Sandbox |
| YouTube organic | ✅ Chạy được · ⚠️ Token hết hạn mỗi 7 ngày (OAuth consent screen ở chế độ Testing) |
| Digital Ads Report (drilldown + Top Ads) | ✅ Ổn định |
| Social Report (card redesign) | ✅ Ổn định |
| Website Report (GA4 + Search Console) | ⚠️ Kết nối được, đồng bộ được · 🟡 Giao diện redesign đang chờ code |
| Campaign Calendar & Task | ✅ Code + schema xong · 🟡 Chưa dùng thật trên production |
| Google Ads API (đọc dữ liệu) | 🟡 Đang chờ Google duyệt hồ sơ |
| Backup Google Drive + cảnh báo Telegram | ✅ Ổn định |
| ads_manager (viết campaign quảng cáo thật) | ⏸️ Tạm dừng, chưa quyết hướng tích hợp |
| Social Outreach (KOC/KOL) | ⏸️ Mới phân tích, tạm dừng |
| Brand Health/SOV (serper.dev) | ⏸️ Mới đề xuất mockup, chưa duyệt code |
