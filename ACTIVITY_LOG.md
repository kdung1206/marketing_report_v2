# Nhật ký hoạt động — marketing_report_v2

Ghi lại lịch sử các đợt push và tình trạng theo từng giai đoạn, để theo dõi tổng thể tiến độ dự án.
Khác với `HANDOFF.md` (dùng để *tiếp tục code ngay*, chỉ giữ việc còn dở), file này là **nhật ký
đầy đủ theo thời gian** — kể cả việc đã xong hẳn, không đổi/xoá khi việc đó đã hoàn tất.

Quy ước trạng thái: ✅ Xong, đang chạy ổn định · ⚠️ Xong nhưng có lưu ý/giới hạn · 🟡 Đang dở/chờ ·
⏸️ Tạm dừng theo yêu cầu · ❌ Đã bỏ/không làm.

Cập nhật lần gần nhất: tính đến hết ngày **01/10/2026** (Giai đoạn 1-18).

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
user xác nhận kết nối thành công. 🟡 Website Report redesign (KPI/chart/table theo kênh, Top pages,
Organic pages, từ khoá SEO) — đã duyệt hướng đầy đủ, CHƯA CODE ở thời điểm này — **xem tiếp Giai
đoạn 12/13, hoàn tất ngay sau đó cùng chuỗi làm việc**.

**Lưu ý về ranh giới phiên**: từ Giai đoạn 12 trở đi là **1 hoặc nhiều phiên Claude Code khác chạy
tiếp nối** (không phải phiên đã viết Giai đoạn 1-11) — đúng theo cảnh báo ở mục 1 của `HANDOFF.md`
về việc từng có nhiều phiên chạy song song trong cùng thư mục. Toàn bộ chi tiết dưới đây tổng hợp lại
từ commit log + `HANDOFF.md` (đã được các phiên đó cập nhật 3 lần trong ngày 28/09), không phải quan
sát trực tiếp.

## Giai đoạn 12 — Hoàn tất Website Report redesign mục A-C (26/09/2026 tối)

- `3b9757a` Redesign tab "Tổng hợp" Website Report: KPI tiles, narrative "Nhận định nhanh", biểu đồ
  Sessions theo kênh (Organic/Paid/Direct/Social/Referral/Khác).
- `0209f67` Thêm "Top pages" (GA4 theo pageview) + "Organic pages" (Search Console theo click),
  nhóm theo loại trang đúng quy tắc đã chốt ở Giai đoạn 11 (dựa 250 URL thật karofi.com).
- `a5310c7` Thêm card "Từ khoá tiềm năng SEO" (striking-distance) + tách Brand/Non-brand.

**Trạng thái**: ✅ Mục A, B, C của đặc tả Website Report redesign — hoàn tất, đúng theo demo đã
duyệt ở Giai đoạn 11.

## Giai đoạn 13 — Tinh chỉnh Website Report + Social Report, thêm mục D (28/09/2026 sáng)

- `935263b` Thêm nhận định nhanh cho từng card mục B/C; thêm mục D (GA4 Country/City, GA4 Device,
  Search Console Device breakdown) — đã duyệt ở Giai đoạn 11 nhưng ưu tiên thấp hơn, làm ở đây.
- `98e0d30` Chuyển nhận định của mục B/C lên đầu card (thay vì chân bảng); ghi chú giải thích các
  kênh GA4 gốc nằm trong nhóm "Khác" (tỉ trọng lớn trong dữ liệu thật); phân trang bảng từ khoá
  (mặc định 15/trang, chọn được 15/50/100/200).
- `d91fab8` Thu gọn thẻ bài viết Social Report (ảnh 16:9 thay vì gần vuông, ẩn cột Ads khi bài
  không chạy ads, lưới tới 6 cột màn hình rộng).

**Trạng thái**: ✅ Website Report redesign — **toàn bộ mục A-D đã hoàn tất**, không còn gì tồn đọng
từ đặc tả Giai đoạn 11. Social Report — tinh chỉnh thêm cho gọn, không phải bug.

