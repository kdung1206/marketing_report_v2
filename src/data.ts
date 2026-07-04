export interface DigitalMarketingRow {
  ngày_báo_cáo: string;
  phân_loại_thời_gian: string;
  brand: string;
  nhóm_báo_cáo: string;
  hạng_mục: string;
  ngành_hàng: string;
  kênh_channel: string;
  chỉ_số_metric: string;
  mục_tiêu_target: number | null;
  thực_tế_actual: number | null;
  target_tháng: number | null;
  tích_lũy_tháng: number | null;
}

export interface KolKocRow {
  ngày_báo_cáo: string;
  giai_đoạn: string;
  hạng_mục: string;
  ngành_hàng: string;
  kênh_channel: string;
  chỉ_số_metric: string;
  kpi_toàn_chiến_dịch: number | null;
  thực_tế_trong_tuần: number | null;
  tích_lũy_chiến_dịch: number | null;
}

export interface BtlTradeRow {
  ngày_báo_cáo: string;
  brand: string;
  hạng_mục_lớn: string;
  chi_tiết_hạng_mục: string;
  phân_loại: string | null;
  tần_suất: string;
  đơn_vị_tính: string;
  thực_hiện_tháng_5: number | null;
  kế_hoạch_tháng_6: number | null;
  tích_lũy_tháng: number | null;
}

export interface MonthlyOohPrRow {
  tháng_báo_cáo: string;
  hạng_mục: string;
  brand: string;
  ngành_hàng: string;
  kênh_channel: string;
  chỉ_số_metric: string;
  mục_tiêu_target: number | null;
  thực_tế_actual: number | null;
}

export interface MarketingReportData {
  digital_marketing: DigitalMarketingRow[];
  kol_koc: KolKocRow[];
  btl_trade: BtlTradeRow[];
  monthly_ooh_pr: MonthlyOohPrRow[];
}

export interface CategoryComments {
  sov: string;
  kol_koc: string;
  tvc: string;
  paid_ads: string;
  seo: string;
  btl_trade: string;
}

export interface BrandComments {
  evaluation: string;
  proposals: string;
  categories: CategoryComments;
}

