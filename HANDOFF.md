# Handoff — marketing_report_v2 (chuyển sang máy khác tiếp tục)

Ngày đóng gói gần nhất: **2026-09-26** (mục 0 bên dưới). Bản gốc 2026-08-07 giữ nguyên phía dưới —
vẫn còn giá trị (TikTok sandbox key, YouTube consent screen, Google Ads case). Đọc mục 0 trước.

## 0. Phiên 2026-09-26 — đã xong gì, đang dở gì, làm gì tiếp theo

**Context của phiên này đã dùng ~86%, sắp auto-compact — mục này viết để 1 phiên MỚI (hoặc sau khi
compact) đọc là tiếp tục code được ngay, không cần hỏi lại user hay suy luận lại từ đầu.**

### Đã code, test, push xong trong phiên này (không còn việc gì tồn đọng ở các mục này)

Theo thứ tự thời gian, commit mới nhất trước khi viết mục này: `cd54951`.

1. Chạy migration Supabase còn thiếu qua Composio (bảng Campaign Calendar + Website Report/GA4-GSC
   chưa từng được tạo trên production dù code đã deploy từ trước) — phát hiện và sửa luôn 1 bug thứ
   tự SQL thật (`c206731`).
2. Ghép dữ liệu organic + paid Facebook cho cùng 1 post (`a4f516d`).
3. Sửa responsive mobile/tablet: menu chuyển tab bị ẩn hoàn toàn dưới `lg:` (không phải lỗi hiển
   thị nhỏ — người dùng thật không tìm ra cách chuyển tab), + lỗi tràn layout trang Campaign
   Marketing (`21eb9f1`).
4. Digital Ads Report: đổi bảng phẳng → cây Campaign → Ad set → Ad có thể mở rộng (`ec74c89`), sau
   đó thêm gallery "Top Ads" dạng thẻ hiển thị mặc định phía trên bảng (`546dc25`).
5. Script tạo template Excel upload TikTok Ads thủ công trong lúc chờ API (`d782b8b`).
6. Social Report: đổi bảng "Recent Posts Performance" → grid thẻ kiểu card (ảnh + caption + chỉ số),
   cùng lúc với mục 4's Top Ads gallery (`546dc25`).
7. **Sửa 1 bug thật khiến kết nối Website (GA4/Search Console) luôn báo "Google không trả về
   id_token"**: thiếu scope `openid` trong `GOOGLE_WEBSITE_SCOPES` — không phải lỗi cấu hình
   OAuth Client (`381404d`).
8. **Tự động nhận diện brand khi kết nối Website** — bỏ hẳn dropdown chọn brand trước khi kết nối,
   brand tự suy ra từ tên GA4 property + domain Search Console + email (case-insensitive substring
   "livotec"/"karofi"), có ô sửa tay nếu nhận diện sai/không ra (`e516667`).
9. Route "Xem URL thật" (Admin, Control Panel → Kết nối nền tảng → Google → Website → nút
   🔍) — lấy live 250 URL thật của karofi.com qua Search Console API, không lưu gì, chỉ để xem
   trước khi xây quy tắc phân loại trang (`cd54951`).

**Sự cố đã xử lý xong, không cần làm lại**: 1 kết nối Website thật (karofi.com, tài khoản
`karofi06@gmail.com`) bị gán nhầm `brand='Livotec'` do kết nối rơi đúng vài phút trước khi commit
`e516667` kịp deploy — đã sửa thẳng trong Supabase (`brand='Karofi'`), không phải bug lặp lại.

### Đang dở — "Website Report redesign" (đã duyệt hướng, CHƯA code) — ưu tiên làm tiếp theo đầu tiên

User đã duyệt toàn bộ các quyết định dưới đây qua nhiều vòng trao đổi trong phiên — **không cần hỏi
lại**, chỉ cần code đúng theo đây:

**A. Bố cục tab "Tổng hợp" của Website Report (component `src/components/WebsiteReport.tsx`)** —
tham khảo demo đã duyệt tại 2 artifact (link trong lịch sử chat, hoặc dựng lại tương đương):
- KPI tiles: Sessions, Organic Sessions, GSC Impressions, GSC Clicks, CTR, Avg Position.
- Narrative "Nhận định nhanh" — vài câu tự sinh từ số liệu trên (không cần thêm dữ liệu mới).
- Biểu đồ Sessions theo kênh (Organic Search/Paid Search/Direct/Organic Social/Referral/Khác) theo
  thời gian — cần thêm 1 GA4 report mới: dimension `sessionDefaultChannelGroup` + metric `sessions`
  ONLY (không gộp chung với report tổng đang có — xem comment trong `googleWebsiteSync.ts` giải
  thích lý do đã tách report tổng/organic-only tương tự cho `organic_sessions`).
- Bảng "Nguồn traffic" — % theo từng kênh, dùng chung dữ liệu breakdown trên.
- ❌ **Bỏ hẳn mọi tile/chart Google Ads** (Paid Share, Spend, CPC) — đã có ở Digital Ads Report.

**B. "Top pages" (GA4 pageviews) + "Organic pages" (Search Console clicks/impressions) — nhóm theo
loại trang** — cần thêm:
- GA4: 1 report mới dimension `pagePath`, metrics `screenPageViews`/`totalUsers`/
  `userEngagementDuration`.
- Search Console: 1 report mới dimension `page` (khác dimension `query` ở mục C) — có thể tái dùng
  hàm `listSearchConsoleTopPages` đã có sẵn trong `googleWebsiteSync.ts` (hiện dùng cho route xem
  trước, chỉ cần gọi lại có lưu/hiển thị khác đi).
- **Quy tắc phân loại trang — ĐÃ CHỐT, dựa trên 250 URL thật của karofi.com (không phải đoán)**:
  ```
  path === "/"                    → Trang chủ
  path bắt đầu "/trang/"          → Trang tĩnh
  path khớp /-bv\d+\.html$/i      → Bài viết        (103/250 URL thật, ~41%)
  path kết thúc ".html" (còn lại) → Sản phẩm         (131/250 URL thật, ~52%)
  còn lại (không ".html")         → Danh mục         (9/250)
  path bắt đầu "/en"               → gộp vào loại tương ứng, không tách riêng (chỉ 2/250, quá ít)
  ```
  Đã test bằng script Node đọc thẳng file Excel user xuất ra (`url thật.xlsx` trên Desktop user) —
  phân bố tốt, không dồn hết vào 1 nhóm. **Lưu ý: quy tắc này áp cho karofi.com — nếu Livotec dùng
  nền tảng website khác (Shopify, WordPress...) với cấu trúc URL khác hẳn, PHẢI chạy lại route
  "Xem URL thật" cho site Livotec rồi kiểm tra quy tắc còn đúng không trước khi áp dụng chung.**

**C. "Từ khoá tiềm năng SEO" (Striking-distance keywords) + tách Brand/Non-brand**:
- Search Console: 1 report mới dimension `query`, fetch live (không sync hàng ngày, giống cách
  route "pages-preview" đã làm) — không cần bảng Supabase mới.
- Brand/Non-brand: hậu xử lý trên CHÍNH dữ liệu `query` — query chứa "karofi"/"livotec" (không
  phân biệt hoa thường) → Brand, còn lại → Non-brand.
- **Ngưỡng striking-distance PHẢI làm dạng cấu hình được trên UI** (2 ô nhập: khoảng vị trí +
  impressions tối thiểu), KHÔNG hardcode — mặc định ban đầu vị trí 4–20, ≥10 impressions (lý do đã
  giải thích trong chat: site traffic thấp dễ bị bảng trống nếu theo ngưỡng chặt 4–10/≥1.000 của
  ảnh mẫu tham khảo).

**D. Đã duyệt thêm (ưu tiên thấp hơn A/B/C, làm nếu còn thời gian)**:
- GA4 Country/City (dimension `country`/`city`, luôn có dữ liệu, không bị Google ẩn do ngưỡng mẫu).
- GA4 Device category (mobile/desktop/tablet split).
- Search Console Device breakdown (dimension `device` — organic-specific, khác GA4 Device).