## Giai đoạn 14 — OAuth cho Facebook/TikTok Ads, thay thế dán token thủ công (28/09/2026)

- `336ac2b` Đổi luồng kết nối Facebook Ads + TikTok Ads từ dán access token tay sang OAuth + màn
  hình chọn tài khoản (1 lần đăng nhập Facebook lấy được cả Page lẫn Ad Account để tick chọn).

**Trạng thái**: ✅ Facebook — đã cấu hình `FB_APP_ID`/`FB_APP_SECRET`/`FACEBOOK_REDIRECT_URI` đầy
đủ trên `.env.local` **và** Vercel production, chạy được thật. ⏸️ TikTok Ads OAuth — code xong
nhưng **chưa cấu hình biến môi trường**, user chủ động yêu cầu "hold" chờ TikTok duyệt app Marketing
API — đừng tự ý cấu hình tiếp cho tới khi user báo đã duyệt.

## Giai đoạn 15 — Quản lý công việc nâng cao cho Campaign Marketing (28/09/2026)

- `b6bc802` Thêm `work_stream`/`estimated_hours` cho Task; bảng `task_time_logs` (log giờ thủ
  công); tab "Theo nhân viên" (workload dashboard); Task lặp lại (`recurrence`, tự sinh occurrence
  qua cron hàng ngày, giới hạn tạo trước 14 ngày); liên kết Task ↔ số liệu report thật (nút "+ Task"
  từ bảng từ khoá SEO); Content Brief cho Task loại SEO.

**Trạng thái**: ✅ Code + migration Supabase production xong, đã test logic (không qua UI, dùng
script trực tiếp trên `db_store.json`). ⚠️ **Vẫn 0 campaign/task thật nào trong production** — như
các giai đoạn trước, tính năng sẵn sàng nhưng chưa có dữ liệu thật để vận hành.

## Giai đoạn 16 — 4 tool SEO/Ads mới: Keyword Rank Tracker, Brand SOV, Backlink Tracker, Social Outreach (28/09/2026)

- `5075a9d` Theo yêu cầu "phân tích công việc SEO-Ads để xây tool tích hợp":
  - **Keyword Rank Tracker + Brand SOV** (tab mới "SEO Tools") — dùng serper.dev (API **trả phí**
    theo credit, khác mọi tích hợp khác trong app). Seed sẵn 22 từ khoá đã chốt với user (8 dùng
    chung Karofi+Livotec, 6 riêng Karofi, 8 riêng Livotec — domain Livotec xác nhận là
    `livotec.com`). Cron riêng thứ Hai hàng tuần, ~27 credit/tuần (đủ dùng ~21 tháng trên 2500
    credit free). `SERPER_API_KEY` đã set cả local + Vercel.
  - **Backlink Tracker** (miễn phí) — cron hàng ngày tự kiểm tra backlink còn tồn tại không.
  - **Social Outreach (KOC/KOL)** — nhập tay số liệu (không có API public đáng tin), roster tái
    dùng được, nút "Outreach" trên mỗi campaign, tab tổng hợp riêng trong Campaign Marketing —
    **chạy song song với** scorecard "KOC/KOL Air Bài Tuần" cũ trên Dashboard chính, chưa nối vào
    nhau (user đồng ý để 2 nguồn tồn tại song song trước).
  - Toàn bộ migration Supabase (cột mới trên `tasks`, bảng `task_time_logs`,
    `keyword_rank_targets`/`keyword_rank_history`/`sov_mentions_history`, `backlinks`,
    `koc_kol_accounts`/`outreach_posts`/`outreach_post_metrics`) đã chạy trên production.

**Trạng thái**: ✅ Backlink Tracker — đã test thật (fetch thật 1 backlink trỏ wikipedia.org). ⚠️
Keyword Rank Tracker/SOV — code + migrate + key đã sẵn sàng, nhưng **chưa từng gọi serper.dev thật
lần nào** (cố tình tránh tốn credit lúc code) — cần user tự bấm "Đồng bộ ngay" 1 lần để xác nhận. ✅
Social Outreach — code xong theo đúng 7 câu trả lời user đã chốt trước đó.