export const INITIAL_MARKETING_DATA: MarketingReportData = {
  "digital_marketing": [
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Amount spent (VNĐ)",
      "mục_tiêu_target": null,
      "thực_tế_actual": null,
      "target_tháng": 110000000,
      "tích_lũy_tháng": 72170246
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Impressions",
      "mục_tiêu_target": null,
      "thực_tế_actual": null,
      "target_tháng": 7333333.333333333,
      "tích_lũy_tháng": 5427273
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Reach",
      "mục_tiêu_target": null,
      "thực_tế_actual": null,
      "target_tháng": 2095238.0952380951,
      "tích_lũy_tháng": 2383099
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "CPM",
      "mục_tiêu_target": null,
      "thực_tế_actual": null,
      "target_tháng": 15,
      "tích_lũy_tháng": 13.298
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Frequency",
      "mục_tiêu_target": null,
      "thực_tế_actual": null,
      "target_tháng": 3.5,
      "tích_lũy_tháng": 2.28
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "TikTok (KOC/KOL)",
      "chỉ_số_metric": "Amount spent (VNĐ)",
      "mục_tiêu_target": 74000000,
      "thực_tế_actual": 65079010,
      "target_tháng": 150000000,
      "tích_lũy_tháng": 65079010
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "TikTok (KOC/KOL)",
      "chỉ_số_metric": "Impressions",
      "mục_tiêu_target": 5285714.285714285,
      "thực_tế_actual": 7799785,
      "target_tháng": 10714285.714285716,
      "tích_lũy_tháng": 7799785
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "TikTok (KOC/KOL)",
      "chỉ_số_metric": "Reach",
      "mục_tiêu_target": 2114285.714285714,
      "thực_tế_actual": 3251131,
      "target_tháng": 3061224.4897959186,
      "tích_lũy_tháng": 3251131
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "TikTok (KOC/KOL)",
      "chỉ_số_metric": "CPM",
      "mục_tiêu_target": 14,
      "thực_tế_actual": 8.344,
      "target_tháng": 14,
      "tích_lũy_tháng": 8.344
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "TikTok (KOC/KOL)",
      "chỉ_số_metric": "Frequency",
      "mục_tiêu_target": 2.5,
      "thực_tế_actual": 2.4,
      "target_tháng": 3.5,
      "tích_lũy_tháng": 2.4
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Youtube",
      "chỉ_số_metric": "Amount spent (VNĐ)",
      "mục_tiêu_target": 25000000,
      "thực_tế_actual": 24981308,
      "target_tháng": 90000000,
      "tích_lũy_tháng": 64576492
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Youtube",
      "chỉ_số_metric": "Impressions",
      "mục_tiêu_target": 1250000,
      "thực_tế_actual": 1771559,
      "target_tháng": 4500000,
      "tích_lũy_tháng": 4555773
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Youtube",
      "chỉ_số_metric": "Reach",
      "mục_tiêu_target": 625000,
      "thực_tế_actual": 984199,
      "target_tháng": 2250000,
      "tích_lũy_tháng": 2847358
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Youtube",
      "chỉ_số_metric": "CPM",
      "mục_tiêu_target": 20,
      "thực_tế_actual": 14.1,
      "target_tháng": 20,
      "tích_lũy_tháng": 14.2
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Youtube",
      "chỉ_số_metric": "Frequency",
      "mục_tiêu_target": 2,
      "thực_tế_actual": 1.8,
      "target_tháng": 2,
      "tích_lũy_tháng": 1.6
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Amount spent (VNĐ)",
      "mục_tiêu_target": 47000000,
      "thực_tế_actual": 46889687,
      "target_tháng": 220000000,
      "tích_lũy_tháng": 177479983
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Impressions",
      "mục_tiêu_target": 3916666.6666666665,
      "thực_tế_actual": 4267063,
      "target_tháng": 18333333.33333333,
      "tích_lũy_tháng": 16147371
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Reach",
      "mục_tiêu_target": 1958333.3333333333,
      "thực_tế_actual": 2530774,
      "target_tháng": 6111111.111111111,
      "tích_lũy_tháng": 6248194
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "CPM",
      "mục_tiêu_target": 12,
      "thực_tế_actual": 10.99,
      "target_tháng": 12,
      "tích_lũy_tháng": 11
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Frequency",
      "mục_tiêu_target": 2,
      "thực_tế_actual": 1.7,
      "target_tháng": 3,
      "tích_lũy_tháng": 2.6
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "Amount spent (VNĐ)",
      "mục_tiêu_target": 120000000,
      "thực_tế_actual": 116870149,
      "target_tháng": 505000000,
      "tích_lũy_tháng": 390701037
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "Impressions",
      "mục_tiêu_target": 12000000,
      "thực_tế_actual": 12723001,
      "target_tháng": 42083333.333333336,
      "tích_lũy_tháng": 41893833
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "Reach",
      "mục_tiêu_target": 4000000,
      "thực_tế_actual": 4642626,
      "target_tháng": 8416666.666666668,
      "tích_lũy_tháng": 8629140
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "CPM",
      "mục_tiêu_target": 10,
      "thực_tế_actual": 9.19,
      "target_tháng": 12,
      "tích_lũy_tháng": 9.3
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "Frequency",
      "mục_tiêu_target": 3,
      "thực_tế_actual": 2.7,
      "target_tháng": 5,
      "tích_lũy_tháng": 4.9
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 2",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Amount spent (VNĐ)",
      "mục_tiêu_target": 20000000,
      "thực_tế_actual": 19099722,
      "target_tháng": 90000000,
      "tích_lũy_tháng": 70519653
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 2",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Impressions",
      "mục_tiêu_target": 1333333.3333333333,
      "thực_tế_actual": 1337057,
      "target_tháng": 6923076.923076923,
      "tích_lũy_tháng": 5972230
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 2",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Reach",
      "mục_tiêu_target": 666666.6666666666,
      "thực_tế_actual": 774701,
      "target_tháng": 2307692.3076923075,
      "tích_lũy_tháng": 2176247
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 2",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "CPM",
      "mục_tiêu_target": 15,
      "thực_tế_actual": 14.3,
      "target_tháng": 13,
      "tích_lũy_tháng": 11.8
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 2",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Frequency",
      "mục_tiêu_target": 2,
      "thực_tế_actual": 1.7,
      "target_tháng": 3,
      "tích_lũy_tháng": 2.7
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 2",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "Amount spent (VNĐ)",
      "mục_tiêu_target": 85000000,
      "thực_tế_actual": 82109829,
      "target_tháng": 350000000,
      "tích_lũy_tháng": 277584787
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 2",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "Impressions",
      "mục_tiêu_target": 6538461.538461538,
      "thực_tế_actual": 6971565,
      "target_tháng": 26923076.923076924,
      "tích_lũy_tháng": 24159025
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 2",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "Reach",
      "mục_tiêu_target": 2972027.9720279714,
      "thực_tế_actual": 3393440,
      "target_tháng": 6730769.230769231,
      "tích_lũy_tháng": 6471386
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 2",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "CPM",
      "mục_tiêu_target": 13,
      "thực_tế_actual": 11.8,
      "target_tháng": 13,
      "tích_lũy_tháng": 11.5
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 2",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "Frequency",
      "mục_tiêu_target": 2.2,
      "thực_tế_actual": 2.1,
      "target_tháng": 4,
      "tích_lũy_tháng": 3.7
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Amount spent (VNĐ)",
      "mục_tiêu_target": 48000000,
      "thực_tế_actual": 47528858,
      "target_tháng": 185000000,
      "tích_lũy_tháng": 150426798
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Impressions",
      "mục_tiêu_target": 3428571.4285714286,
      "thực_tế_actual": 3535324,
      "target_tháng": 14230769.23076923,
      "tích_lũy_tháng": 12608048
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Reach",
      "mục_tiêu_target": 1714285.7142857143,
      "thực_tế_actual": 1932859,
      "target_tháng": 4743589.743589743,
      "tích_lũy_tháng": 4352332
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "CPM",
      "mục_tiêu_target": 14,
      "thực_tế_actual": 13.4,
      "target_tháng": 13,
      "tích_lũy_tháng": 11.9
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Frequency",
      "mục_tiêu_target": 2,
      "thực_tế_actual": 1.8,
      "target_tháng": 3,
      "tích_lũy_tháng": 2.9
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "Amount spent (VNĐ)",
      "mục_tiêu_target": 95000000,
      "thực_tế_actual": 95171325,
      "target_tháng": 470000000,
      "tích_lũy_tháng": 370883857
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "Impressions",
      "mục_tiêu_target": 6785714.285714285,
      "thực_tế_actual": 7450291,
      "target_tháng": 36153846.15384615,
      "tích_lũy_tháng": 30187692
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "Reach",
      "mục_tiêu_target": 3392857.1428571427,
      "thực_tế_actual": 3813651,
      "target_tháng": 9038461.538461538,
      "tích_lũy_tháng": 8288765
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "CPM",
      "mục_tiêu_target": 14,
      "thực_tế_actual": 12.8,
      "target_tháng": 13,
      "tích_lũy_tháng": 12.3
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Tiktok",
      "chỉ_số_metric": "Frequency",
      "mục_tiêu_target": 2,
      "thực_tế_actual": 2,
      "target_tháng": 4,
      "tích_lũy_tháng": 3.6
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Youtube",
      "chỉ_số_metric": "Amount spent (VNĐ)",
      "mục_tiêu_target": 20000000,
      "thực_tế_actual": 19905107,
      "target_tháng": 90000000,
      "tích_lũy_tháng": 71448844
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Youtube",
      "chỉ_số_metric": "Impressions",
      "mục_tiêu_target": 1333333.3333333333,
      "thực_tế_actual": 1361407,
      "target_tháng": 4500000,
      "tích_lũy_tháng": 4980569
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Youtube",
      "chỉ_số_metric": "Reach",
      "mục_tiêu_target": 666666.6666666666,
      "thực_tế_actual": 716530,
      "target_tháng": 1800000,
      "tích_lũy_tháng": 2165465
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Youtube",
      "chỉ_số_metric": "CPM",
      "mục_tiêu_target": 15,
      "thực_tế_actual": 14.6,
      "target_tháng": 20,
      "tích_lũy_tháng": 14.3
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Youtube",
      "chỉ_số_metric": "Frequency",
      "mục_tiêu_target": 2,
      "thực_tế_actual": 1.9,
      "target_tháng": 2.5,
      "tích_lũy_tháng": 2.3
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "MTD (Tháng đến nay)",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "SEO Website",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Website",
      "chỉ_số_metric": "Traffic Organic",
      "mục_tiêu_target": 4860,
      "thực_tế_actual": 3246,
      "target_tháng": 15000,
      "tích_lũy_tháng": 10814
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "SEO Website",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Website",
      "chỉ_số_metric": "Impressions Organic",
      "mục_tiêu_target": 158000,
      "thực_tế_actual": 148962,
      "target_tháng": 525000,
      "tích_lũy_tháng": 459648
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "Clip TVC",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "TVC 60s, 30s, 15s,...",
      "chỉ_số_metric": "Số lượng video",
      "mục_tiêu_target": 0,
      "thực_tế_actual": 0,
      "target_tháng": null,
      "tích_lũy_tháng": 2
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "Clip TVC",
      "ngành_hàng": "Ngành 2",
      "kênh_channel": "TVC 60s, 30s, 15s,...",
      "chỉ_số_metric": "Số lượng video",
      "mục_tiêu_target": 0,
      "thực_tế_actual": 0,
      "target_tháng": null,
      "tích_lũy_tháng": 1
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "Clip TVC",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "TVC 60s, 30s, 15s,...",
      "chỉ_số_metric": "Số lượng video",
      "mục_tiêu_target": 1,
      "thực_tế_actual": 1,
      "target_tháng": null,
      "tích_lũy_tháng": 1
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "Social Media",
      "ngành_hàng": "All ngành",
      "kênh_channel": "Facebook\n(Always on, New product lauching, Reup)",
      "chỉ_số_metric": "Số lượng bài viết\n(single post, album post, motion, video, reels...)",
      "mục_tiêu_target": 4,
      "thực_tế_actual": 5,
      "target_tháng": null,
      "tích_lũy_tháng": 7
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "Social Media",
      "ngành_hàng": "All ngành",
      "kênh_channel": "Instagram",
      "chỉ_số_metric": "Số lượng bài viết",
      "mục_tiêu_target": 3,
      "thực_tế_actual": 3,
      "target_tháng": null,
      "tích_lũy_tháng": 11
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "SEO Content",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Website",
      "chỉ_số_metric": "Số lượng bài viết",
      "mục_tiêu_target": 2,
      "thực_tế_actual": 2,
      "target_tháng": null,
      "tích_lũy_tháng": 8
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "SEO Content",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Website",
      "chỉ_số_metric": "Số lượng bài viết",
      "mục_tiêu_target": 2,
      "thực_tế_actual": 2,
      "target_tháng": null,
      "tích_lũy_tháng": 8
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "Product Page",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Website",
      "chỉ_số_metric": "Số lượng trang sản phẩm",
      "mục_tiêu_target": 0,
      "thực_tế_actual": 0,
      "target_tháng": null,
      "tích_lũy_tháng": 8
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "Product Page",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Website",
      "chỉ_số_metric": "Số lượng trang sản phẩm",
      "mục_tiêu_target": 2,
      "thực_tế_actual": 2,
      "target_tháng": null,
      "tích_lũy_tháng": 5
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Livotec",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "Video giới thiệu sản phẩm",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Youtube & Website",
      "chỉ_số_metric": "Số lượng video",
      "mục_tiêu_target": 0,
      "thực_tế_actual": 0,
      "target_tháng": null,
      "tích_lũy_tháng": 2
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Brand",
      "hạng_mục": "Social Listening",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Karofi",
      "chỉ_số_metric": "SOV (Thị phần thảo luận theo brand)",
      "mục_tiêu_target": null,
      "thực_tế_actual": 0.359,
      "target_tháng": null,
      "tích_lũy_tháng": null
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Brand",
      "hạng_mục": "Social Listening",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Kang",
      "chỉ_số_metric": "SOV (Thị phần thảo luận theo brand)",
      "mục_tiêu_target": null,
      "thực_tế_actual": 0.409,
      "target_tháng": null,
      "tích_lũy_tháng": null
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Brand",
      "hạng_mục": "Social Listening",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Livotec",
      "chỉ_số_metric": "SOV (Thị phần thảo luận theo brand)",
      "mục_tiêu_target": null,
      "thực_tế_actual": 0.028,
      "target_tháng": null,
      "tích_lũy_tháng": null
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Brand",
      "hạng_mục": "Social Listening",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "sunhouse",
      "chỉ_số_metric": "SOV (Thị phần thảo luận theo brand)",
      "mục_tiêu_target": null,
      "thực_tế_actual": 0.144,
      "target_tháng": null,
      "tích_lũy_tháng": null
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Brand",
      "hạng_mục": "Social Listening",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Hòa phát",
      "chỉ_số_metric": "SOV (Thị phần thảo luận theo brand)",
      "mục_tiêu_target": null,
      "thực_tế_actual": 0.031,
      "target_tháng": null,
      "tích_lũy_tháng": null
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Brand",
      "hạng_mục": "Social Listening",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Khác",
      "chỉ_số_metric": "SOV (Thị phần thảo luận theo brand)",
      "mục_tiêu_target": null,
      "thực_tế_actual": 0.028999999999999915,
      "target_tháng": null,
      "tích_lũy_tháng": null
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Amount spent (VNĐ)",
      "mục_tiêu_target": 78000000,
      "thực_tế_actual": 75065269,
      "target_tháng": 271329254,
      "tích_lũy_tháng": 390000000
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Impressions",
      "mục_tiêu_target": 7800000,
      "thực_tế_actual": 8091316,
      "target_tháng": 28400558,
      "tích_lũy_tháng": 38235294
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Reach",
      "mục_tiêu_target": 3250000,
      "thực_tế_actual": 3576289,
      "target_tháng": 7546305,
      "tích_lũy_tháng": 9558824
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "CPM",
      "mục_tiêu_target": 10,
      "thực_tế_actual": 9.277263303027592,
      "target_tháng": 9.553659262610262,
      "tích_lũy_tháng": 10.2
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "Paid Ads",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Facebook",
      "chỉ_số_metric": "Frequency",
      "mục_tiêu_target": 2.4,
      "thực_tế_actual": 2.262489412908185,
      "target_tháng": 3.7635051856504607,
      "tích_lũy_tháng": 4
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "SEO Website",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Website",
      "chỉ_số_metric": "Traffic Organic",
      "mục_tiêu_target": 18000,
      "thực_tế_actual": 18852,
      "target_tháng": 65917,
      "tích_lũy_tháng": 80000
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Digital",
      "hạng_mục": "SEO Website",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Website",
      "chỉ_số_metric": "Impressions Organic",
      "mục_tiêu_target": 500000,
      "thực_tế_actual": 548338,
      "target_tháng": 2034577,
      "tích_lũy_tháng": 2500000
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "Social Media",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Facebook\n(Always on, New product lauching, Reup)",
      "chỉ_số_metric": "Số lượng bài viết\n(single post, album post, motion, video, reels...)",
      "mục_tiêu_target": 4,
      "thực_tế_actual": 4,
      "target_tháng": null,
      "tích_lũy_tháng": null
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "SEO Content",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Website",
      "chỉ_số_metric": "Số lượng bài viết",
      "mục_tiêu_target": 1,
      "thực_tế_actual": 1,
      "target_tháng": null,
      "tích_lũy_tháng": null
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "Product Page",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Website",
      "chỉ_số_metric": "Số lượng trang sản phẩm",
      "mục_tiêu_target": 2,
      "thực_tế_actual": 2,
      "target_tháng": null,
      "tích_lũy_tháng": null
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "Video giới thiệu sản phẩm",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Youtube & Website",
      "chỉ_số_metric": "Số lượng video",
      "mục_tiêu_target": 3,
      "thực_tế_actual": 3,
      "target_tháng": null,
      "tích_lũy_tháng": null
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "OOH/LED",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Sản xuất ấn phẩm",
      "chỉ_số_metric": "Số lượng video/ảnh",
      "mục_tiêu_target": 6,
      "thực_tế_actual": 6,
      "target_tháng": null,
      "tích_lũy_tháng": null
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "phân_loại_thời_gian": "Weekly",
      "brand": "Karofi",
      "nhóm_báo_cáo": "Content",
      "hạng_mục": "Khác",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Chỉnh sửa content mang tính tuyệt đối NHẤT/DUY NHẤT/...",
      "chỉ_số_metric": "Số lượng bài edited",
      "mục_tiêu_target": 12,
      "thực_tế_actual": 12,
      "target_tháng": null,
      "tích_lũy_tháng": null
    }
  ],
  "kol_koc": [
    {
      "ngày_báo_cáo": "2026-06-25",
      "giai_đoạn": "19/6-25/6",
      "hạng_mục": "KOC/KOL",
      "ngành_hàng": "Ngành 1 (Lọc nước)",
      "kênh_channel": "KOC",
      "chỉ_số_metric": "Quantity",
      "kpi_toàn_chiến_dịch": 10,
      "thực_tế_trong_tuần": 0,
      "tích_lũy_chiến_dịch": 4
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "giai_đoạn": "19/6-25/6",
      "hạng_mục": "KOC/KOL",
      "ngành_hàng": "Ngành 2 (Bếp từ+Hút mùi)",
      "kênh_channel": "KOC",
      "chỉ_số_metric": "Quantity",
      "kpi_toàn_chiến_dịch": 3,
      "thực_tế_trong_tuần": 0,
      "tích_lũy_chiến_dịch": 4
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "giai_đoạn": "19/6-25/6",
      "hạng_mục": "KOC/KOL",
      "ngành_hàng": "Ngành 2 (Nồi cơm điện)",
      "kênh_channel": "KOC",
      "chỉ_số_metric": "Quantity",
      "kpi_toàn_chiến_dịch": 3,
      "thực_tế_trong_tuần": 0,
      "tích_lũy_chiến_dịch": 4
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "giai_đoạn": "19/6-25/6",
      "hạng_mục": "KOC/KOL",
      "ngành_hàng": "Ngành 3 (Quạt cây)",
      "kênh_channel": "KOC",
      "chỉ_số_metric": "Quantity",
      "kpi_toàn_chiến_dịch": 4,
      "thực_tế_trong_tuần": 0,
      "tích_lũy_chiến_dịch": 3
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "giai_đoạn": "19/6-25/6",
      "hạng_mục": "KOC/KOL",
      "ngành_hàng": "Ngành 3 (Điều hòa)",
      "kênh_channel": "KOC",
      "chỉ_số_metric": "Quantity",
      "kpi_toàn_chiến_dịch": 10,
      "thực_tế_trong_tuần": 0,
      "tích_lũy_chiến_dịch": 2
    },
    {
      "ngày_báo_cáo": "2026-06-25",
      "giai_đoạn": "19/6-25/6",
      "hạng_mục": "KOC/KOL",
      "ngành_hàng": "Ngành 3 (Điều hòa)",
      "kênh_channel": "KOL",
      "chỉ_số_metric": "Quantity",
      "kpi_toàn_chiến_dịch": 1,
      "thực_tế_trong_tuần": 0,
      "tích_lũy_chiến_dịch": 1
    }
  ],
  "btl_trade": [
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Livotec",
      "hạng_mục_lớn": "POSM",
      "chi_tiết_hạng_mục": "Biển bảng",
      "phân_loại": "GT",
      "tần_suất": "Tháng",
      "đơn_vị_tính": "Cái",
      "thực_hiện_tháng_5": 3,
      "kế_hoạch_tháng_6": 39.0,
      "tích_lũy_tháng": 36
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Livotec",
      "hạng_mục_lớn": "POSM",
      "chi_tiết_hạng_mục": "Quầy kệ",
      "phân_loại": "GT",
      "tần_suất": "Tháng",
      "đơn_vị_tính": "Cái",
      "thực_hiện_tháng_5": 7,
      "kế_hoạch_tháng_6": 47.0,
      "tích_lũy_tháng": 34
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Livotec",
      "hạng_mục_lớn": "POSM",
      "chi_tiết_hạng_mục": "POSM mặt tiền",
      "phân_loại": "Rối hơi",
      "tần_suất": "Tháng",
      "đơn_vị_tính": "Cái",
      "thực_hiện_tháng_5": 138,
      "kế_hoạch_tháng_6": 279.0,
      "tích_lũy_tháng": 178
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Livotec",
      "hạng_mục_lớn": "POSM",
      "chi_tiết_hạng_mục": "POSM mặt tiền",
      "phân_loại": "Ô/dù",
      "tần_suất": "Tháng",
      "đơn_vị_tính": "Cái",
      "thực_hiện_tháng_5": 0,
      "kế_hoạch_tháng_6": 306.0,
      "tích_lũy_tháng": 195
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Livotec",
      "hạng_mục_lớn": "POSM",
      "chi_tiết_hạng_mục": "Mock up",
      "phân_loại": "Điều hòa MT",
      "tần_suất": "Theo dự án",
      "đơn_vị_tính": "Cái",
      "thực_hiện_tháng_5": 239,
      "kế_hoạch_tháng_6": 492.0,
      "tích_lũy_tháng": 492
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Livotec",
      "hạng_mục_lớn": "POSM",
      "chi_tiết_hạng_mục": "Mock up",
      "phân_loại": "Điều hòa GT",
      "tần_suất": "Theo dự án",
      "đơn_vị_tính": "Cái",
      "thực_hiện_tháng_5": 320,
      "kế_hoạch_tháng_6": 1025.0,
      "tích_lũy_tháng": 997
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Livotec",
      "hạng_mục_lớn": "POSM",
      "chi_tiết_hạng_mục": "Tài liệu bán hàng (Catalog, Brochure...)",
      "phân_loại": null,
      "tần_suất": "Theo dự án",
      "đơn_vị_tính": "Bộ",
      "thực_hiện_tháng_5": 0,
      "kế_hoạch_tháng_6": 200.0,
      "tích_lũy_tháng": 200
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Livotec",
      "hạng_mục_lớn": "Event",
      "chi_tiết_hạng_mục": "Activation",
      "phân_loại": null,
      "tần_suất": "Theo dự án",
      "đơn_vị_tính": "Số sự kiện",
      "thực_hiện_tháng_5": 0,
      "kế_hoạch_tháng_6": 0.0,
      "tích_lũy_tháng": 2
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Livotec",
      "hạng_mục_lớn": "Kiểm soát HA điểm bán",
      "chi_tiết_hạng_mục": "Chấm điểm hình ảnh",
      "phân_loại": "MT",
      "tần_suất": "Tháng",
      "đơn_vị_tính": "Điểm bán",
      "thực_hiện_tháng_5": 4,
      "kế_hoạch_tháng_6": 4.0,
      "tích_lũy_tháng": null
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Livotec",
      "hạng_mục_lớn": "Nghiên cứu thị trường",
      "chi_tiết_hạng_mục": "Dự án nghiên cứu",
      "phân_loại": null,
      "tần_suất": "Theo dự án",
      "đơn_vị_tính": "Số dự án",
      "thực_hiện_tháng_5": null,
      "kế_hoạch_tháng_6": null,
      "tích_lũy_tháng": 4
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Karofi",
      "hạng_mục_lớn": "POSM",
      "chi_tiết_hạng_mục": "Biển bảng",
      "phân_loại": "GT",
      "tần_suất": "Tháng",
      "đơn_vị_tính": "Cái",
      "thực_hiện_tháng_5": 40,
      "kế_hoạch_tháng_6": 135.0,
      "tích_lũy_tháng": 92
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Karofi",
      "hạng_mục_lớn": "POSM",
      "chi_tiết_hạng_mục": "Quầy kệ",
      "phân_loại": "GT",
      "tần_suất": "Tháng",
      "đơn_vị_tính": "Cái",
      "thực_hiện_tháng_5": 45,
      "kế_hoạch_tháng_6": 102.0,
      "tích_lũy_tháng": 90
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Karofi",
      "hạng_mục_lớn": "POSM",
      "chi_tiết_hạng_mục": "POSM mặt tiền",
      "phân_loại": "Rối hơi",
      "tần_suất": "Tháng",
      "đơn_vị_tính": "Cái",
      "thực_hiện_tháng_5": 146,
      "kế_hoạch_tháng_6": 1033.0,
      "tích_lũy_tháng": 446
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Karofi",
      "hạng_mục_lớn": "Event",
      "chi_tiết_hạng_mục": "Activation",
      "phân_loại": "MT/GT",
      "tần_suất": "Theo dự án",
      "đơn_vị_tính": "Số sự kiện",
      "thực_hiện_tháng_5": null,
      "kế_hoạch_tháng_6": 2.0,
      "tích_lũy_tháng": 1
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Karofi",
      "hạng_mục_lớn": "Event",
      "chi_tiết_hạng_mục": "Workshop",
      "phân_loại": "Lọc tổng",
      "tần_suất": "Theo dự án",
      "đơn_vị_tính": "Số sự kiện",
      "thực_hiện_tháng_5": null,
      "kế_hoạch_tháng_6": 1.0,
      "tích_lũy_tháng": 1
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Karofi",
      "hạng_mục_lớn": "Kiểm soát HA điểm bán",
      "chi_tiết_hạng_mục": "Kiểm tra thực tế",
      "phân_loại": "MT",
      "tần_suất": "Tháng",
      "đơn_vị_tính": "Điểm bán",
      "thực_hiện_tháng_5": 98,
      "kế_hoạch_tháng_6": 99.0,
      "tích_lũy_tháng": 89
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Karofi",
      "hạng_mục_lớn": "Kiểm soát HA điểm bán",
      "chi_tiết_hạng_mục": "Kiểm tra thực tế",
      "phân_loại": "GT",
      "tần_suất": "Tháng",
      "đơn_vị_tính": "Điểm bán",
      "thực_hiện_tháng_5": 40,
      "kế_hoạch_tháng_6": 97.0,
      "tích_lũy_tháng": 81
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Karofi",
      "hạng_mục_lớn": "Kiểm soát HA điểm bán",
      "chi_tiết_hạng_mục": "Chấm điểm hình ảnh",
      "phân_loại": "MT",
      "tần_suất": "Tháng",
      "đơn_vị_tính": "Điểm bán",
      "thực_hiện_tháng_5": 357,
      "kế_hoạch_tháng_6": 425.0,
      "tích_lũy_tháng": 326
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Karofi",
      "hạng_mục_lớn": "Kiểm soát HA điểm bán",
      "chi_tiết_hạng_mục": "Chấm điểm hình ảnh",
      "phân_loại": "GT",
      "tần_suất": "Tháng",
      "đơn_vị_tính": "Điểm bán",
      "thực_hiện_tháng_5": 2028,
      "kế_hoạch_tháng_6": 4347.0,
      "tích_lũy_tháng": 2612
    },
    {
      "ngày_báo_cáo": "2026-06-26",
      "brand": "Karofi",
      "hạng_mục_lớn": "Nghiên cứu thị trường",
      "chi_tiết_hạng_mục": "Dự án nghiên cứu",
      "phân_loại": "Theo yêu cầu",
      "tần_suất": "Theo dự án",
      "đơn_vị_tính": "Số dự án",
      "thực_hiện_tháng_5": null,
      "kế_hoạch_tháng_6": 1.0,
      "tích_lũy_tháng": 1
    }
  ],
  "monthly_ooh_pr": [
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "OOH",
      "brand": "Livotec",
      "ngành_hàng": "Ngành 1 & Ngành 3",
      "kênh_channel": "LCD Building",
      "chỉ_số_metric": "Location",
      "mục_tiêu_target": 2676,
      "thực_tế_actual": 2856
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "OOH",
      "brand": "Livotec",
      "ngành_hàng": "Ngành 1 & Ngành 3",
      "kênh_channel": "LCD Building",
      "chỉ_số_metric": "Screen",
      "mục_tiêu_target": 10150,
      "thực_tế_actual": 10794
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "OOH",
      "brand": "Livotec",
      "ngành_hàng": "Ngành 1 & Ngành 3",
      "kênh_channel": "LED Cities",
      "chỉ_số_metric": "Location",
      "mục_tiêu_target": 12,
      "thực_tế_actual": 12
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "OOH",
      "brand": "Livotec",
      "ngành_hàng": "Ngành 1 & Ngành 3",
      "kênh_channel": "LED Airport",
      "chỉ_số_metric": "Location",
      "mục_tiêu_target": 7,
      "thực_tế_actual": 7
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "PR - báo chí",
      "brand": "Livotec",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Báo chí",
      "chỉ_số_metric": "Quantity",
      "mục_tiêu_target": 2,
      "thực_tế_actual": 2
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "PR - báo chí",
      "brand": "Livotec",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Báo chí",
      "chỉ_số_metric": "Views",
      "mục_tiêu_target": 20000,
      "thực_tế_actual": 20858
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "PR - báo chí",
      "brand": "Livotec",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Báo chí",
      "chỉ_số_metric": "Quantity",
      "mục_tiêu_target": 2,
      "thực_tế_actual": 2
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "PR - báo chí",
      "brand": "Livotec",
      "ngành_hàng": "Ngành 3",
      "kênh_channel": "Báo chí",
      "chỉ_số_metric": "Views",
      "mục_tiêu_target": 10000,
      "thực_tế_actual": 12099
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "PR - báo chí",
      "brand": "Livotec",
      "ngành_hàng": "All (branding)",
      "kênh_channel": "Báo chí",
      "chỉ_số_metric": "Quantity",
      "mục_tiêu_target": 1,
      "thực_tế_actual": 1
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "PR - báo chí",
      "brand": "Karofi",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Báo chí",
      "chỉ_số_metric": "Quantity",
      "mục_tiêu_target": 1,
      "thực_tế_actual": 1
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "PR - báo chí",
      "brand": "Karofi",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Báo chí",
      "chỉ_số_metric": "Views",
      "mục_tiêu_target": 20000,
      "thực_tế_actual": 21948
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "OOH",
      "brand": "Karofi",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "LCD Building",
      "chỉ_số_metric": "Location",
      "mục_tiêu_target": 3100,
      "thực_tế_actual": 3280
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "OOH",
      "brand": "Karofi",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "LCD Building",
      "chỉ_số_metric": "Screen",
      "mục_tiêu_target": 10150,
      "thực_tế_actual": 10794
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "OOH",
      "brand": "Karofi",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "LED Cities",
      "chỉ_số_metric": "Location",
      "mục_tiêu_target": 26,
      "thực_tế_actual": 26
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "OOH",
      "brand": "Karofi",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "LED Cities",
      "chỉ_số_metric": "Screen",
      "mục_tiêu_target": 26,
      "thực_tế_actual": 26
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "OOH",
      "brand": "Karofi",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "LED Airport",
      "chỉ_số_metric": "Location",
      "mục_tiêu_target": 18,
      "thực_tế_actual": 18
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "OOH",
      "brand": "Karofi",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "LED Airport",
      "chỉ_số_metric": "Screen",
      "mục_tiêu_target": 245,
      "thực_tế_actual": 245
    },
    {
      "tháng_báo_cáo": "2026-05-01",
      "hạng_mục": "OOH",
      "brand": "Karofi",
      "ngành_hàng": "Ngành 1",
      "kênh_channel": "Pano",
      "chỉ_số_metric": "Location",
      "mục_tiêu_target": 31,
      "thực_tế_actual": 31
    }
  ]
};