**E. Đã đánh giá và CHỐT BỎ QUA (đừng làm, đã giải thích lý do cho user)**: GA4 Events, GA4
Monetization/Ecommerce, GA4 Retention cohort, GA4 Age/Gender/Interest, Search Console Countries,
Search Console Search appearance, Search Console Coverage/Sitemaps/Core Web Vitals/Links (2 mục
cuối **không khả thi** với API `searchAnalytics.query` đang dùng — cần tích hợp API khác hẳn).

### Việc khác còn treo, KHÔNG liên quan Website Report (mức độ ưu tiên thấp hơn nhiều)

- ads_manager (`D:\Dung\ads_manager`) tích hợp + vai trò "Quảng cáo" — user chủ động pause, chưa
  quyết hướng, đừng tự động làm tiếp.
- Social Outreach (KOC/KOL) — mới phân tích, pause.
- Brand Health/SOV qua serper.dev — mới đề xuất mockup, chưa duyệt code.
- Production Campaign Calendar/Task: schema đã có, nhưng **0 campaign/task thật nào đã tạo** — chỉ
  mới test bằng dữ liệu demo ở local.

Ngày đóng gói: 2026-08-07. Bản gốc dưới đây giữ nguyên.

## 1. Trạng thái repo

- Repo local đang ở `D:\Dung\marketing_report_v2`, git branch `main`, **đã push đầy đủ, không có gì
  chưa commit** (commit mới nhất: `4e6d612`). GitHub: `kdung1206/marketing_report_v2`.
- Production: `https://marketing-report-v2.vercel.app` (Vercel + Supabase, project ref
  `dledwrwkpjhslbegrttc`).
- ⚠️ **Trước đây từng có 1 phiên Claude Code khác chạy song song trong cùng thư mục này** (gây
  bug thật do vừa sửa vừa build/deploy chồng nhau). Trên máy mới, chạy `git log --oneline -5` và
  `git status` trước để chắc chắn thấy đúng những gì nêu ở đây, đề phòng có thay đổi từ phiên khác
  chưa kịp ghi vào file này.
- `ONBOARDING.md` (cùng thư mục) là log chi tiết theo thời gian của toàn bộ phiên làm việc trước
  — đọc nếu cần hiểu rõ *tại sao* một quyết định kỹ thuật cụ thể được đưa ra. File này chỉ tóm tắt
  *trạng thái hiện tại*.

## 2. Cách tiếp tục trên máy mới

1. Giải nén/copy toàn bộ thư mục này (đã đóng gói kèm `.env.local`, `src/db_store.json`, `.git` —
   không cần lo mất gì).