## Giai đoạn 17 — Hoàn tất 3/5 tool phân tích từ file Excel SEO/Ads Automation (28/09/2026)

Tiếp nối việc phân tích file `Phan_Tich_Cong_Viec_SEO_Ads_Automation.xlsx` user cung cấp — user đã
chốt làm cả 5 mục theo thứ tự, 3 mục đầu hoàn tất trong giai đoạn này:

- `9c2726a` **Ngân sách & Pacing (Ads)** — so `ads_performance.spend` với `budget`/thời gian đã qua
  của campaign, cảnh báo Telegram khi lệch >15%. **Technical SEO Monitor** — crawl sitemap.xml +
  PageSpeed Insights + Search Console Sitemaps API, cron riêng thứ Hai 04:00. **On-page
  Optimization Scanner** — trích xuất SEO on-page (title/meta/H1/alt/link/số từ) + Gemini gợi ý sửa,
  chỉ chạy tay, giới hạn domain đã kết nối Website Report (chống SSRF).
- `3504253`, `d7777db` Cập nhật `HANDOFF.md` theo kết quả test/deploy 3 tool trên.

**Phát hiện thật từ lúc test (không phải giả định)**:
- ⚠️ `karofi.com/sitemap1.xml` đang lỗi HTTP 500 thật trên production website — nên báo team dev
  website, không phải lỗi của app này.
- ⚠️ Quota PageSpeed Insights không-key đã hết toàn cục (429 ngay lập tức) — `PAGESPEED_API_KEY` là
  **bắt buộc**. Lần đầu set trên Vercel không thành công (verify qua API thấy biến chưa tồn tại) —
  **đã set lại thành công qua Composio** (`VERCEL_ADD_ENVIRONMENT_VARIABLE`), verify số env var tăng
  26→27, redeploy commit `3504253` — có hiệu lực từ đây.
- Sửa 1 bug thật: lỗi ở bước Search Console Sitemaps API từng làm mất luôn kết quả crawl +
  PageSpeed đã chạy thành công trước đó — đã tách try/catch riêng từng bước.
- Xác nhận lại với user (lo lắng hợp lý): app chỉ có quyền **đọc** GA4/Search Console, không thể
  sửa/xoá — cả ở tầng scope OAuth (`*.readonly`) lẫn code (không có route ghi nào).
- **Đã giải quyết vấn đề tồn đọng nhiều phiên**: cách đăng nhập UI ở local dev khi không có mật
  khẩu admin thật — thêm 1 user với username MỚI (khác 5 tài khoản mặc định) thẳng vào
  `db_store.json`, không bị `reconcileUsers()` ghi đè. Áp dụng cho cả việc giả lập 1 kết nối Website
  Report để test (điền `gsc_site_url` thật, token giả) — luôn backup/khôi phục `db_store.json` sau
  khi test xong.

**Trạng thái**: ✅ Cả 3 tool — code + migration Supabase production + redeploy xong. Budget Pacing:
⚠️ 0 campaign thật nào có `budget` set. Technical SEO Monitor: ✅ đã test thật qua UI, bắt đúng lỗi
sitemap thật của site. On-page Scanner: ✅ đã test thật phần trích xuất; phần gợi ý sửa bằng Gemini
chưa verify được ở local (thiếu `GEMINI_API_KEY` local, chỉ có ở Vercel) nhưng tái dùng nguyên logic
`/api/analyze` đã chạy thật trước đó. 🟡 **Còn treo 2/5 mục theo thứ tự user đã chốt**: #3 Creative
Frequency Monitor (dữ liệu `ads_performance.frequency` đã có sẵn, chỉ cần viết logic cảnh báo), #5
AI Content Planning Assistant (dùng Gemini + serper.dev "related searches"/"people also ask") — CHƯA
BẮT ĐẦU, xem `HANDOFF.md` mục "Đang dở" để code tiếp.

