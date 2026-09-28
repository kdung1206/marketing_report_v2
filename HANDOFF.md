# Handoff — marketing_report_v2 (chuyển sang máy khác tiếp tục)

Ngày đóng gói gần nhất: **2026-09-28** (mục 0 bên dưới). Mục 0-cũ (2026-09-26, Website Report
redesign A-D) giữ nguyên phía dưới, vẫn còn giá trị. Bản gốc 2026-08-07 ở cuối file cũng vẫn còn
giá trị (TikTok sandbox key, YouTube consent screen, Google Ads case). **Đọc mục 0 mới nhất trước.**

## 0. Phiên 2026-09-28 — đã xong gì, đang dở gì, làm gì tiếp theo (MỚI NHẤT)

**Context phiên này gần hết — mục này viết để 1 phiên MỚI đọc là code tiếp được ngay, không cần
hỏi lại user hay suy luận lại từ đầu.** Đây là tiếp nối trực tiếp của mục "0-cũ" bên dưới (cùng 1
luồng làm việc dài, nhiều lần gần hết context).

### Đã code, test, migrate, push xong (không còn việc tồn đọng ở các mục này)

Theo thứ tự thời gian, commit mới nhất trước khi viết mục này: `9c2726a` (đã push + deploy production
qua Vercel — xem mục 6 bên dưới cho chi tiết trạng thái deploy).

1. **Hoàn thiện Website Report redesign mục A-D** (tiếp nối mục 0-cũ): chuyển "đánh giá nhanh" của
   mục B/C (Top pages/Organic pages/Từ khoá) lên **đầu** mỗi card thay vì chân bảng; thêm ghi chú
   liệt kê các kênh GA4 gốc nằm trong nhóm "Khác" (vì "Khác" chiếm tỉ trọng lớn trong dữ liệu thật);
   phân trang bảng "Từ khoá tiềm năng SEO" — mặc định 15/trang, có dropdown chọn 15/50/100/200.
2. **Thu gọn thẻ bài viết trong Social Report** (`FacebookInsights.tsx`) — ảnh 16:9 thay vì gần
   vuông, ẩn cột Ads Impr./Ads Reach khi bài không chạy ads, lưới hiển thị tới 6 cột trên màn hình
   rộng (trước tối đa 4) — đỡ phải cuộn.
3. **Thay luồng kết nối Facebook + TikTok Ads từ dán token thủ công sang OAuth + chọn tài khoản**
   (`FacebookConnectAdmin.tsx`, `TiktokAdsConnectAdmin.tsx`, `src/server/oauthPendingStore.ts`,
   `facebookSync.ts`, `tiktokAdsOAuth.ts`) — 1 lần đăng nhập Facebook lấy được cả Page lẫn Ad
   Account để tick chọn; TikTok Ads tương tự qua Business API. Brand tự đoán, sửa được sau qua các
   route `PATCH .../brand` mới. **Facebook đã cấu hình xong và chạy được thật**: `FB_APP_ID` =
   `1964087384185195`, `FB_APP_SECRET` (32 hex, đã set đúng sau khi phát hiện lần đầu user nhập
   nhầm access token vào ô này), `FACEBOOK_REDIRECT_URI` — cả 3 đã có trong `.env.local` **và** đã
   push lên Vercel production qua Composio. Bạn có thể vào Control Panel → Kết nối nền tảng →
   Facebook → "Kết Nối Facebook" để test thật. **TikTok Ads OAuth: code xong nhưng CHƯA cấu hình**
   (`TIKTOK_MARKETING_APP_ID/SECRET/REDIRECT_URI` chưa set ở đâu cả) — user chủ động bảo "hold" vì
   app TikTok Marketing đang chờ TikTok duyệt, đừng tự ý làm tiếp cho tới khi user báo đã duyệt.