2. `npm install` (không đóng gói `node_modules` — cài lại cho sạch, tránh binary sai nền tảng).
3. `npm run dev` → http://localhost:3000. Trên PowerShell nếu gặp lỗi
   `npm.ps1 cannot be loaded because running scripts is disabled`, dùng Git Bash hoặc chạy 1 lần:
   `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.
4. Nếu dùng Claude Code với Composio: các kết nối (Gmail `dung.nguyen3@gws.karofi.vn`, Vercel,
   Supabase, GitHub) là **theo tài khoản Composio, không theo máy** — tự động dùng lại được, không
   cần kết nối lại.

## 3. Đã xây xong, đang chạy tốt trên production

- **Digital Ads Report** — Facebook Ads (API thật), Google/TikTok Ads (upload Excel). Không có
  việc tồn đọng.
- **Social Report** — 3 nền tảng:
  - **Facebook Page Insights**: chạy thật, ổn định.
  - **TikTok**: chạy thật, đã verify OAuT round-trip thành công. ⚠️ Xem mục 4 — đang dùng key
    Sandbox tạm thời, cần đổi lại sau khi TikTok duyệt app.
  - **YouTube**: code đã xong, đã deploy, nhưng **chưa dùng được** — thiếu OAuth Client từ Google
    Cloud Console. Xem mục 5.
- **Phân quyền báo cáo theo vai trò** — Admin tick chọn Editor/Viewer được xem hạng mục báo cáo
  nào (Control Panel → Quản trị người dùng). Mặc định ai cũng xem được hết, Admin phải tự bật giới
  hạn.
- Chữ ký footer: "Designed & Developed by Nguyen Thi Kim Dung".

## 4. TikTok — đang dùng key Sandbox, PHẢI đổi lại khi được duyệt

TikTok App Review (app id `767102015617406994`) đang chờ duyệt. Vì Production/Sandbox dùng
**client_key/secret khác nhau hoàn toàn** trên TikTok, hiện tại `.env.local` và Vercel Environment
Variables đang tạm set:

```
TIKTOK_CLIENT_KEY=sbawpmyb4nvtlq4twc          (Sandbox — đang dùng)
TIKTOK_CLIENT_SECRET=bx8FVTGRXR32x6X1ozOMgSOQ55W79GTf
```

**Giá trị Production cần đổi lại sau khi TikTok duyệt xong** (đã lưu sẵn trong comment của biến
trên Vercel, và ở đây để chắc chắn không mất):

```
TIKTOK_CLIENT_KEY=aw5pxzr4w92ou5of
TIKTOK_CLIENT_SECRET=xhkICqxnXbAPvNjV8RVe9AMHThE2LQ2A
```

Đổi ở cả `.env.local` (local dev) và Vercel Environment Variables (production), rồi redeploy.

## 5. YouTube — cần tạo Google Cloud OAuth Client (chưa ai làm)

Xem hướng dẫn đầy đủ từng bước trong `.env.example` (phần `YOUTUBE_CLIENT_ID`). Tóm tắt:
1. console.cloud.google.com — bật "YouTube Data API v3" + "YouTube Analytics API".
2. OAuth consent screen — nếu project thuộc Google Workspace Livotec/Karofi, chọn User Type
   **Internal** (bỏ qua hoàn toàn bước Google duyệt, không giới hạn 7 ngày).
3. Tạo OAuth Client ID (Web application), thêm Redirect URI.
4. Đưa `YOUTUBE_CLIENT_ID`/`SECRET`/`REDIRECT_URI` — set vào `.env.local` + Vercel.

Đã xác nhận: tài khoản Google dự định dùng có vai trò "Người quản lý" trên cả kênh Karofi và
Livotec — đủ quyền, không cần làm gì thêm ở YouTube Studio.

## 6. Google Ads API — đang chờ user tự trả lời, KHÔNG liên quan tới YouTube

Đơn Basic Access (case `5-7008000041887`) đang bị Google Ads API Compliance hỏi lại về company
type (hiện là "Independent Google Ads Developer", nên đổi thành "Advertiser"). User nói sẽ tự trả
lời email này — kiểm tra Gmail `dung.nguyen3@gws.karofi.vn` xem đã có phản hồi tiếp theo chưa nếu
tiếp tục việc này. **Không liên quan** tới YouTube Analytics (2 API/quy trình cấp quyền hoàn toàn
khác nhau, xem mục 5).

## 7d. Tự động đồng bộ HÀNG TUẦN từ spreadsheet — MỚI (2026-08-17, commit `804dea5`, đã deploy)

Khác với mục 7 bên dưới (đồng bộ Facebook/TikTok/YouTube **hàng ngày**), đây là tính năng mới:
Control Panel → Nhập liệu → thẻ **"2. Tự động đồng bộ định kỳ từ Spreadsheet"**. Dán link
Google Sheets/Drive (chia sẻ "Anyone with the link"), bật công tắc, bấm "Lưu cấu hình" — từ đó
`GET /api/cron/weekly-spreadsheet-sync` (Vercel Cron `0 5 * * 1` = **thứ Hai 12:00 giờ VN**) tự
kéo và merge file đó, không cần vào tải file lên tay mỗi tuần nữa.

- **Lưu ý về giờ chạy**: Vercel Hobby chỉ đảm bảo cron chạy đâu đó trong **khung giờ đã đặt**
  (12:00–12:59 giờ VN thứ Hai), không đảm bảo đúng phút. Điều này đã ghi rõ trong giao diện.
- **Sửa 1 hiểu nhầm cũ**: comment trong code trước đây ghi "Vercel Hobby giới hạn 2 cron job/dự
  án" — kiểm tra lại với tài liệu chính thức Vercel (2026-08-17) thì **không đúng**: Hobby cho
  tới 100 cron job/dự án, giới hạn thật là **mỗi job chỉ chạy tối đa 1 lần/ngày**. Đã sửa comment
  sai này trong `app.ts`/`ONBOARDING.md`. Vẫn giữ Facebook Ads/TikTok/YouTube gộp chung 1 cron
  hàng ngày như cũ (không đổi) vì chúng cùng chu kỳ ngày — chỉ là lý do đúng khác với trước.
- Cấu hình (link, bật/tắt, lần chạy gần nhất) lưu trong `app_state` blob, giống `mail_config` —
  không cần bảng Supabase mới.
- Dùng chung logic merge với upload thủ công (`src/server/dataMerge.ts`) và chung logic đọc sheet
  với upload thủ công (`parseWorkbookFromBuffer`, `src/lib/export.ts`) — nên hai đường (tự động
  và tay) không bao giờ merge khác nhau.
- Đã verify trên dev server: lưu link trỏ vào 1 file test → "Đồng bộ thử ngay" → dữ liệu vào đúng
  DB; trỏ link sang trang HTML → báo lỗi rõ ràng, **không xóa mất** thời điểm đồng bộ thành công
  gần nhất trước đó; cron endpoint 401 nếu thiếu `CRON_SECRET`, trả `skipped` (không phải lỗi)
  khi chưa cấu hình link hoặc đang tắt. Đã verify route thật trên production trả về đúng
  `skipped: "Chưa cấu hình link spreadsheet."` (chưa ai dán link thật vào).
- **Việc còn lại**: chưa có link Google Sheets/Drive thật nào được dán vào — cần vào Control
  Panel dán link thật rồi bấm "Đồng bộ thử ngay" một lần để xác nhận trước khi tin tưởng lịch
  thứ Hai tới.

## 7e. YouTube — kết nối xong, cảnh báo hết hạn token (2026-08-17, commit `747d713`)

YouTube OAuth Client đã tạo xong trên Google Cloud Console hôm nay (redirect URI production:
`https://marketing-report-v2.vercel.app/api/youtube/oauth/callback`), 3 biến `YOUTUBE_CLIENT_ID`/
`YOUTUBE_CLIENT_SECRET`/`YOUTUBE_REDIRECT_URI` đã lưu lên Vercel production + redeploy. Cả 2 kênh
**Livotec** và **Karofi** đã kết nối và đồng bộ thành công lần đầu.