---

## Giai đoạn 18 — Campaign Calendar drilldown + sự cố Supabase JWT trên production (29/09 – 01/10/2026)

**Tính năng mới — Campaign Calendar "All Campaigns" drilldown** (user yêu cầu xem task/chi phí
quảng cáo/organic post ngay trong bảng, giống kiểu dropdown cây của Digital Ads Report):

- `03d27ce` Click vào 1 campaign (chevron xoay, cùng kiểu tương tác với cây Campaign→Ad set→Ad của
  Digital Ads Report) mở ra 3 tab:
  - **Task** — danh sách task thuộc campaign, kèm trạng thái/ưu tiên/người phụ trách/hạn (lấy từ
    danh sách task đã tải sẵn ở client, không gọi API riêng).
  - **Chi phí quảng cáo** — **chính xác theo từng campaign** (user chọn phương án này thay vì ước
    tính) qua bảng mới `campaign_ads_links`: Editor "gắn" tên campaign quảng cáo thật
    (Facebook/Google/TikTok Ads) vào Calendar campaign, có autocomplete gợi ý tên đã đồng bộ để
    tránh gõ sai. Khác hẳn cách tính gộp theo brand+kênh+ngày của Budget Pacing (Giai đoạn 17) —
    đây là liên kết tường minh do người dùng tự gắn, không phải suy đoán.
  - **Organic** — gộp cả 2 loại (user chọn "cả 2"): panel Outreach (KOC/KOL, liên kết thật qua
    `campaign_id`, dùng lại `OutreachPanel` có sẵn) + bài viết Fanpage thương hiệu trong khoảng ngày
    campaign (ước tính theo brand + ngày, không có liên kết thật — có ghi chú rõ trong UI).
- Migration bảng `campaign_ads_links` đã chạy trên Supabase production.
- **Đã test thật qua UI** (không chỉ `tsc`/build): dùng kỹ thuật "thêm user mới vào `db_store.json`"
  từ Giai đoạn 17 để đăng nhập local, seed 1 campaign + task + `ads_performance` + link giả, xác
  nhận cả 3 tab hiển thị đúng — tab Organic hiện đúng 25 bài Fanpage Karofi **thật** đã đồng bộ sẵn
  trong khoảng ngày test. Đã xoá sạch dữ liệu test, khôi phục `db_store.json` sau khi xong.

**Sự cố thật trên production — lỗi "JWT issued at future" (Asset Library) + 504 (tab SEO Tools)**:

- User báo lỗi `Lỗi đọc Asset Library: JWT issued at future` ở Campaign Marketing, sau đó thêm lỗi
  `API returned invalid JSON/HTML response (status: 504)` ở Website Report → SEO Tools.
- Chẩn đoán trực tiếp qua Supabase (không qua key của app): project hoàn toàn khoẻ (DB đọc/ghi bình
  thường, không tạm dừng, không read-only, đồng hồ server đúng giờ thực). Lấy đúng giá trị
  `service_role` key **hiện tại** từ Supabase, giải mã JWT thấy `iat` = 23/07/2026 (quá khứ, hợp
  lệ) — tức bản thân key không có vấn đề, nên kết luận: giá trị `SUPABASE_URL`/
  `SUPABASE_SERVICE_ROLE_KEY` đang lưu trên Vercel bị sai lệch so với giá trị thật.
- **Đã sửa**: ghi đè lại đúng 2 biến này trên Vercel (production) bằng giá trị xác thực lấy trực
  tiếp từ Supabase qua Composio, redeploy (`dpl_6B2hiWPVX2pKpw5SDCC7cesr8NyJ`). Không có commit code
  nào — thuần chỉnh sửa cấu hình Vercel.