4. **Quản lý công việc (Campaign Marketing)** — mở rộng module Campaign/Task (schema đã có từ
   trước nhưng **0 dữ liệu thật trong production**, vẫn đúng ở thời điểm viết mục này):
   - `work_stream` (Digital Ads/SEO/Content/Design/Khác), `estimated_hours` trên Task.
   - Bảng `task_time_logs` — log giờ thực tế thủ công theo ngày (không dùng timer), nút ⏱ trên mỗi
     dòng task để mở panel log giờ + xem lịch sử.
   - Tab **"Theo nhân viên"** (3rd tab Campaign Marketing) — workload dashboard: task/hoàn
     thành/trễ hạn/tỉ lệ hoàn thành/giờ ước tính vs giờ log, theo khoảng ngày.
   - **Task lặp lại**: field `recurrence` (đã có sẵn tên cột từ trước nhưng chưa dùng, giờ dùng
     thật) — bật "Lặp lại" khi tạo task (mỗi N ngày/tuần/tháng, có ngày dừng tuỳ chọn), tự sinh
     occurrence tiếp theo qua cron hàng ngày có sẵn (`GET /api/cron/facebook-sync`, hàm
     `generateDueRecurringTasks` trong `campaignStore.ts`), giới hạn tạo trước tối đa 14 ngày (không
     bao giờ chạy runaway). Đã tự viết script test logic này trực tiếp trên `db_store.json` (không
     qua UI vì không đăng nhập được — xem mục "Vấn đề chưa giải quyết" bên dưới), xác nhận đúng.
   - **Liên kết task ↔ số liệu report thật**: field chung `metric_label`/`metric_unit`/
     `metric_baseline_value`/`metric_result_value` trên Task (KHÔNG phải foreign key vào bảng report
     nào — vì dữ liệu từ khoá Website Report mục C là fetch-live, không có id ổn định để tham
     chiếu). Nút **"+ Task"** trên mỗi dòng bảng "Từ khoá tiềm năng SEO" (Website Report) mở
     Campaign Marketing với task đã điền sẵn (qua state `campaignTaskPrefill` nâng lên `App.tsx`).
   - **Content Brief (SEO)**: field `seo_search_intent`/`seo_outline`/`seo_word_count_target`/
     `seo_published_url` trên Task, chỉ hiện trong form khi `work_stream = "SEO"`.