**Vấn đề phát sinh lúc kết nối, đã xử lý**: OAuth consent screen đang ở chế độ **"Testing"**
(External) — Google giới hạn quyền truy cập chỉ cho "Test users" đã thêm tay, và quan trọng hơn:
**refresh_token tự hết hạn sau đúng 7 ngày** kể từ lúc kết nối, bất kể có đồng bộ hay không (khác
Facebook/TikTok — 2 nền tảng đó refresh_token sống rất lâu). Đã thêm cảnh báo tương tự Facebook/
TikTok: cột mới `refresh_token_expires_at` trên `youtube_accounts` (ước tính = ngày kết nối + 7,
vì Google **không** trả về hạn thật qua API — không có cách nào biết chắc app đang Testing hay
đã Published/Internal). Control Panel → Kết nối nền tảng → YouTube hiện cảnh báo vàng khi còn
≤ 2 ngày. Đã backfill cho 2 kênh hiện có: hạn ước tính **24/08/2026**.

**Việc cần làm trước 24/08/2026** để không phải đăng nhập lại liên tục mỗi 7 ngày — chọn 1 trong 2:
1. Nếu tài khoản Google (`ntkdung1206@gmail.com`) thuộc Google Workspace của Livotec/Karofi: đổi
   OAuth consent screen User Type sang **Internal** — hết hẳn giới hạn 7 ngày, không cần verify.