- User test lại On-page Optimization Scanner sau fix, gặp lỗi Gemini `503 UNAVAILABLE` ("model
  đang quá tải") — xác nhận đây là lỗi tạm thời từ phía Google (server Gemini quá tải), KHÔNG phải
  lỗi app: request đã đi trọn pipeline (qua auth → kiểm tra domain qua Supabase → tải HTML thật →
  trích tín hiệu → gọi Gemini) mới dừng ở bước cuối, nghĩa là fix JWT ở trên đã có hiệu lực. Đồng
  thời xác nhận luôn tên model `"gemini-3.5-flash"` (từng bị nghi ngờ "tên lạ" ở các giai đoạn
  trước) **là tên hợp lệ** — model sai tên sẽ trả lỗi 404 "not found", không phải 503 "quá tải".

**Trạng thái**: ✅ Campaign Calendar drilldown — code + migration + test thật xong. ✅ Sự cố Supabase
JWT — đã xác định nguyên nhân (biến môi trường Vercel sai lệch, không phải Supabase hay code có
lỗi) và sửa xong, đã redeploy. 🟡 Chưa có xác nhận cuối cùng từ user rằng cả Asset Library lẫn tab
SEO Tools đã hết lỗi hẳn trên production sau redeploy — phiên sau nên hỏi lại nếu chưa thấy user
xác nhận.

---

## Tổng hợp trạng thái theo tính năng (tính đến hết 01/10/2026)

| Tính năng | Trạng thái |
|---|---|
| Báo cáo tuần (dashboard chính) | ✅ Ổn định |
| Facebook Page Insights + Ads (OAuth) | ✅ Ổn định, cron tự động hàng ngày, kết nối qua OAuth |
| TikTok organic (Social Report) | ✅ Ổn định · ⚠️ TikTok Ads API thật đang chờ duyệt, OAuth code xong nhưng chưa cấu hình (hold theo yêu cầu user) |
| YouTube organic | ✅ Chạy được · ⚠️ Token hết hạn mỗi 7 ngày (OAuth consent screen ở chế độ Testing) |
| Digital Ads Report (drilldown + Top Ads) | ✅ Ổn định |
| Social Report (card redesign, đã thu gọn) | ✅ Ổn định |
| Website Report (GA4 + Search Console) | ✅ Redesign mục A-D hoàn tất — KPI/nhận định/kênh/Top pages/Organic pages/từ khoá SEO |
| Campaign Calendar & Task (+ quản lý công việc nâng cao + drilldown task/ads/organic) | ✅ Code + schema xong, đã test thật qua UI (Giai đoạn 18) · 🟡 Chưa dùng thật trên production |
| SEO Tools — Keyword Rank Tracker + Brand SOV | ✅ Code + migrate xong · ⚠️ Chưa gọi serper.dev thật lần nào |
| SEO Tools — Backlink Tracker | ✅ Ổn định, đã test thật |
| SEO Tools — Technical SEO Monitor | ✅ Ổn định, đã phát hiện lỗi sitemap thật của site |
| SEO Tools — On-page Optimization Scanner | ✅ Đã test thật trên production (trích xuất + gọi Gemini, model name hợp lệ) · ⚠️ Gemini thỉnh thoảng 503 "quá tải" (lỗi tạm thời phía Google) |
| SEO Tools — Creative Frequency Monitor (Ads) | 🟡 Chưa bắt đầu, dữ liệu đã sẵn sàng |
| SEO Tools — AI Content Planning Assistant | 🟡 Chưa bắt đầu |
| Budget & Pacing alerts (Ads) | ✅ Code xong · ⚠️ 0 campaign thật có budget set |
| Social Outreach (KOC/KOL) | ✅ Code xong, chạy song song với scorecard cũ · chưa nối vào nhau |
| Google Ads API (đọc dữ liệu) | 🟡 Đang chờ Google duyệt hồ sơ |
| Backup Google Drive + cảnh báo Telegram | ✅ Ổn định |
| ads_manager (viết campaign quảng cáo thật) | ⏸️ Tạm dừng, chưa quyết hướng tích hợp |
| Brand Health/SOV qua serper.dev (mockup cũ) | ❌ Đã thay bằng SEO Tools' Brand SOV thật (Giai đoạn 16) |