5. **4 tool SEO/Ads mới** (yêu cầu "phân tích công việc SEO-Ads để xây tool tích hợp" của user):
   - **Keyword Rank Tracker + Brand SOV** (Website Report → tab mới **"SEO Tools"**) — dùng
     **serper.dev** (API TRẢ PHÍ theo credit, khác mọi tích hợp khác trong app này) — vị trí SERP
     thật trên Google.com.vn (khác hẳn vị trí trung bình của Search Console ở tab "Tổng hợp"). Đã
     seed sẵn **22 từ khoá** đã chốt với user (8 "Lọc nước" dùng chung Karofi+Livotec — 1 lần gọi
     API đọc vị trí cả 2 domain cùng lúc, không tốn gấp đôi; 6 "Lọc tổng" riêng Karofi; 8 "Điều hoà"
     riêng Livotec — **Livotec domain đã xác nhận là `livotec.com`**, Karofi là `karofi.com`). SOV
     = đếm kết quả tin tức nhắc tới brand (khác hẳn số "Thị phần thảo luận" thủ công trên Dashboard
     chính — đã ghi chú rõ trong UI để không nhầm 2 số). Ngân sách đã tính: ~27 credit/tuần, cron
     chạy **thứ Hai hàng tuần** (`GET /api/cron/seo-tools-weekly`, tách riêng khỏi cron hàng ngày vì
     tốn tiền thật) → còn dùng được ~21 tháng trên 2500 credit free. **`SERPER_API_KEY` đã set cả
     `.env.local` và Vercel production.** ⚠️ **CHƯA gọi API serper.dev thật lần nào** — cố tình
     tránh tốn credit lúc code/test, chỉ test logic thuần (`findDomainPosition`) bằng dữ liệu giả.
     User nên tự bấm "Đồng bộ ngay" 1 lần để xác nhận trước khi tin cậy lịch tuần.
   - **Backlink Tracker** (cùng tab SEO Tools) — MIỄN PHÍ, không cần API trả phí. Cron hàng ngày có
     sẵn tự fetch từng `backlink_url`, kiểm tra còn chứa link trỏ về `target_url` không, tự
     chuyển status "Removed" nếu mất. Đã test thật bằng 1 backlink trỏ tới wikipedia.org (fetch thật
     sự, không giả lập) — chạy đúng.
   - **Social Outreach (KOC/KOL)** — theo đúng 7 câu trả lời user đã chốt (đọc file
     `task cần làm/campaign task/phan-tich-social-outreach-campaign.md` để biết bối cảnh đầy đủ nếu
     cần): ưu tiên TikTok+Facebook, roster tái dùng được (`koc_kol_accounts`), **nhập tay số liệu**
     (không có API public đáng tin cho FB/TikTok — đã tra cứu kỹ ở phiên trước), phân quyền sửa/xoá
     dùng chung cơ chế `campaign_members` đã có. Nút "Outreach" trên mỗi dòng campaign (tab Campaign
     Calendar) mở panel quản lý bài đăng + nhập số liệu (`OutreachPanel.tsx`); tab mới **"Social
     Outreach"** trong Campaign Marketing tổng hợp toàn bộ campaign + biểu đồ theo nền tảng + top 10
     KOC/KOL. **CHƯA đụng vào** scorecard "KOC/KOL Air Bài Tuần" cũ trên Dashboard chính (nhập tay,
     gắn chặt hệ thống Excel-sync/AI-analysis cốt lõi trong `App.tsx`) — user đã đồng ý để 2 nguồn
     chạy song song trước, chỉ nối vào scorecard chính khi user xác nhận số liệu ổn (xem
     `OutreachOverview.tsx`'s header comment).
   - Migration đã chạy hết trên Supabase production qua Composio (cột mới trên `tasks`, bảng
     `task_time_logs`, `keyword_rank_targets`/`keyword_rank_history`/`sov_mentions_history`
     (đã seed 22 từ khoá), `backlinks`, `koc_kol_accounts`/`outreach_posts`/`outreach_post_metrics`).
6. **3/5 tool trong file Excel SEO/Ads Automation** (commit `9c2726a`) — tiếp nối mục "Đang dở" của
   phiên trước, đã hoàn thành đúng thứ tự #1, #2, #4 trong danh sách 5 mục user đã chốt (còn #3, #5 —
   xem "Đang dở" bên dưới):
   - **Ngân sách & Pacing (Ads)** (`budgetPacingNotifier.ts`) — so `ads_performance.spend` (gộp theo
     brand + kênh parse từ `campaigns.channel` text, KHÔNG match theo tên campaign cụ thể — xem lý do
     trong header comment file) với `budget`/% thời gian đã qua của campaign trong Campaign Calendar.
     Lệch pacing >15% → cảnh báo Telegram (kèm ngày dự kiến cạn ngân sách nếu đang vượt tiến độ). Cột
     mới `pacing_alert_state`/`pacing_alert_sent_at` trên `campaigns` (đã migrate production) chống
     spam: chỉ báo lại khi đổi trạng thái hoặc sau 7 ngày vẫn còn xấu. Đã test bằng script tsx bơm dữ
     liệu giả vào `db_store.json` local rồi khôi phục lại — xác nhận đúng cả 3 nhánh (vượt/chậm/đúng
     tiến độ + tự reset khi hết lệch). **0 campaign thật nào có `budget` set trong production** — như
     phiên trước, tính năng sẵn sàng nhưng chưa có gì để tính.
   - **Technical SEO Monitor** (`technicalSeoStore.ts`/`technicalSeoSync.ts`, tab SEO Tools) — 3 kiểm
     tra MIỄN PHÍ, cron riêng hàng tuần (`GET /api/cron/technical-seo-weekly`, thứ Hai 04:00, tách
     khỏi cron ngày vì crawl vài trăm URL khá chậm) + nút "Kiểm tra ngay" thủ công:
     1. Crawl sitemap.xml (tự tìm qua robots.txt, fallback `/sitemap.xml`, hỗ trợ 1 cấp sitemap index)
        → check HTTP status từng URL, tối đa 300 URL/site.
     2. PageSpeed Insights (chỉ trang chủ, mobile) — điểm hiệu năng + LCP/CLS.
     3. Search Console Sitemaps API — số đã nộp/đã index, cảnh báo/lỗi theo Google.
     Bảng mới `technical_seo_checks` (đã migrate production, xác nhận qua Composio) — 1 dòng/URL,
     ghi đè mỗi lần chạy (không phải time-series), `first_detected_at` giữ nguyên qua các lần cập
     nhật để biết lỗi tồn tại bao lâu. **Đã test thật (không phải giả lập)** bằng cách tạo tạm 1
     `google_website_accounts` giả trỏ `karofi.com` + 1 user Editor tạm trong `db_store.json` local
     (dùng được vì `reconcileUsers()` chỉ ghi đè 5 tài khoản mặc định, tài khoản khác giữ nguyên — xem
     mục "Vấn đề chưa giải quyết" bên dưới, đã update cách giải quyết), chạy thật qua UI, rồi xoá sạch
     khôi phục lại `db_store.json` gốc. Phát hiện thật từ lần test này (không phải giả định):
     - ⚠️ **`karofi.com/sitemap1.xml` đang trả về HTTP 500 thật** — không phải lỗi code, là vấn đề
       thật trên site production. Nên báo team dev website kiểm tra. Technical SEO Monitor đã bắt
       đúng lỗi này (hiện dạng dòng "SITEMAP" riêng trong bảng URL lỗi, ưu tiên cao hơn URL thường).
     - ⚠️ **Quota PageSpeed Insights không-cần-key đã bị dùng hết TOÀN CỤC** (gọi thử không key nhận
       ngay lỗi 429 "Quota exceeded") — khác với giả định ban đầu "không key vẫn dùng được ở quota
       thấp hơn". Coi `PAGESPEED_API_KEY` là **bắt buộc**, không phải tuỳ chọn. User đã thử set biến
       này trên Vercel nhưng **kiểm tra qua Vercel API (Composio) xác nhận biến CHƯA thực sự tồn tại
       trên Vercel production** (có thể chưa bấm lưu, hoặc lưu nhầm project khác) — **việc còn treo
       cho phiên sau**: hỏi user đã set lại đúng chưa, nếu rồi thì trigger redeploy production 1 lần
       nữa (xem cách trigger ở cuối mục này) để key có hiệu lực.
     - Phát hiện + sửa 1 bug thật lúc test: nếu bước gọi Search Console Sitemaps API lỗi (vd token
       hết hạn), code CŨ sẽ mất luôn kết quả crawl + PageSpeed đã chạy thành công trước đó (throw
       trước khi kịp lưu). Đã sửa: bước Sitemaps API giờ có try/catch riêng, không làm mất kết quả 2
       bước kia.
     - Hạn chế đã biết (đúng theo phạm vi user yêu cầu — dựa theo status code): không bắt được
       "soft-404" (trang không tồn tại nhưng server vẫn trả HTTP 200) — xác nhận thật:
       `karofi.com/<path-bất-kỳ-không-tồn-tại>` trả về 200 thay vì 404.
     - **CHỦ ĐỘNG bỏ qua** Search Console URL Inspection API (trạng thái index từng URL) — quota chặt
       hơn nhiều, kiểm tra hết vài trăm URL/tuần sẽ tốn phần lớn quota cho 1 property. 3 check trên
       đã đủ phủ "gãy/chậm/thiếu coverage".
   - **On-page Optimization Scanner** (`onpageScanner.ts`, tab SEO Tools) — CHỈ chạy khi bấm tay (Editor
     dán 1 URL), KHÔNG cron, KHÔNG lưu lịch sử (xem lý do trong header comment file — quét cả trăm
     trang bằng Gemini theo lịch sẽ chậm/tốn/thừa). Trích title/meta description/H1/ảnh thiếu alt/
     internal-external link/số từ bằng regex thuần (không thêm thư viện parse HTML), sau đó nhờ
     Gemini gợi ý sửa bằng tiếng Việt. **Chặn theo domain đã kết nối Website Report** (tự suy từ
     `gsc_site_url` các account) — không cho quét URL bất kỳ, tránh biến route này thành SSRF proxy
     mở. Đã test thật với `https://karofi.com/` qua UI (cùng lúc với Technical SEO Monitor ở trên) —
     trích xuất đúng: title 55 ký tự, meta 200 ký tự (vượt ngưỡng 160 khuyến nghị), 2 thẻ H1 (nên chỉ
     1), 41/171 ảnh thiếu alt, 163 internal/19 external link, ~1854 từ. Gemini thật chưa test được
     (không có `GEMINI_API_KEY` ở local, chỉ có trên Vercel production) — code tái dùng y nguyên logic
     `/api/analyze` đã chạy thật từ trước, không có lý do để khác hành vi.
   - Đã tách client Gemini dùng chung ra `geminiClient.ts` (trước đó khởi tạo inline trong `app.ts`)
     để `onpageScanner.ts` dùng lại được mà không phải import ngược `app.ts`.
   - Migration `technical_seo_checks` + 2 cột `pacing_alert_state`/`pacing_alert_sent_at` trên
     `campaigns` đã chạy trên Supabase production qua Composio, đã verify lại bằng query đọc schema.
   - **Đã tự trigger redeploy production qua Vercel API (Composio)** sau khi push — deployment
     `dpl_GVbdJQoQXhvSk7rfXc9rKEo6yBkR`, commit `9c2726a`. Lúc trigger, `PAGESPEED_API_KEY` vẫn CHƯA
     có trên Vercel (xem phát hiện ở trên) — cần redeploy thêm 1 lần nữa sau khi user set đúng biến
     này. **Đã xác nhận qua Vercel API**: `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` ĐÃ có sẵn trên
     Vercel production (trả lời câu hỏi còn treo từ phiên trước) — Budget Pacing + Technical SEO
     Monitor's cảnh báo Telegram sẵn sàng gửi được, chỉ chờ có dữ liệu thật để cảnh báo.
     **Cách trigger redeploy qua Composio (để phiên sau khỏi dò lại)**: project Vercel là
     `prj_ynNovsFPvZv94riTmzZdrisnb46R` (tên `marketing-report-v2`), repo GitHub numeric id
     `1289388125` (`kdung1206/marketing_report_v2`) — gọi `VERCEL_CREATE_NEW_DEPLOYMENT` với
     `{name: "marketing-report-v2", project: "<project id trên>", target: "production", gitSource:
     {type: "github", repoId: "1289388125", ref: "main"}}`. Đọc env var thật trên Vercel (để verify
     1 biến đã set đúng chưa) qua `VERCEL_GET_PROJECTS` lọc theo `repoId`, xem field
     `projects[0].env[].key`/`.target` (KHÔNG trả về giá trị thật của biến, chỉ tên + phạm vi áp
     dụng — muốn đổi giá trị vẫn phải qua `VERCEL_ADD_ENVIRONMENT_VARIABLE` với `upsert: true`, hoặc
     nhờ user tự sửa trên dashboard).