2. Nếu là Gmail cá nhân (nhiều khả năng đúng vậy): phải nộp app cho Google **verify** (App
   Verification) vì đang xin 2 scope "restricted" (`youtube.readonly`, `yt-analytics.readonly`) —
   quá trình này tốn thời gian thật (không phải việc session này làm ngay được), hoặc đơn giản là
   cứ chấp nhận đăng nhập lại mỗi 7 ngày (không mất dữ liệu, chỉ mất công thao tác tay).

## 7. Tự động đồng bộ hàng ngày — ĐÃ SỬA XONG (2026-08-07)

Cơ chế cron (`GET /api/cron/facebook-sync`, Vercel Cron `0 1 * * *` = 8h sáng giờ VN) đã có sẵn
từ trước, gộp cả Facebook Page Insights + Facebook Ads + TikTok + YouTube vào 1 lần gọi — nhưng
**chưa từng chạy được** vì thiếu biến `CRON_SECRET` trên Vercel (route tự chặn 401 nếu thiếu biến
này, và Vercel Cron cũng không tự gửi secret nếu biến chưa tồn tại). Đã tạo secret, set vào Vercel
(production) + `.env.local`, redeploy, và **verify trực tiếp bằng cách tự gọi cron endpoint** —
xác nhận chạy thật: 2 Facebook Page + nhiều Facebook Ad Account + 2 tài khoản TikTok (95 và 64
video) đồng bộ thành công. Từ giờ **không cần bấm "Đồng bộ ngay" thủ công nữa** — hệ thống tự chạy
1 lần/ngày. Cơ chế lỗi đã có sẵn từ trước đúng như yêu cầu: mỗi tài khoản vẫn tự thử lại mỗi ngày
kể cả khi lỗi tạm thời; chỉ khi refresh token thật sự hỏng (`token_expired=true`) mới cần đăng
nhập lại thủ công — dữ liệu ngừng cập nhật và UI báo rõ "🔴 Cần đăng nhập lại", không có gì "ngắt"
âm thầm.

## 7b. Kiểm tra lại cron + 2 việc đã làm thêm (2026-08-17)

**Cron đang chạy đúng, mỗi ngày, không cần bấm tay.** Bằng chứng lấy từ production: Vercel cron
vẫn bật (`disabledAt: null`), và dấu vết chạy lúc **01:15 UTC (08:15 giờ VN)** thấy ở
`ads_performance.updated_at`, `fb_posts.synced_at`, `tiktok_insights_daily`,
`fb_ad_accounts.last_synced_at` các ngày 13→17/08. Lần "Đồng bộ ngay" thủ công ngày 17/08 là
thừa. Cách audit này dùng lại được: bảng nào có cột thời điểm ghi thì nhìn histogram theo phút là
biết cron có chạy hay không.

**Bug 1 — lịch sử follower bị xóa mỗi ngày (đã sửa, commit `ec605b2`).** Mỗi lần sync kéo lại cửa
sổ 14 ngày rồi upsert **nguyên dòng**; `fan_count` chỉ có ở dòng *hôm nay* (Meta khai tử chuỗi
`page_fans*` lịch sử) nên 13 ngày trước bị ghi đè `null` mỗi sáng. Production lúc phát hiện: 21
ngày dữ liệu, đúng 1 ngày có `fan_count`, 20 ngày `NULL` → biểu đồ "Tăng trưởng Follower" chỉ có 1
điểm, "Follower mới" luôn = 0. Sửa bằng `preserveStoredValues()` trong `facebookSync.ts`: giá trị
đã lưu thắng `null` mới. Phần lịch sử đã mất **không lấy lại được** (Facebook không cấp), chỉ tích
lũy đúng từ giờ. TikTok không dính lỗi này (chỉ ghi dòng hôm nay).