export const DEFAULT_COMMENTS_LIVOTEC: BrandComments = {
  evaluation: "Chiến dịch tuần này của Livotec ghi nhận kết quả khả quan ở mảng SEO Website (đạt 3.246 traffic organic, tiệm cận mục tiêu) và Social Media (vượt KPI số lượng bài viết với 5 bài viết thực tế). Các kênh Paid Ads hoạt động ổn định, trong đó TikTok KOC/KOL mang lại tỷ lệ reach cao vượt trội (3.251.131 Reach thực tế so với KPI là 2.114.285). Tuy nhiên, chỉ số Share of Voice (SOV) của Livotec trên thị trường thảo luận chung còn khá khiêm tốn (chỉ đạt 2,8%), bị lấn át lớn bởi Karofi và Kangaroo.",
  proposals: "1. **Đẩy mạnh Social Listening**: Xây dựng các nội dung mang tính thảo luận tự nhiên (organic discussion) trên các hội nhóm đồ gia dụng để cải thiện chỉ số SOV thương hiệu.\n2. **Tối ưu chi phí TikTok Paid Ads**: Mặc dù hiệu quả reach của TikTok KOC tốt, CPM thực tế đang ở mức rất thấp ($8.344) so với target ($14), đây là cơ hội tốt để duy trì ngân sách phân bổ cho TikTok.\n3. **Thúc đẩy SEO Content**: Tăng tốc sản xuất bài viết chuẩn SEO cho Website để bù đắp lượng traffic organic còn thiếu so với kế hoạch tháng.",
  categories: {
    sov: "Thị phần thảo luận (SOV) của Livotec hiện tại chỉ đạt 2.8%, đứng thứ 5 trong nhóm các thương hiệu được đo lường. Karofi (35.9%) và Kangaroo (40.9%) tiếp tục chiếm lĩnh phần lớn thảo luận thị trường. Cần triển khai các mini-game hoặc chủ đề thảo luận cộng đồng để kích hoạt lượng tương tác tự nhiên lớn hơn.",
    kol_koc: "Hoạt động hợp tác KOC/KOL tuần này đạt tiến độ tốt ở mảng tích lũy chiến dịch (đặc biệt Ngành 1 đạt tích lũy 4/10 KOC, Ngành 3 đạt 3/4 KOC). Mặc dù số thực tế triển khai trong tuần này là 0 do đang ở giai đoạn chuẩn bị content nghiệm thu, tiến độ lũy kế vẫn bám sát tiến trình chiến dịch.",
    tvc: "Sản lượng ấn phẩm TVC đang bám sát tiến độ dự án. Ngành 3 đã phát hành thành công 1 video TVC mới trong tuần đúng kế hoạch. Lũy kế tháng cho thấy Ngành 1 tích lũy 2 TVC và Ngành 2 tích lũy 1 TVC, tạo nguồn tư liệu phong phú cho quảng cáo Paid Ads.",
    paid_ads: "Chi tiêu quảng cáo Paid Ads tuần này đạt hiệu quả tối ưu. Tổng CPM trên các kênh dao động ở mức lý tưởng (Facebook Ngành 1 CPM thực tế 10.99đ so với target 12đ, TikTok CPM 9.19đ so với target 10đ). Lượng Reach thực tế vượt KPI đáng kể trên các kênh TikTok, hỗ trợ tích cực cho việc tăng nhận diện thương hiệu.",
    seo: "Website SEO duy trì phong độ ổn định với Impressions đạt 148.962 (bằng 94% mục tiêu tuần). Lượng Traffic Organic đạt 3.246 lượt. Để đạt kế hoạch 15.000 Traffic của tháng, cần tăng cường đi link nội bộ và cập nhật thêm các bài viết chia sẻ mẹo vặt gia đình.",
    btl_trade: "Hoạt động POSM đạt tỷ lệ tích lũy tốt. Đặc biệt hạng mục Mock up Điều hòa GT đạt tích lũy 997/1025 cái (hoàn thành 97% kế hoạch tháng 6). So với tháng 5, hầu hết các hạng mục biển bảng và quầy kệ đều ghi nhận mức tăng trưởng vượt bậc (Ví dụ: Biển bảng tháng 6 tích lũy 36 so với 3 của tháng 5)."
  }
};