### Đang dở — Phân tích thêm tool SEO/Ads từ file Excel user cung cấp (còn 2/5 mục)

User gửi file `C:\Users\dungntk.tecomen\Desktop\file download\Phan_Tich_Cong_Viec_SEO_Ads_Automation.xlsx`
(2 sheet: "SEO Tasks", "Ads Branding Tasks", mỗi sheet 5 dòng: Nhóm công việc/Công việc chi
tiết/Tần suất/Khả năng tự động hóa/Giải pháp đề xuất) — đã đọc bằng `pandas` (không dùng `markitdown`
CLI được, lệnh không có trong PATH của bash tool ở máy này — dùng `python3 -c "import pandas..."`
ghi ra file rồi Read lại để tránh lỗi encode tiếng Việt trên console Windows).

Đã phân tích xong khả thi từng dòng (ưu tiên API miễn phí/đã có sẵn, tránh Ahrefs/SEMrush/Screaming
Frog/Moz — toàn SaaS trả phí không có free tier dùng được), đã trình bày cho user và **user đã chốt
làm TẤT CẢ theo đúng thứ tự sau** (KHÔNG cần hỏi lại thứ tự nữa, code luôn). Đã xong #1 Ngân sách &
Pacing, #2 Technical SEO Monitor, #4 On-page Optimization Scanner (xem mục 6 phía trên) — còn lại
đúng 2 mục dưới đây, giữ nguyên số thứ tự gốc (#3, #5) để không lẫn với ghi chú cũ:

3. **Creative Frequency Monitor (Ads)** — CHƯA BẮT ĐẦU nhưng dữ liệu ĐÃ CÓ SẴN: field `frequency`
   trong `ads_performance` đã được `facebookAdsSync.ts` đồng bộ đầy đủ rồi (xác nhận grep thấy dòng
   165 `frequency: item.frequency != null ? Number(item.frequency) : null`) — chỉ cần viết logic
   đọc + ngưỡng cảnh báo (ví dụ >4-5) + gửi Telegram/hiển thị UI, không cần sync gì thêm. Gợi ý:
   có thể ghép chung vào `budgetPacingNotifier.ts` (đã có sẵn cơ chế Telegram + dedupe theo
   brand/channel/campaign) hoặc tách file riêng — chưa quyết, để phiên sau tự cân nhắc theo lúc đó
   còn bao nhiêu context.
5. **AI Content Planning Assistant (SEO)** — CHƯA BẮT ĐẦU. User xác nhận **đã có `GEMINI_API_KEY`
   thật**, đang dùng cho phần "Đánh giá AI" trên Dashboard chính VÀ giờ cũng dùng cho On-page
   Optimization Scanner (mục 6 phía trên) — model đã tách ra hằng số `GEMINI_MODEL` trong
   `geminiClient.ts` (`"gemini-3.5-flash"` — tên model vẫn hơi lạ, **vẫn CHƯA verify được** vì không
   có `GEMINI_API_KEY` ở local để test thật, chỉ có trên Vercel production; On-page Scanner tái dùng
   y nguyên code/model đã chạy thật của `/api/analyze` nên về lý thuyết phải hoạt động y hệt — nếu
   phiên sau thấy Gemini lỗi ở cả 2 chỗ thì đây là nghi phạm đầu tiên cần kiểm tra). Kế hoạch: dùng
   Gemini để gom nhóm từ khoá/gợi ý outline từ dữ liệu GSC + serper.dev's "related searches"/
   "people also ask" (trả kèm miễn phí trong response `/search` đã tính credit cho Rank Tracker —
   không tốn thêm credit).

**Việc CHỦ ĐỘNG bỏ qua** (đã giải thích lý do cho user, đồng ý): guest-post outreach tự động, chỉ số
spam backlink (cần Moz — trả phí, không có free tier), Brand Safety exclusion list tự động, A/B
Testing & Bidding tự động — 2 mục cuối cần **quyền ghi** vào cấu hình quảng cáo, nằm ngoài phạm vi
app này (thuộc dự án `ads_manager` riêng, đang pause).

### Đã GIẢI QUYẾT được — không đăng nhập được UI ở local dev (cách làm cho phiên sau)

Phiên trước bị chặn ở đây (không có mật khẩu admin thật, hack set password hash user `admin` không ăn
thua vì `reconcileUsers()` ghi đè lại hash hardcode cho 5 tài khoản mặc định). Phiên này tìm ra cách
đúng: `reconcileUsers()` (`src/lib/defaultUsers.ts`) **chỉ ghi đè 5 username mặc định** (`admin`,
`editor1`, `viewer1`, `viewer2`, `ntkdung1206@gmail.com`) — mọi username KHÁC 5 cái đó được giữ
nguyên (`customExtras` trong hàm này). Vậy chỉ cần thêm 1 user với username MỚI (không trùng 5 cái
trên) thẳng vào mảng `users` trong `src/db_store.json` local, kèm `passwordHash`/`salt` tự sinh bằng
`hashPasswordScrypt()`/`generateServerSalt()` (`src/lib/serverPasswordHash.ts`) — đăng nhập được ngay,
không đụng gì tới 5 tài khoản thật. Cũng làm tương tự để test tính năng cần 1 site đã kết nối Website
Report: thêm thẳng 1 dòng giả vào `google_website_accounts` (chỉ cần `gsc_site_url` trỏ domain thật —
token giả cũng được, phần nào cần token thật sẽ tự lỗi riêng phần đó, không chặn phần còn lại).

**Luôn nhớ dọn dẹp sau khi test**: backup `src/db_store.json` trước khi sửa (copy ra thư mục scratch),
xong việc thì phục hồi lại nguyên bản — dữ liệu test không được lẫn vào file thật. Đã áp dụng đúng quy
trình này khi test Technical SEO Monitor + On-page Scanner ở mục 6 phía trên (tạo user `qa_test_editor`
+ 1 account giả trỏ `karofi.com`, test xong xoá sạch, khôi phục `db_store.json` nguyên vẹn).

### File tham khảo user đã chuẩn bị sẵn (đọc nếu cần bối cảnh đầy đủ)
- `task cần làm/campaign task/de-xuat-toi-uu-quan-ly-campaign-va-task.md` — phân tích tối ưu
  Campaign/Task (đã áp dụng 1 phần: Blocked status, workload view... đã có từ trước phiên này).
- `task cần làm/campaign task/phan-tich-social-outreach-campaign.md` + phản hồi user tại
  `C:\Users\dungntk.tecomen\Desktop\file download\phan hoi cau hoi social outreach.md` — đã dùng để
  code Social Outreach ở mục 5 trên.
- `C:\Users\dungntk.tecomen\Desktop\file download\Phan_Tich_Cong_Viec_SEO_Ads_Automation.xlsx` —
  đang dùng để code 5 mục ở "Đang dở" trên.

Ngày đóng gói: 2026-09-26 (mục 0-cũ). Bản gốc dưới đây giữ nguyên.

## 0-cũ. Phiên 2026-09-26 — đã xong gì, đang dở gì, làm gì tiếp theo

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