**Bug 2 — không biết token Facebook sắp hết hạn (đã thêm cảnh báo, commit `e6c9633`).** Trước đây
chỉ có `token_expired` — cờ này bật *sau khi* Facebook đã từ chối (code 190), tức là biết khi báo
cáo đã cũ rồi. Nay `fetchTokenExpiry()` gọi Graph API `debug_token` mỗi lần sync (chạy song song
với việc kéo dữ liệu) và ngay sau khi Admin lưu token, ghi vào 3 cột mới của `fb_pages`
(`token_expires_at`, `token_data_access_expires_at`, `token_checked_at` — migration đã chạy trên
production). Control Panel → Kết nối nền tảng → Facebook hiện hạn token từng page và cảnh báo vàng
khi còn ≤ 7 ngày. Hai mốc chết khác nhau, lấy mốc nào đến trước: hạn của chính token, và mốc
~90 ngày Meta cắt quyền truy cập dữ liệu (mốc này cắt cả token "vĩnh viễn"). `FB_APP_ID`/
`FB_APP_SECRET` là tùy chọn (xem `.env.example`) — không set thì tự soi token bằng chính nó.

## 7c. Ba việc làm thêm cùng ngày (2026-08-17, commit `2183c8a`, đã deploy)

1. **TikTok cũng có cảnh báo hạn token** — dữ liệu đã nằm sẵn trong
   `tiktok_accounts` từ lâu, chỉ thiếu chỗ hiển thị. Cảnh báo theo **refresh token** (365 ngày;
   access token 24h tự làm mới nên bỏ qua), ngưỡng **30 ngày** — rộng hơn Facebook (7 ngày) vì
   phải nhờ chủ tài khoản TikTok tự đăng nhập lại. Đã xác nhận trên production: mốc refresh token
   **không** tự đẩy lùi mỗi lần refresh — vẫn là 2027-08-07, đúng 365 ngày kể từ lần cấp quyền
   đầu tiên.
2. **Control Panel có URL riêng `/admin`** — trước đây mọi view dùng chung `/` nên F5 là văng về
   dashboard. Back/Forward đi lại được giữa 2 nơi; mở `/admin` lúc chưa đăng nhập thì giữ nguyên
   địa chỉ và sau khi đăng nhập vào thẳng Control Panel (guard "Viewer" vốn cũng chạy khi *chưa ai
   đăng nhập* từng ghi đè URL về `/`). Các tab báo cáo vẫn dùng chung `/` — nếu sau này muốn tách
   link riêng cho Social Report/Digital Ads thì sửa cùng chỗ (`ADMIN_PATH`/`isAdminPath` trong
   `App.tsx`). Không cần cấu hình routing: `vercel.json` đã rewrite `/(.*)` → `/index.html`, dev
   server chạy Vite `appType: "spa"`.
3. **Nhập liệu weekly report từ spreadsheet** — sheet `comments` (nhận định tuần) trước giờ chỉ
   *xuất* được, tải lên thì bị bỏ qua, nên phần nhận định luôn phải gõ tay; nay đọc lại được →
   file "Xuất Database Đầy Đủ (.xlsx)" thành mẫu sửa-rồi-tải-lên đúng nghĩa. Chọn file không còn
   đồng bộ ngay: hiện bảng xem trước (số dòng từng nhóm, tuần nào có nhận định, sheet nào bị bỏ
   qua) rồi mới bấm "Xác nhận & Đồng bộ". Kèm theo đã sửa merge nhận định ở
   `POST /api/sync-data` thành **merge sâu** (`src/lib/comments.ts`, dùng chung client/server) —
   trước đây file chỉ chứa `evaluation` của 1 thương hiệu sẽ xóa mất `proposals` + ghi chú từng
   hạng mục của chính thương hiệu đó. Sheet `users` cố ý vẫn không nhập.

Lưu ý khi kiểm tra production bằng dòng lệnh: `curl https://marketing-report-v2.vercel.app/` giờ
có thể trả về trang "Vercel Security Checkpoint" thay vì HTML thật (chống bot) — kiểm tra trạng
thái deploy qua Vercel API/dashboard, đừng dựa vào curl.

## 8. Chưa có, chưa được yêu cầu build

Hệ thống quản lý/setup trực tiếp campaign quảng cáo (tạo/sửa/tắt campaign, đặt budget, targeting)
cho team Ads — đã audit kỹ, xác nhận **chưa có dòng code nào** làm việc này trong dự án. User nói
sẽ build riêng, không phải việc của session này.