export const DEFAULT_COMMENTS_KAROFI: BrandComments = {
  evaluation: "Karofi khẳng định vị thế dẫn đầu với chỉ số Share of Voice (SOV) đạt 35,9%, chỉ xếp sau Kangaroo (40,9%). Kết quả SEO Website cực kỳ ấn tượng, vượt mọi chỉ tiêu tuần (Traffic Organic đạt 18.852, vượt 5% kế hoạch; Impressions đạt 548.338, vượt 10% kế hoạch). Paid Ads trên Facebook cũng hoạt động rất tốt khi lượng Reach đạt 3.576.289, vượt xa KPI tuần (3.250.000) nhờ tối ưu hóa CPM ở mức 9,28đ (thấp hơn target 10đ).",
  proposals: "1. **Tập trung giữ vững SOV**: Tăng cường các chiến dịch tương tác tự nhiên chất lượng cao để rút ngắn khoảng cách với Kangaroo.\n2. **Duy trì ngân sách Facebook Ads**: Facebook Ads đang hoạt động hiệu quả cao với CPM rẻ và Frequency ổn định (2.26). Cần nhân bản các nhóm quảng cáo thành công này.\n3. **Tối ưu hóa hình ảnh điểm bán**: Đẩy nhanh tiến độ chấm điểm hình ảnh điểm bán truyền thống (GT) để đạt mục tiêu kế hoạch tháng 6.",
  categories: {
    sov: "Karofi chiếm 35.9% thị phần thảo luận toàn ngành, giữ vị thế thương hiệu top-of-mind cùng Kangaroo. Khoảng cách với đối thủ bám đuổi Sunhouse (14.4%) khá an toàn. Thảo luận tập trung vào chất lượng lọc nước tinh khiết và dịch vụ bảo hành chuyên nghiệp.",
    kol_koc: "Hoạt động KOL/KOC của Karofi đang được tích hợp sâu trong các bài viết truyền thông. Cần thúc đẩy thêm các bài đánh giá trải nghiệm thực tế từ các KOC gia đình để tăng tính thuyết phục cho người tiêu dùng.",
    tvc: "Các ấn phẩm nội dung số, bao gồm video giới thiệu sản phẩm (3 video mới trong tuần) và sản xuất ấn phẩm OOH/LED (6 ấn phẩm mới) được thực hiện đầy đủ 100% KPI tuần, hỗ trợ đắc lực cho các chiến dịch quảng cáo hiển thị.",
    paid_ads: "Kênh quảng cáo Paid Ads ghi nhận kết quả rất tốt. Chi tiêu đạt 75.065.269 VNĐ, mang về hơn 8 triệu impressions và 3.5 triệu reach. CPM duy trì ở mức tối ưu 9.28 VNĐ (mục tiêu là 10 VNĐ). Tần suất quảng cáo (Frequency) đạt 2.26 lần, đảm bảo độ phủ sâu rộng không bị lặp quá nhiều.",
    seo: "SEO Website bùng nổ mạnh mẽ trong tuần này. Cả hai chỉ số quan trọng là Traffic Organic (18.852) và Impressions Organic (548.338) đều vượt kế hoạch tuần (lần lượt đạt 104.7% và 109.6%). Điều này chứng tỏ chất lượng từ khóa và nội dung Always-On đang hoạt động xuất sắc.",
    btl_trade: "Công tác kiểm soát hình ảnh điểm bán được triển khai trên diện rộng. Chấm điểm hình ảnh GT đạt tích lũy 2.612 điểm bán. Activation và Workshop lọc tổng cũng đã ghi nhận sự kiện đầu tiên thành công trong tháng 6."
  }
};
