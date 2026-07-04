import React, { useState, useEffect } from "react";
import {
  INITIAL_MARKETING_DATA,
  DEFAULT_COMMENTS_LIVOTEC,
  DEFAULT_COMMENTS_KAROFI,
  MarketingReportData,
  BrandComments,
} from "./data";
import {
  TrendingUp,
  Award,
  Users,
  Video,
  Target,
  BarChart3,
  Globe,
  Settings2,
  FileSpreadsheet,
  FileJson,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  Percent,
  CheckSquare,
  FileText,
  DollarSign,
  Briefcase,
  Eye,
  UserCheck,
  Store,
  Shield,
  Lock,
  UserPlus,
  Trash2,
  Edit3,
  LogOut,
  UserMinus,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// Default user metadata
const USER_EMAIL = "ntkdung1206@gmail.com";
const TIMELINES = [
  { id: "week4", label: "Tuần 4 (19/06 - 25/06/2026)", isPRWeek: false, date: "2026-06-25", startDate: "2026-06-19", endDate: "2026-06-26" },
  { id: "week3", label: "Tuần 3 (12/06 - 18/06/2026)", isPRWeek: true, date: "2026-06-18", startDate: "2026-06-12", endDate: "2026-06-18" },
  { id: "week2", label: "Tuần 2 (05/06 - 11/06/2026)", isPRWeek: false, date: "2026-06-11", startDate: "2026-06-05", endDate: "2026-06-11" },
];

export interface UserAccount {
  username: string;
  password: string;
  name: string;
  role: "Admin" | "Editor" | "Viewer";
}

const DEFAULT_USERS: UserAccount[] = [
  { username: "ntkdung1206@gmail.com", password: "123", name: "Dũng Nguyễn", role: "Admin" },
  { username: "admin", password: "123", name: "Quản trị hệ thống", role: "Admin" },
  { username: "editor1", password: "123", name: "Nguyễn Biên Tập", role: "Editor" },
  { username: "viewer1", password: "123", name: "Lê Người Xem", role: "Viewer" }
];

export default function App() {
  // Authentication & Users State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem("marketing_current_user");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem("marketing_users_list");
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  // Login form inputs
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // User Manager states (Add/Edit User Form)
  const [managerUsername, setManagerUsername] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerRole, setManagerRole] = useState<"Admin" | "Editor" | "Viewer">("Viewer");
  const [editingUsername, setEditingUsername] = useState<string | null>(null);

  // Navigation & Brand States
  const [activeTab, setActiveTab] = useState<"dashboard" | "control-panel">("dashboard");
  const [selectedBrand, setSelectedBrand] = useState<"Livotec" | "Karofi">("Livotec");
  const [selectedTimeline, setSelectedTimeline] = useState(TIMELINES[0]);

  // Core Data States
  const [marketingData, setMarketingData] = useState<MarketingReportData>(INITIAL_MARKETING_DATA);
  const [publishedComments, setPublishedComments] = useState<{ Livotec: BrandComments; Karofi: BrandComments }>({
    Livotec: { ...DEFAULT_COMMENTS_LIVOTEC },
    Karofi: { ...DEFAULT_COMMENTS_KAROFI },
  });

  // Control Panel Draft Comments States (allows editing before publishing)
  const [draftComments, setDraftComments] = useState<{ Livotec: BrandComments; Karofi: BrandComments }>({
    Livotec: { ...DEFAULT_COMMENTS_LIVOTEC },
    Karofi: { ...DEFAULT_COMMENTS_KAROFI },
  });

  // UI / Interactive States
  const [categoryTimeViews, setCategoryTimeViews] = useState<{ [key: string]: "week" | "month" }>({
    paidAds: "week",
    seo: "week",
  });
  
  // Category tab state in Box 3
  const [activeCategoryTab, setActiveCategoryTab] = useState<"sov" | "kol" | "tvc" | "ads" | "seo" | "btl">("sov");

  // State for filtering Paid Ads by industry
  const [selectedAdsIndustry, setSelectedAdsIndustry] = useState<string>("Tất cả");

  // Reset Paid Ads industry filter when selected brand changes
  useEffect(() => {
    setSelectedAdsIndustry("Tất cả");
  }, [selectedBrand]);

  // Auto-switch to the first tab with data if the current tab doesn't have data for the selected brand
  useEffect(() => {
    const rawDigital = marketingData?.digital_marketing || [];
    const rawBtl = marketingData?.btl_trade || [];
    const rawKol = marketingData?.kol_koc || [];

    const digital = rawDigital.filter(
      (row) => row.brand && row.brand.toLowerCase() === selectedBrand.toLowerCase()
    );
    const btl = rawBtl.filter(
      (row) => row.brand && row.brand.toLowerCase() === selectedBrand.toLowerCase()
    );
    const kol = rawKol.filter((row) => {
      if ("brand" in row && (row as any).brand) {
        return (row as any).brand.toLowerCase() === selectedBrand.toLowerCase();
      }
      return selectedBrand.toLowerCase() === "livotec";
    });

    const activeBrandSov = rawDigital.filter(
      (row) => row.hạng_mục === "Social Listening"
    ).find(
      (row) => row.kênh_channel && row.kênh_channel.toLowerCase() === selectedBrand.toLowerCase()
    );

    const hasSov = activeBrandSov ? (activeBrandSov.thực_tế_actual || 0) > 0 : false;
    const hasKol = kol.length > 0;
    const hasContent = digital.some((row) => row.nhóm_báo_cáo === "Content");
    const hasAds = digital.some((row) => row.hạng_mục === "Paid Ads");
    const hasSeo = digital.some((row) => row.hạng_mục === "SEO Website" || row.hạng_mục === "SEO Content" || row.hạng_mục === "Product Page");
    const hasBtl = btl.length > 0;

    const tabsStatus = {
      sov: hasSov,
      kol: hasKol,
      tvc: hasContent,
      ads: hasAds,
      seo: hasSeo,
      btl: hasBtl
    };

    if (!tabsStatus[activeCategoryTab]) {
      const firstAvailable = (Object.keys(tabsStatus) as Array<keyof typeof tabsStatus>).find(k => tabsStatus[k]);
      if (firstAvailable) {
        setActiveCategoryTab(firstAvailable);
      }
    }
  }, [selectedBrand, marketingData, activeCategoryTab]);

  // Control Panel Import states
  const [driveUrl, setDriveUrl] = useState("");
  const [pastedJson, setPastedJson] = useState(JSON.stringify(INITIAL_MARKETING_DATA, null, 2));
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  // Sync Draft state with Published State on load
  useEffect(() => {
    const savedPublished = localStorage.getItem("marketing_published_comments");
    const savedData = localStorage.getItem("marketing_report_raw_data");
    
    if (savedPublished) {
      try {
        const parsed = JSON.parse(savedPublished);
        setPublishedComments(parsed);
        setDraftComments(JSON.parse(JSON.stringify(parsed))); // Deep clone to draft
      } catch (e) {
        console.error("Error reading saved comments", e);
      }
    }
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed) {
          const safeData = {
            digital_marketing: parsed.digital_marketing || [],
            kol_koc: parsed.kol_koc || [],
            btl_trade: parsed.btl_trade || [],
            monthly_ooh_pr: parsed.monthly_ooh_pr || [],
          };
          setMarketingData(safeData);
          setPastedJson(JSON.stringify(safeData, null, 2));
        }
      } catch (e) {
        console.error("Error reading saved data", e);
      }
    }
  }, []);

  const triggerNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Persist users to localStorage
  useEffect(() => {
    localStorage.setItem("marketing_users_list", JSON.stringify(users));
  }, [users]);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginUsername.trim() || !loginPassword) {
      setLoginError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    const foundUser = users.find(
      (u) => u.username.toLowerCase() === loginUsername.trim().toLowerCase() && u.password === loginPassword
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem("marketing_current_user", JSON.stringify(foundUser));
      triggerNotification("success", `Chào mừng ${foundUser.name} (${foundUser.role}) quay lại hệ thống!`);
      if (foundUser.role === "Viewer") {
        setActiveTab("dashboard");
      }
    } else {
      setLoginError("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("marketing_current_user");
    setLoginUsername("");
    setLoginPassword("");
    triggerNotification("success", "Đã đăng xuất khỏi hệ thống.");
  };

  // User management handlers
  const handleAddOrEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerUsername.trim() || !managerName.trim() || !managerPassword) {
      triggerNotification("error", "Vui lòng điền đầy đủ các thông tin người dùng.");
      return;
    }

    if (editingUsername) {
      // Editing mode
      setUsers(
        users.map((u) =>
          u.username.toLowerCase() === editingUsername.toLowerCase()
            ? { ...u, name: managerName.trim(), password: managerPassword, role: managerRole }
            : u
        )
      );

      if (currentUser && currentUser.username.toLowerCase() === editingUsername.toLowerCase()) {
        const updatedSelf = { ...currentUser, name: managerName.trim(), password: managerPassword, role: managerRole };
        setCurrentUser(updatedSelf);
        localStorage.setItem("marketing_current_user", JSON.stringify(updatedSelf));
      }

      triggerNotification("success", `Đã cập nhật thông tin người dùng ${managerUsername} thành công!`);
      setEditingUsername(null);
    } else {
      // Adding mode
      const exists = users.some((u) => u.username.toLowerCase() === managerUsername.trim().toLowerCase());
      if (exists) {
        triggerNotification("error", "Tên đăng nhập đã tồn tại trong hệ thống.");
        return;
      }

      const newUser: UserAccount = {
        username: managerUsername.trim().toLowerCase(),
        password: managerPassword,
        name: managerName.trim(),
        role: managerRole,
      };

      setUsers([...users, newUser]);
      triggerNotification("success", `Đã thêm thành viên mới: ${managerName} (${managerRole})!`);
    }

    setManagerUsername("");
    setManagerPassword("");
    setManagerName("");
    setManagerRole("Viewer");
  };

  const handleStartEditUser = (u: UserAccount) => {
    setEditingUsername(u.username);
    setManagerUsername(u.username);
    setManagerPassword(u.password);
    setManagerName(u.name);
    setManagerRole(u.role);
  };

  const handleDeleteUser = (usernameToDelete: string) => {
    if (currentUser && currentUser.username.toLowerCase() === usernameToDelete.toLowerCase()) {
      triggerNotification("error", "Bạn không thể tự xóa chính mình khi đang đăng nhập.");
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${usernameToDelete} khỏi hệ thống?`)) {
      setUsers(users.filter((u) => u.username.toLowerCase() !== usernameToDelete.toLowerCase()));
      triggerNotification("success", `Đã xóa tài khoản ${usernameToDelete} thành công.`);

      if (editingUsername && editingUsername.toLowerCase() === usernameToDelete.toLowerCase()) {
        setEditingUsername(null);
        setManagerUsername("");
        setManagerPassword("");
        setManagerName("");
        setManagerRole("Viewer");
      }
    }
  };

  // Google Drive connection
  const handleDriveImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl.trim()) return;

    setIsDriveLoading(true);
    try {
      const response = await fetch("/api/fetch-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: driveUrl }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setMarketingData(result.data);
        setPastedJson(JSON.stringify(result.data, null, 2));
        localStorage.setItem("marketing_report_raw_data", JSON.stringify(result.data));
        triggerNotification("success", "Đã kết nối và đồng bộ dữ liệu từ Google Drive thành công!");
      } else {
        throw new Error(result.error || "Không thể tải dữ liệu từ Google Drive.");
      }
    } catch (err: any) {
      triggerNotification("error", err.message || "Lỗi kết nối tệp trực tuyến.");
    } finally {
      setIsDriveLoading(false);
    }
  };

  // Paste raw JSON submission
  const handleJsonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(pastedJson);
      // Basic validation
      if (!parsed.digital_marketing || !parsed.kol_koc || !parsed.btl_trade || !parsed.monthly_ooh_pr) {
        throw new Error("Dữ liệu JSON thiếu một trong các trường bắt buộc (digital_marketing, kol_koc, btl_trade, monthly_ooh_pr).");
      }
      setMarketingData(parsed);
      localStorage.setItem("marketing_report_raw_data", JSON.stringify(parsed));
      triggerNotification("success", "Cập nhật dữ liệu từ bảng soạn thảo JSON thành công!");
    } catch (err: any) {
      triggerNotification("error", `Lỗi định dạng JSON: ${err.message}`);
    }
  };

  // Reset to default initial dataset
  const handleResetData = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu báo cáo và nhận định về mặc định ban đầu không?")) {
      setMarketingData(INITIAL_MARKETING_DATA);
      setPastedJson(JSON.stringify(INITIAL_MARKETING_DATA, null, 2));
      
      const defaultPublished = {
        Livotec: { ...DEFAULT_COMMENTS_LIVOTEC },
        Karofi: { ...DEFAULT_COMMENTS_KAROFI },
      };
      setPublishedComments(defaultPublished);
      setDraftComments(JSON.parse(JSON.stringify(defaultPublished)));
      
      localStorage.removeItem("marketing_report_raw_data");
      localStorage.removeItem("marketing_published_comments");
      
      setHasUnpublishedChanges(false);
      triggerNotification("success", "Đã khôi phục dữ liệu và nhận định về trạng thái mặc định.");
    }
  };

  // AI suggestions from Gemini API
  const handleAiSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: marketingData, brand: selectedBrand }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const aiAnalysis = result.analysis;
        
        // Update draft for current brand
        const updatedDraft = { ...draftComments };
        updatedDraft[selectedBrand] = {
          evaluation: aiAnalysis.executiveSummary.evaluation,
          proposals: aiAnalysis.executiveSummary.proposals,
          categories: {
            sov: aiAnalysis.categoryAnalysis.sov,
            kol_koc: aiAnalysis.categoryAnalysis.kol_koc,
            tvc: aiAnalysis.categoryAnalysis.tvc,
            paid_ads: aiAnalysis.categoryAnalysis.paid_ads,
            seo: aiAnalysis.categoryAnalysis.seo,
            btl_trade: aiAnalysis.categoryAnalysis.btl_trade,
          }
        };

        setDraftComments(updatedDraft);
        setHasUnpublishedChanges(true);
        triggerNotification("success", `AI đã phân tích dữ liệu thực tế của ${selectedBrand} và điền các gợi ý vào biểu mẫu thành công! Bạn có thể chỉnh sửa thêm trước khi xuất bản.`);
      } else {
        throw new Error(result.error || "Không nhận được phân tích từ AI.");
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification("error", `Lỗi phân tích AI: ${err.message || "Vui lòng kiểm tra cấu hình khóa API trong Secrets."}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Draft changes
  const handleDraftCommentChange = (field: "evaluation" | "proposals", value: string) => {
    const updated = { ...draftComments };
    updated[selectedBrand][field] = value;
    setDraftComments(updated);
    setHasUnpublishedChanges(true);
  };

  const handleDraftCategoryChange = (catKey: keyof typeof DEFAULT_COMMENTS_LIVOTEC.categories, value: string) => {
    const updated = { ...draftComments };
    updated[selectedBrand].categories[catKey] = value;
    setDraftComments(updated);
    setHasUnpublishedChanges(true);
  };

  // Publish Draft to live reporting dashboard
  const handlePublish = () => {
    setPublishedComments(JSON.parse(JSON.stringify(draftComments)));
    localStorage.setItem("marketing_published_comments", JSON.stringify(draftComments));
    setHasUnpublishedChanges(false);
    triggerNotification("success", `Đã xuất bản thành công các nhận định mới của ${selectedBrand} lên báo cáo chính thức!`);
  };

  // ------------------------------------------------------------
  // DYNAMIC DATA PARSING & MATHEMATICAL DERIVATIONS
  // ------------------------------------------------------------
  
  // Helper to check if a record falls within the selected timeline
  const isInSelectedTimeline = (ngày_báo_cáo: string | undefined) => {
    if (!ngày_báo_cáo) return false;
    
    // Direct match (extremely safe and precise)
    if (ngày_báo_cáo === selectedTimeline.date) return true;

    // Parse date ranges
    const recordDate = new Date(ngày_báo_cáo);
    if (isNaN(recordDate.getTime())) return false;

    // Get selectedTimeline's start and end dates
    const start = new Date(selectedTimeline.startDate || "");
    const end = new Date(selectedTimeline.endDate || "");
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

    return recordDate >= start && recordDate <= end;
  };

  // Safe Fallback Lists
  const digitalMarketingList = marketingData?.digital_marketing || [];
  const btlTradeList = marketingData?.btl_trade || [];
  const kolKocList = marketingData?.kol_koc || [];
  const monthlyOohPrList = marketingData?.monthly_ooh_pr || [];

  // 1. Filtered data by active brand and selected timeline
  const brandDigital = digitalMarketingList.filter(
    (row) => row.brand && row.brand.toLowerCase() === selectedBrand.toLowerCase() && isInSelectedTimeline(row.ngày_báo_cáo)
  );
  const brandBtl = btlTradeList.filter(
    (row) => row.brand && row.brand.toLowerCase() === selectedBrand.toLowerCase() && isInSelectedTimeline(row.ngày_báo_cáo)
  );
  const brandOohPr = monthlyOohPrList.filter(
    (row) => row.brand && row.brand.toLowerCase() === selectedBrand.toLowerCase()
  );

  // 2. Share of Voice calculation (Always show industry snapshot for selected timeline)
  // In our JSON, Livotec & Karofi share of voice are under brand "Karofi" with kênh_channel as brand name
  const sovRows = digitalMarketingList.filter(
    (row) => row.hạng_mục === "Social Listening" && isInSelectedTimeline(row.ngày_báo_cáo)
  );
  
  const sovData = sovRows.map((row) => ({
    name: row.kênh_channel,
    value: (row.thực_tế_actual || 0) * 100,
    formatted: `${((row.thực_tế_actual || 0) * 100).toFixed(1)}%`,
  })).sort((a, b) => b.value - a.value);

  const activeBrandSov = sovRows.find(
    (row) => row.kênh_channel && row.kênh_channel.toLowerCase() === selectedBrand.toLowerCase()
  );
  const sovPercentage = activeBrandSov ? (activeBrandSov.thực_tế_actual || 0) * 100 : 0;

  // 3. Content (số ấn phẩm) Weekly
  const contentRows = brandDigital.filter((row) => row.nhóm_báo_cáo === "Content");
  const weeklyContentSum = contentRows.reduce((sum, row) => sum + (row.thực_tế_actual || 0), 0);

  // Group contentRows by "hạng_mục" for the "Content & Sáng tạo" category chart
  const contentByHạngMụcMap = new Map<string, { name: string; mục_tiêu_target: number; thực_tế_actual: number; tích_lũy_tháng: number }>();
  contentRows.forEach((row) => {
    const key = row.hạng_mục || "Khác";
    if (!contentByHạngMụcMap.has(key)) {
      contentByHạngMụcMap.set(key, {
        name: key,
        mục_tiêu_target: 0,
        thực_tế_actual: 0,
        tích_lũy_tháng: 0,
      });
    }
    const item = contentByHạngMụcMap.get(key)!;
    item.mục_tiêu_target += (row.mục_tiêu_target || 0);
    item.thực_tế_actual += (row.thực_tế_actual || 0);
    item.tích_lũy_tháng += (row.tích_lũy_tháng || 0);
  });
  const contentByHạngMục = Array.from(contentByHạngMụcMap.values());

  // 4. SEO Organic Traffic Weekly & Monthly
  const seoTrafficRow = brandDigital.find(
    (row) => row.hạng_mục === "SEO Website" && row.chỉ_số_metric === "Traffic Organic"
  );
  const seoTrafficWeeklyTarget = seoTrafficRow ? seoTrafficRow.mục_tiêu_target || 0 : 0;
  const seoTrafficWeeklyActual = seoTrafficRow ? seoTrafficRow.thực_tế_actual || 0 : 0;
  const seoTrafficMonthlyTarget = seoTrafficRow ? seoTrafficRow.target_tháng || 0 : 0;
  const seoTrafficMonthlyActual = seoTrafficRow ? seoTrafficRow.tích_lũy_tháng || 0 : 0;

  const seoImpressionsRow = brandDigital.find(
    (row) => row.hạng_mục === "SEO Website" && row.chỉ_số_metric === "Impressions Organic"
  );
  const seoImpressionsWeeklyTarget = seoImpressionsRow ? seoImpressionsRow.mục_tiêu_target || 0 : 0;
  const seoImpressionsWeeklyActual = seoImpressionsRow ? seoImpressionsRow.thực_tế_actual || 0 : 0;
  const seoImpressionsMonthlyTarget = seoImpressionsRow ? seoImpressionsRow.target_tháng || 0 : 0;
  const seoImpressionsMonthlyActual = seoImpressionsRow ? seoImpressionsRow.tích_lũy_tháng || 0 : 0;

  // 5. PR articles quantity (Conditional weekly scorecard / accumulated)
  const prQuantityRow = brandOohPr.find(
    (row) => row.hạng_mục === "PR - báo chí" && row.chỉ_số_metric === "Quantity"
  );
  // Sum of PR quantity for the brand in the month (represented in monthly_ooh_pr)
  const prQuantitySum = brandOohPr
    .filter((row) => row.hạng_mục === "PR - báo chí" && row.chỉ_số_metric === "Quantity")
    .reduce((sum, row) => sum + (row.thực_tế_actual || 0), 0);

  // 5.5. KOL/KOC Calculations (Filtered by Brand & Timeline)
  const brandKolKoc = kolKocList.filter((row) => {
    const isBrandMatch = ("brand" in row && (row as any).brand)
      ? (row as any).brand.toLowerCase() === selectedBrand.toLowerCase()
      : selectedBrand.toLowerCase() === "livotec";
    return isBrandMatch && isInSelectedTimeline(row.ngày_báo_cáo);
  });

  const totalKolKocKpi = brandKolKoc.reduce((sum, r) => sum + (r.kpi_toàn_chiến_dịch || 0), 0);
  const totalKolKocTichLuy = brandKolKoc.reduce((sum, r) => sum + (r.tích_lũy_chiến_dịch || 0), 0);
  const totalKolKocTrongTuan = brandKolKoc.reduce((sum, r) => sum + (r.thực_tế_trong_tuần || 0), 0);

  // 6. Paid Ads Calculations (Spent, Impressions, Reach, Frequency)
  const adsSpentRows = brandDigital.filter(
    (row) => row.hạng_mục === "Paid Ads" && row.chỉ_số_metric === "Amount spent (VNĐ)"
  );
  const adsImpressionRows = brandDigital.filter(
    (row) => row.hạng_mục === "Paid Ads" && row.chỉ_số_metric === "Impressions"
  );
  const adsReachRows = brandDigital.filter(
    (row) => row.hạng_mục === "Paid Ads" && row.chỉ_số_metric === "Reach"
  );
  const adsFreqRows = brandDigital.filter(
    (row) => row.hạng_mục === "Paid Ads" && row.chỉ_số_metric === "Frequency"
  );

  // Weekly sums (since they represent the active week)
  // If some rows are MTD in database, we only sum non-null actual or check row is weekly
  const weeklyAdsSpent = adsSpentRows
    .filter((r) => r.phân_loại_thời_gian === "Weekly" || r.thực_tế_actual !== null)
    .reduce((sum, r) => sum + (r.thực_tế_actual || 0), 0);
    
  const monthlyAdsSpent = adsSpentRows.reduce((sum, r) => sum + (r.tích_lũy_tháng || 0), 0);
  const monthlyAdsSpentTarget = adsSpentRows.reduce((sum, r) => sum + (r.target_tháng || 0), 0);

  const weeklyAdsImpressions = adsImpressionRows
    .filter((r) => r.phân_loại_thời_gian === "Weekly" || r.thực_tế_actual !== null)
    .reduce((sum, r) => sum + (r.thực_tế_actual || r.tích_lũy_tháng || 0), 0);
    
  const monthlyAdsImpressions = adsImpressionRows.reduce((sum, r) => sum + (r.tích_lũy_tháng || 0), 0);
  const monthlyAdsImpressionsTarget = adsImpressionRows.reduce((sum, r) => sum + (r.target_tháng || 0), 0);

  const weeklyAdsReach = adsReachRows
    .filter((r) => r.phân_loại_thời_gian === "Weekly" || r.thực_tế_actual !== null)
    .reduce((sum, r) => sum + (r.thực_tế_actual || r.tích_lũy_tháng || 0), 0);
    
  const monthlyAdsReach = adsReachRows.reduce((sum, r) => sum + (r.tích_lũy_tháng || 0), 0);
  const monthlyAdsReachTarget = adsReachRows.reduce((sum, r) => sum + (r.target_tháng || 0), 0);

  // Average frequency
  const activeFreqRows = adsFreqRows.filter((r) => r.thực_tế_actual !== null || r.tích_lũy_tháng !== null);
  const avgAdsFrequency = activeFreqRows.length > 0 
    ? activeFreqRows.reduce((sum, r) => sum + (r.thực_tế_actual || r.tích_lũy_tháng || 0), 0) / activeFreqRows.length
    : 0;

  // Tab data presence checking
  const hasSovData = sovPercentage > 0;
  const hasKolData = brandKolKoc.length > 0;
  const hasContentData = contentRows.length > 0;
  const hasAdsData = brandDigital.some((row) => row.hạng_mục === "Paid Ads");
  const hasSeoData = brandDigital.some(
    (row) => row.hạng_mục === "SEO Website" || row.hạng_mục === "SEO Content" || row.hạng_mục === "Product Page"
  );
  const hasBtlData = brandBtl.length > 0;

  const tabsStatus: { [key: string]: boolean } = {
    sov: hasSovData,
    kol: hasKolData,
    tvc: hasContentData,
    ads: hasAdsData,
    seo: hasSeoData,
    btl: hasBtlData,
  };

  // Render scorecard lists dynamically based on rules:
  // - Fixed: Share of Voice (SOV), Content, SEO (Organic Traffic)
  // - PR (number of articles) is shown ONLY if timeline selected has isPRWeek: true
  // - Fixed: Ads. Amount Spent, Ads. Impression, Ads. Frequency
  // - Ads. Reach is added ONLY if scorecard count is less than 8.
  
  const scorecards: {
    id: string;
    title: string;
    value: string;
    targetLabel?: string;
    targetVal?: string;
    percent?: number;
    icon: any;
    color: string;
    bg: string;
  }[] = [];

  // Card 1: Share Of Voice (SOV)
  if (sovPercentage > 0) {
    scorecards.push({
      id: "sov",
      title: "Share Of Voice (SOV)",
      value: `${sovPercentage.toFixed(1)}%`,
      targetLabel: "Thị phần thảo luận",
      targetVal: selectedBrand === "Livotec" ? "Rank #5" : "Rank #2",
      icon: Percent,
      color: "text-indigo-600 border-indigo-100",
      bg: "bg-indigo-50/50",
    });
  }

  // Card 2: Content
  if (weeklyContentSum > 0) {
    scorecards.push({
      id: "content",
      title: "Content (Ấn phẩm)",
      value: `${weeklyContentSum} bài/video`,
      targetLabel: "Kế hoạch tuần",
      targetVal: selectedBrand === "Livotec" ? "14 bài" : "24 bài",
      percent: Math.min(Math.round((weeklyContentSum / (selectedBrand === "Livotec" ? 14 : 24)) * 100), 150),
      icon: Video,
      color: "text-pink-600 border-pink-100",
      bg: "bg-pink-50/50",
    });
  }

  // Card 3: SEO Traffic
  if (seoTrafficWeeklyActual > 0 || seoTrafficWeeklyTarget > 0) {
    scorecards.push({
      id: "seo",
      title: "SEO Organic Traffic",
      value: seoTrafficWeeklyActual.toLocaleString(),
      targetLabel: `Target: ${seoTrafficWeeklyTarget.toLocaleString()}`,
      percent: Math.round((seoTrafficWeeklyActual / seoTrafficWeeklyTarget) * 100),
      icon: Globe,
      color: "text-emerald-600 border-emerald-100",
      bg: "bg-emerald-50/50",
    });
  }

  // Card 3.5: KOL/KOC Campaigns
  if (totalKolKocKpi > 0 || totalKolKocTichLuy > 0 || totalKolKocTrongTuan > 0) {
    scorecards.push({
      id: "kol_koc",
      title: "KOL/KOC Đã Đạt",
      value: totalKolKocKpi > 0 ? `${totalKolKocTichLuy}/${totalKolKocKpi} KOC/KOL` : "0 KOC/KOL",
      targetLabel: "Thực hiện trong tuần",
      targetVal: `+${totalKolKocTrongTuan}`,
      percent: totalKolKocKpi > 0 ? Math.round((totalKolKocTichLuy / totalKolKocKpi) * 100) : 0,
      icon: Users,
      color: "text-blue-600 border-blue-100",
      bg: "bg-blue-50/50",
    });
  }

  // Card 4: PR (Conditional: Only Week 2 / After 10th and if has data)
  if (selectedTimeline.isPRWeek && prQuantitySum > 0) {
    scorecards.push({
      id: "pr",
      title: "PR - Bài viết",
      value: `${prQuantitySum} bài báo`,
      targetLabel: `Target: ${selectedBrand === "Livotec" ? "5 bài" : "1 bài"}`,
      percent: Math.round((prQuantitySum / (selectedBrand === "Livotec" ? 5 : 1)) * 100),
      icon: FileText,
      color: "text-purple-600 border-purple-100",
      bg: "bg-purple-50/50",
    });
  }

  // Card: Retail POSM & Vật dụng - VỊ TRÍ SAU CARD PR!
  const retailRows = brandBtl.filter((row) => row.hạng_mục_lớn === "POSM");
  const totalRetailTichLuy = retailRows.reduce((sum, row) => sum + (row.tích_lũy_tháng || 0), 0);
  const totalRetailKeHoach = retailRows.reduce((sum, row) => sum + (row.kế_hoạch_tháng_6 || 0), 0);
  const retailCompletionRate = totalRetailKeHoach > 0 ? Math.round((totalRetailTichLuy / totalRetailKeHoach) * 100) : 0;

  if (totalRetailTichLuy > 0 || totalRetailKeHoach > 0) {
    scorecards.push({
      id: "retail_posm",
      title: "Retail POSM & Vật dụng",
      value: `${totalRetailTichLuy.toLocaleString()} vật dụng`,
      targetLabel: `Kế hoạch: ${totalRetailKeHoach.toLocaleString()}`,
      percent: retailCompletionRate,
      icon: Store,
      color: "text-cyan-600 border-cyan-100",
      bg: "bg-cyan-50/50",
    });
  }

  // Card 5: Ads Amount Spent
  if (weeklyAdsSpent > 0 || monthlyAdsSpent > 0) {
    scorecards.push({
      id: "ads_spent",
      title: "Ads. Amount Spent",
      value: `${(weeklyAdsSpent / 1000000).toFixed(1)}M VNĐ`,
      targetLabel: "Chi tiêu lũy kế tháng",
      targetVal: `${(monthlyAdsSpent / 1000000).toFixed(0)}M/${(monthlyAdsSpentTarget / 1000000).toFixed(0)}M`,
      percent: Math.round((monthlyAdsSpent / monthlyAdsSpentTarget) * 100),
      icon: DollarSign,
      color: "text-amber-600 border-amber-100",
      bg: "bg-amber-50/50",
    });
  }

  // Card 6: Ads Impression
  if (weeklyAdsImpressions > 0 || monthlyAdsImpressions > 0) {
    scorecards.push({
      id: "ads_impression",
      title: "Ads. Impressions",
      value: weeklyAdsImpressions > 1000000 
        ? `${(weeklyAdsImpressions / 1000000).toFixed(2)}M`
        : weeklyAdsImpressions.toLocaleString(),
      targetLabel: "Lũy kế tháng",
      targetVal: `${(monthlyAdsImpressions / 1000000).toFixed(1)}M`,
      icon: Award,
      color: "text-sky-600 border-sky-100",
      bg: "bg-sky-50/50",
    });
  }

  // Card 7: Ads Frequency
  if (avgAdsFrequency > 0) {
    scorecards.push({
      id: "ads_frequency",
      title: "Ads. Frequency",
      value: `${avgAdsFrequency.toFixed(2)}x`,
      targetLabel: "Tần suất lặp trung bình",
      targetVal: `Target ~2.5x`,
      icon: RefreshCw,
      color: "text-orange-600 border-orange-100",
      bg: "bg-orange-50/50",
    });
  }

  // Card 8: Ads Reach (Added ONLY if scorecards count < 8 and has data)
  if (scorecards.length < 8 && (weeklyAdsReach > 0 || monthlyAdsReach > 0)) {
    scorecards.push({
      id: "ads_reach",
      title: "Ads. Reach (Bổ sung)",
      value: weeklyAdsReach > 1000000 
        ? `${(weeklyAdsReach / 1000000).toFixed(2)}M`
        : weeklyAdsReach.toLocaleString(),
      targetLabel: "Lũy kế tháng",
      targetVal: `${(monthlyAdsReach / 1000000).toFixed(1)}M`,
      icon: Users,
      color: "text-blue-600 border-blue-100",
      bg: "bg-blue-50/50",
    });
  }

  // Active brand comments for display in Box 2 and Box 3
  const activeComments = publishedComments[selectedBrand];

  // Helper to render formatting of Proposals in Box 2
  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      // Check if it starts with bold (e.g., 1. **Title**: Content or **Title**)
      const boldMatch = line.match(/^\d*\.?\s*\*\*(.*?)\*\*(.*)$/);
      if (boldMatch) {
        return (
          <p key={idx} className="mb-2 leading-relaxed text-gray-700">
            <span className="font-semibold text-gray-900">{boldMatch[1]}</span>
            {boldMatch[2]}
          </p>
        );
      }
      return <p key={idx} className="mb-2 leading-relaxed text-gray-700">{line}</p>;
    });
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 font-sans">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Đăng Nhập Hệ Thống
            </h2>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Báo cáo hiệu suất Marketing Livotec & Karofi
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {loginError && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4 rounded-md shadow-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Tên đăng nhập / Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserCheck className="h-4 w-4" />
                  </span>
                  <input
                    id="login_username"
                    name="username"
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Nhập email hoặc tên tài khoản..."
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="login_password"
                    name="password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu truy cập..."
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                id="login_submit_btn"
                className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition shadow-md cursor-pointer"
              >
                Đăng nhập hệ thống
              </button>
            </div>
          </form>

          {/* Reference list of accounts */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-[11px] text-slate-500 space-y-2">
            <span className="font-bold text-slate-700 block">🔐 Tài khoản truy cập demo (Vui lòng tự gõ thông tin):</span>
            <div className="grid grid-cols-1 gap-1.5 font-mono">
              <div>
                <span className="font-semibold text-indigo-700">Admin (Toàn quyền):</span>
                <span className="block text-slate-600 pl-2">• Username: ntkdung1206@gmail.com</span>
                <span className="block text-slate-600 pl-2">• Password: 123</span>
              </div>
              <div className="border-t border-slate-200/60 pt-1.5">
                <span className="font-semibold text-emerald-700">Editor (Biên tập dữ liệu):</span>
                <span className="block text-slate-600 pl-2">• Username: editor1</span>
                <span className="block text-slate-600 pl-2">• Password: 123</span>
              </div>
              <div className="border-t border-slate-200/60 pt-1.5">
                <span className="font-semibold text-amber-700">Viewer (Chỉ xem báo cáo):</span>
                <span className="block text-slate-600 pl-2">• Username: viewer1</span>
                <span className="block text-slate-600 pl-2">• Password: 123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Notifications inside login */}
        {notification && (
          <div
            id="global_notification"
            className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl transition-all duration-300 max-w-md ${
              notification.type === "success"
                ? "bg-emerald-900 text-emerald-100 border-l-4 border-emerald-400"
                : "bg-rose-900 text-rose-100 border-l-4 border-rose-400"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="app_root" className="min-h-screen bg-slate-50/60 font-sans text-slate-800">
      {/* ------------------------------------------------------------
          HEADER MENU BAR
         ------------------------------------------------------------ */}
      <header id="header_navbar" className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-3 sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Báo Cáo Hiệu Suất Marketing
              </h1>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">
                Livotec & Karofi • Analytical Hub
              </p>
            </div>
          </div>

          {/* User metadata & timeline info */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">
              <UserCheck className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-semibold text-slate-950">{currentUser.name}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                currentUser.role === "Admin" ? "bg-indigo-100 text-indigo-700" :
                currentUser.role === "Editor" ? "bg-emerald-100 text-emerald-700" :
                "bg-amber-100 text-amber-700"
              }`}>
                {currentUser.role}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 shadow-sm transition cursor-pointer"
              title="Đăng xuất khỏi tài khoản"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>

            {/* Timeline selector */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <select
                id="timeline_select"
                value={selectedTimeline.id}
                onChange={(e) => {
                  const found = TIMELINES.find((t) => t.id === e.target.value);
                  if (found) setSelectedTimeline(found);
                }}
                className="bg-transparent pr-2 font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                {TIMELINES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center rounded-lg bg-slate-100 p-1">
              <button
                id="tab_nav_report"
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Báo Cáo</span>
              </button>
              
              {currentUser.role !== "Viewer" && (
                <button
                  id="tab_nav_control"
                  onClick={() => setActiveTab("control-panel")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all relative cursor-pointer ${
                    activeTab === "control-panel"
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  <span>Control Panel</span>
                  {hasUnpublishedChanges && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Floating Global Notifications */}
      {notification && (
        <div
          id="global_notification"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl transition-all duration-300 max-w-md ${
            notification.type === "success"
              ? "bg-emerald-900 text-emerald-100 border-l-4 border-emerald-400"
              : "bg-rose-900 text-rose-100 border-l-4 border-rose-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* ------------------------------------------------------------
          BRAND SELECTION SUB-BAR
         ------------------------------------------------------------ */}
      <div className="border-b border-slate-200 bg-white/60 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thương hiệu phân tích:
            </span>
            <div className="flex rounded-lg bg-slate-100/80 p-0.5 border border-slate-200/50">
              <button
                id="brand_btn_livotec"
                onClick={() => setSelectedBrand("Livotec")}
                className={`rounded-md px-4 py-1 text-xs font-bold transition-all ${
                  selectedBrand === "Livotec"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                LIVOTEC
              </button>
              <button
                id="brand_btn_karofi"
                onClick={() => setSelectedBrand("Karofi")}
                className={`rounded-md px-4 py-1 text-xs font-bold transition-all ${
                  selectedBrand === "Karofi"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                KAROFI
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 sm:inline">Trạng thái dữ liệu:</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Đã kết nối
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------
          MAIN APPLICATION STAGE
         ------------------------------------------------------------ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === "dashboard" ? (
          <div className="space-y-6">
            
            {/* ------------------------------------------------------------
                BOX 1: SCORE CARDS (MAX 8 CARDS)
               ------------------------------------------------------------ */}
            <section id="box1_scorecards" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Box 1: Scorecards Chỉ Số Chủ Chốt
                </h2>
                {selectedTimeline.isPRWeek && (
                  <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                    {selectedTimeline.label.split(" ")[0]} {selectedTimeline.label.split(" ")[1]}: Có PR báo chí (+1 Card)
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {scorecards.map((card) => {
                  const IconComponent = card.icon;
                  return (
                    <div
                      key={card.id}
                      id={`card_${card.id}`}
                      className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 group`}
                    >
                      {/* Accent Background Highlight */}
                      <div className={`absolute top-0 right-0 h-16 w-16 rounded-full -mr-6 -mt-6 transition-all duration-300 group-hover:scale-110 ${card.bg}`} />
                      
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-tight block">
                            {card.title}
                          </span>
                          <span className="font-mono text-xl font-bold text-slate-900 tracking-tight sm:text-2xl block">
                            {card.value}
                          </span>
                        </div>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${card.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
                        <span>{card.targetLabel}</span>
                        <span className="font-semibold text-slate-800">{card.targetVal || `${card.percent}% đạt`}</span>
                      </div>

                      {card.percent !== undefined && (
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              card.percent >= 100 ? "bg-emerald-500" : card.percent >= 70 ? "bg-amber-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(card.percent, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ------------------------------------------------------------
                BOX 2: EXECUTIVE SUMMARY
               ------------------------------------------------------------ */}
            <section id="box2_executive_summary" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Box 2: Đánh Giá Tổng Quan (Executive Summary)
                </h2>
                <button
                  onClick={() => {
                    setActiveTab("control-panel");
                    // Scroll to editor
                    setTimeout(() => {
                      document.getElementById("editor_title_section")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 underline flex items-center gap-1"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Chỉnh sửa nhận định
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Real-time Status Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Award className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Thực Trạng Triển Khai Tuần Này
                      </h3>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                      Hoạt động tốt
                    </span>
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed font-sans prose prose-slate">
                    {renderFormattedText(activeComments.evaluation)}
                  </div>
                </div>

                {/* Recommendations Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <Target className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Đề Xuất Tối Ưu Cho Tuần Kế Tiếp
                    </h3>
                  </div>
                  <div className="space-y-1.5 border-l-2 border-amber-300 pl-4 py-1 text-sm text-slate-700 leading-relaxed font-sans">
                    {renderFormattedText(activeComments.proposals)}
                  </div>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------------------
                BOX 3: CATEGORY ANALYSIS
               ------------------------------------------------------------ */}
            <section id="box3_category_analysis" className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Box 3: Phân Tích Chi Tiết Từng Hạng Mục Marketing
              </h2>

              {/* Navigation Tabs for Marketing Categories */}
              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: "sov", label: "Share Of Voice (SOV)" },
                      { id: "kol", label: "KOL / KOC" },
                      { id: "tvc", label: "Content & Sáng tạo" },
                      { id: "ads", label: "Paid Ads (Quảng Cáo)" },
                      { id: "seo", label: "SEO Website & Content" },
                      { id: "btl", label: "BTL & Trade Marketing" },
                    ].filter(tab => tabsStatus[tab.id]).map((tab) => (
                      <button
                        key={tab.id}
                        id={`cat_tab_${tab.id}`}
                        onClick={() => setActiveCategoryTab(tab.id as any)}
                        className={`rounded-lg px-3.5 py-2 text-xs font-semibold tracking-tight transition-all ${
                          activeCategoryTab === tab.id
                            ? "bg-slate-900 text-white shadow-md"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Period selection toggle if active tab has monthly accumulation */}
                  {(activeCategoryTab === "ads" || activeCategoryTab === "seo") && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                      <button
                        onClick={() => {
                          const key = activeCategoryTab === "ads" ? "paidAds" : "seo";
                          setCategoryTimeViews({ ...categoryTimeViews, [key]: "week" });
                        }}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all ${
                          categoryTimeViews[activeCategoryTab === "ads" ? "paidAds" : "seo"] === "week"
                            ? "bg-white text-slate-950 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Tuần
                      </button>
                      <button
                        onClick={() => {
                          const key = activeCategoryTab === "ads" ? "paidAds" : "seo";
                          setCategoryTimeViews({ ...categoryTimeViews, [key]: "month" });
                        }}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all ${
                          categoryTimeViews[activeCategoryTab === "ads" ? "paidAds" : "seo"] === "month"
                            ? "bg-white text-slate-950 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Tháng (Lũy kế)
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-6">
                  {/* Category Assessment Comment Box */}
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100">
                      <FileText className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="space-y-1 text-sm text-slate-700 leading-relaxed font-sans">
                      <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                        Đánh giá của nhà phân tích chuyên sâu:
                      </span>
                      <p>{activeComments.categories[activeCategoryTab]}</p>
                    </div>
                  </div>

                  {/* ------------------------------------------------------------
                      CATEGORY VIEW: 1. SHARE OF VOICE (SOV)
                     ------------------------------------------------------------ */}
                  {activeCategoryTab === "sov" && (
                    <div className="grid gap-6 md:grid-cols-12 items-center">
                      <div className="md:col-span-7 h-80 flex flex-col justify-center bg-white border border-slate-100 rounded-xl p-2 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 block px-4 py-2 uppercase tracking-wide">
                          Thị Phần Thảo Luận Thương Hiệu Tuần {selectedTimeline.label.split(" ")[1]}
                        </span>
                        <ResponsiveContainer width="100%" height="85%">
                          <PieChart>
                            <Pie
                              data={sovData}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={95}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {sovData.map((entry, index) => {
                                // Assign distinct colors to major competitors
                                let color = "#94a3b8"; // Gray for other
                                if (entry.name.toLowerCase() === "livotec") color = "#0d9488"; // Teal
                                else if (entry.name.toLowerCase() === "karofi") color = "#2563eb"; // Blue
                                else if (entry.name.toLowerCase() === "kang") color = "#ea580c"; // Orange
                                else if (entry.name.toLowerCase() === "sunhouse") color = "#dc2626"; // Red
                                else if (entry.name.toLowerCase() === "hòa phát") color = "#4f46e5"; // Indigo
                                return <Cell key={`cell-${index}`} fill={color} />;
                              })}
                            </Pie>
                            <Tooltip
                              formatter={(value: any, name: any) => [`${parseFloat(value).toFixed(1)}%`, `Thương hiệu: ${name}`]}
                              contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                            />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Data table */}
                      <div className="md:col-span-5 space-y-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          Bảng Dữ Liệu Thị Phần Thảo Luận (SOV)
                        </span>
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Thương hiệu</th>
                                <th className="px-4 py-3 text-right">Thị phần SOV</th>
                                <th className="px-4 py-3 text-right">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                              {sovData.map((row) => (
                                <tr
                                  key={row.name}
                                  className={`${
                                    row.name.toLowerCase() === selectedBrand.toLowerCase()
                                      ? "bg-slate-50 font-semibold text-slate-950"
                                      : ""
                                  }`}
                                >
                                  <td className="px-4 py-3 font-sans flex items-center gap-2">
                                    <span
                                      className="h-2.5 w-2.5 rounded-full shrink-0"
                                      style={{
                                        backgroundColor:
                                          row.name.toLowerCase() === "livotec" ? "#0d9488" :
                                          row.name.toLowerCase() === "karofi" ? "#2563eb" :
                                          row.name.toLowerCase() === "kang" ? "#ea580c" :
                                          row.name.toLowerCase() === "sunhouse" ? "#dc2626" :
                                          row.name.toLowerCase() === "hòa phát" ? "#4f46e5" : "#94a3b8"
                                      }}
                                    />
                                    {row.name}
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium">{row.formatted}</td>
                                  <td className="px-4 py-3 text-right font-sans">
                                    {row.name.toLowerCase() === "livotec" && <span className="text-[10px] text-teal-600 font-bold uppercase">Nhãn hàng xem</span>}
                                    {row.name.toLowerCase() === "karofi" && <span className="text-[10px] text-blue-600 font-bold uppercase">Nhãn hàng xem</span>}
                                    {row.name.toLowerCase() !== "livotec" && row.name.toLowerCase() !== "karofi" && <span className="text-[10px] text-slate-400">Đối thủ</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------
                      CATEGORY VIEW: 2. KOL / KOC
                     ------------------------------------------------------------ */}
                  {activeCategoryTab === "kol" && (
                    <div className="space-y-6">
                      {brandKolKoc.length === 0 ? (
                        <div id="kol_koc_empty_state" className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                          <Users className="h-12 w-12 text-slate-300 mb-3 animate-pulse" />
                          <h4 className="font-bold text-slate-800 text-sm">Không có dữ liệu KOL/KOC</h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            Thương hiệu <strong>{selectedBrand}</strong> không ghi nhận chiến dịch KOL/KOC nào trong kỳ báo cáo này.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="h-80 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 block pb-4 uppercase tracking-wide">
                              Biểu Đồ Cột So Sánh Chỉ Số KOC/KOL Toàn Chiến Dịch vs Thực Tế
                            </span>
                            <ResponsiveContainer width="100%" height="85%">
                              <BarChart data={brandKolKoc}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="ngành_hàng" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                                <Legend />
                                <Bar dataKey="kpi_toàn_chiến_dịch" name="KPI Toàn chiến dịch" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="tích_lũy_chiến_dịch" name="Lũy kế thực hiện" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="thực_tế_trong_tuần" name="Thực hiện tuần" fill="#10b981" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Data table */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                              Bảng Dữ Liệu Chiến Dịch KOL/KOC
                            </span>
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                                  <tr>
                                    <th className="px-4 py-3">Hạng mục & Kênh</th>
                                    <th className="px-4 py-3">Ngành hàng</th>
                                    <th className="px-4 py-3 text-right">KPI toàn chiến dịch</th>
                                    <th className="px-4 py-3 text-right">Lũy kế thực hiện</th>
                                    <th className="px-4 py-3 text-right">Thực hiện tuần</th>
                                    <th className="px-4 py-3 text-right">Tỷ lệ hoàn thành</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                  {brandKolKoc.map((row, idx) => {
                                    const rate = row.kpi_toàn_chiến_dịch 
                                      ? Math.round(((row.tích_lũy_chiến_dịch || 0) / row.kpi_toàn_chiến_dịch) * 100)
                                      : 0;
                                    return (
                                      <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-semibold text-slate-900">{row.hạng_mục} ({row.kênh_channel})</td>
                                        <td className="px-4 py-3">{row.ngành_hàng}</td>
                                        <td className="px-4 py-3 text-right font-mono font-medium">{row.kpi_toàn_chiến_dịch}</td>
                                        <td className="px-4 py-3 text-right font-mono font-medium text-blue-600">{row.tích_lũy_chiến_dịch}</td>
                                        <td className="px-4 py-3 text-right font-mono font-medium text-emerald-600">{row.thực_tế_trong_tuần}</td>
                                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">{rate}%</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ------------------------------------------------------------
                      CATEGORY VIEW: 3. CONTENT & SÁNG TẠO
                     ------------------------------------------------------------ */}
                  {activeCategoryTab === "tvc" && (
                    <div className="space-y-6">
                      <div className="h-80 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 block pb-4 uppercase tracking-wide">
                          Biểu Đồ Cột So Sánh KPI, Thực Hiện Tuần và Tích Lũy Tháng Theo Từng Hạng Mục Sáng Tạo
                        </span>
                        <ResponsiveContainer width="100%" height="85%">
                          <BarChart data={contentByHạngMục}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                            <Legend />
                            <Bar dataKey="mục_tiêu_target" name="KPI Tuần" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="thực_tế_actual" name="Thực tế tuần" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="tích_lũy_tháng" name="Tích lũy tháng" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Data table */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          Bảng Dữ Liệu Chi Tiết Content & Sáng Tạo
                        </span>
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Hạng mục</th>
                                <th className="px-4 py-3">Kênh & Ngành</th>
                                <th className="px-4 py-3 text-right">KPI Tuần</th>
                                <th className="px-4 py-3 text-right">Thực tế Tuần</th>
                                <th className="px-4 py-3 text-right">Tích lũy Tháng</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {contentRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3 font-semibold text-slate-900">{row.hạng_mục}</td>
                                  <td className="px-4 py-3 text-[11px] font-sans">
                                    <div className="font-medium text-slate-800">{row.ngành_hàng}</div>
                                    <div className="text-slate-400 font-mono whitespace-pre-line">{row.kênh_channel}</div>
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-medium">{row.mục_tiêu_target !== null ? row.mục_tiêu_target : "—"}</td>
                                  <td className="px-4 py-3 text-right font-mono font-medium text-emerald-600">{row.thực_tế_actual !== null ? row.thực_tế_actual : "—"}</td>
                                  <td className="px-4 py-3 text-right font-mono font-medium text-indigo-600">{row.tích_lũy_tháng !== null ? row.tích_lũy_tháng : "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------
                      CATEGORY VIEW: 4. PAID ADS
                     ------------------------------------------------------------ */}
                  {activeCategoryTab === "ads" && (() => {
                    const adsRows = brandDigital.filter((row) => row.hạng_mục === "Paid Ads");
                    const uniqueAdsIndustries = Array.from(new Set(adsRows.map((row) => row.ngành_hàng).filter(Boolean)));
                    
                    const filteredAdsRows = adsRows.filter((row) => {
                      if (selectedAdsIndustry === "Tất cả") return true;
                      return row.ngành_hàng === selectedAdsIndustry;
                    });
                    
                    return (
                      <div className="space-y-6">
                        {/* Selector/dropdown for industries */}
                        {uniqueAdsIndustries.length > 1 && (
                          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200/60 shadow-sm">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
                              Lọc theo ngành hàng:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() => setSelectedAdsIndustry("Tất cả")}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-tight transition-all ${
                                  selectedAdsIndustry === "Tất cả"
                                    ? "bg-slate-900 text-white shadow-md"
                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                              >
                                Tất cả ngành
                              </button>
                              {uniqueAdsIndustries.map((ind) => (
                                <button
                                  key={ind}
                                  onClick={() => setSelectedAdsIndustry(ind)}
                                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-tight transition-all ${
                                    selectedAdsIndustry === ind
                                      ? "bg-slate-900 text-white shadow-md"
                                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                  }`}
                                >
                                  {ind}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="h-80 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center justify-between pb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                              Biểu Đồ Cột Paid Ads {selectedAdsIndustry !== "Tất cả" && `(${selectedAdsIndustry})`}: So Sánh Chỉ Số ({categoryTimeViews.paidAds === "week" ? "Tuần" : "Lũy Kế Tháng"})
                            </span>
                          </div>
                          <ResponsiveContainer width="100%" height="85%">
                            <BarChart
                              data={filteredAdsRows
                                .map((row) => {
                                  const isWeek = categoryTimeViews.paidAds === "week";
                                  let target = isWeek ? row.mục_tiêu_target : row.target_tháng;
                                  let actual = isWeek ? row.thực_tế_actual : row.tích_lũy_tháng;
                                  
                                  if (row.chỉ_số_metric.toUpperCase() === "CPM") {
                                    if (target !== null && target !== undefined) target = target * 1000;
                                    if (actual !== null && actual !== undefined) actual = actual * 1000;
                                  }

                                  return {
                                    name: `${row.kênh_channel} (${row.ngành_hàng}) - ${row.chỉ_số_metric}`,
                                    metric: row.chỉ_số_metric.split(" ")[0],
                                    target: target,
                                    actual: actual,
                                  };
                                })
                                .filter(item => item.metric !== "CPM" && item.metric !== "Frequency" && (item.target !== null || item.actual !== null))
                              }
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                              <YAxis tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val.toLocaleString()} />
                              <Tooltip 
                                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                                formatter={(value: any, name: any, props: any) => {
                                  const metricName = props.payload?.name || "";
                                  if (metricName.includes("spent") || metricName.includes("Spent") || metricName.includes("VNĐ") || metricName.toUpperCase().includes("CPM")) {
                                    return [`${Number(value).toLocaleString()} VNĐ`, name];
                                  }
                                  return [Number(value).toLocaleString(), name];
                                }}
                              />
                              <Legend />
                              <Bar dataKey="target" name="KPI Mục tiêu" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="actual" name="Đạt được" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Data table */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Bảng Chi Tiết Quảng Cáo Paid Ads {selectedAdsIndustry !== "Tất cả" && `(${selectedAdsIndustry})`} ({categoryTimeViews.paidAds === "week" ? "Số liệu Tuần" : "Số liệu Lũy kế Tháng"})
                          </span>
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                  <th className="px-4 py-3">Kênh & Ngành</th>
                                  <th className="px-4 py-3">Chỉ số đo lường</th>
                                  <th className="px-4 py-3 text-right">KPI Mục tiêu</th>
                                  <th className="px-4 py-3 text-right">Kết quả Đạt được</th>
                                  <th className="px-4 py-3 text-right">Tỷ lệ Đạt</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                                {filteredAdsRows.map((row, idx) => {
                                  const isWeek = categoryTimeViews.paidAds === "week";
                                  let target = isWeek ? row.mục_tiêu_target : row.target_tháng;
                                  let actual = isWeek ? row.thực_tế_actual : row.tích_lũy_tháng;
                                  
                                  const isCPM = row.chỉ_số_metric.toUpperCase() === "CPM";
                                  const isAmountSpent = row.chỉ_số_metric.includes("spent") || row.chỉ_số_metric.includes("Spent") || row.chỉ_số_metric.includes("VNĐ");

                                  if (isCPM) {
                                    if (target !== null && target !== undefined) target = target * 1000;
                                    if (actual !== null && actual !== undefined) actual = actual * 1000;
                                  }

                                  const rate = target && actual
                                    ? Math.round((actual / target) * 100)
                                    : null;

                                  let formattedTarget = "—";
                                  let formattedActual = "—";

                                  if (target !== null && target !== undefined) {
                                    if (isAmountSpent || isCPM) {
                                      formattedTarget = `${target.toLocaleString()} VNĐ`;
                                    } else {
                                      formattedTarget = target.toLocaleString();
                                    }
                                  }

                                  if (actual !== null && actual !== undefined) {
                                    if (isAmountSpent || isCPM) {
                                      formattedActual = `${actual.toLocaleString()} VNĐ`;
                                    } else {
                                      formattedActual = actual.toLocaleString();
                                    }
                                  }

                                  return (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-3 font-sans font-semibold text-slate-900">{row.kênh_channel} ({row.ngành_hàng})</td>
                                      <td className="px-4 py-3 font-sans text-slate-500">{row.chỉ_số_metric}</td>
                                      <td className="px-4 py-3 text-right font-medium">{formattedTarget}</td>
                                      <td className="px-4 py-3 text-right font-semibold text-blue-600">{formattedActual}</td>
                                      <td className="px-4 py-3 text-right font-sans font-bold">
                                        {rate !== null ? (
                                          <span className={rate >= 100 ? "text-emerald-600" : rate >= 70 ? "text-amber-500" : "text-rose-500"}>
                                            {rate}%
                                          </span>
                                        ) : "—"}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ------------------------------------------------------------
                      CATEGORY VIEW: 5. SEO WEBSITE & CONTENT
                     ------------------------------------------------------------ */}
                  {activeCategoryTab === "seo" && (
                    <div className="space-y-6">
                      <div className="h-80 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 block pb-4 uppercase tracking-wide">
                          Biểu Đồ Cột SEO Website: Impressions & Organic Traffic ({categoryTimeViews.seo === "week" ? "Tuần" : "Lũy Kế Tháng"})
                        </span>
                        <ResponsiveContainer width="100%" height="85%">
                          <BarChart
                            data={brandDigital
                              .filter((row) => row.hạng_mục === "SEO Website")
                              .map((row) => ({
                                name: row.chỉ_số_metric,
                                target: categoryTimeViews.seo === "week" ? row.mục_tiêu_target : row.target_tháng,
                                actual: categoryTimeViews.seo === "week" ? row.thực_tế_actual : row.tích_lũy_tháng,
                              }))
                            }
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                            <Legend />
                            <Bar dataKey="target" name="Mục tiêu" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="actual" name="Thực tế đạt được" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Content production list */}
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* SEO Metrics Table */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Chỉ Số Lưu Lượng Website (SEO)
                          </span>
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                  <th className="px-4 py-3">Chỉ số</th>
                                  <th className="px-4 py-3 text-right">KPI Mục tiêu</th>
                                  <th className="px-4 py-3 text-right">Thực tế đạt</th>
                                  <th className="px-4 py-3 text-right">Tỷ lệ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                                {brandDigital
                                  .filter((row) => row.hạng_mục === "SEO Website")
                                  .map((row, idx) => {
                                    const isWeek = categoryTimeViews.seo === "week";
                                    const target = isWeek ? row.mục_tiêu_target : row.target_tháng;
                                    const actual = isWeek ? row.thực_tế_actual : row.tích_lũy_tháng;
                                    const rate = target && actual ? Math.round((actual / target) * 100) : 0;
                                    return (
                                      <tr key={idx}>
                                        <td className="px-4 py-3 font-sans font-semibold text-slate-900">{row.chỉ_số_metric}</td>
                                        <td className="px-4 py-3 text-right font-medium">{target?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">{actual?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right font-sans font-bold text-emerald-600">{rate}%</td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* SEO Content Production list */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Số Lượng Bài Viết/Nội Dung SEO Đã Xuất Bản
                          </span>
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                  <th className="px-4 py-3">Ngành hàng</th>
                                  <th className="px-4 py-3 text-right">Mục tiêu tuần</th>
                                  <th className="px-4 py-3 text-right">Đã xuất bản</th>
                                  <th className="px-4 py-3 text-right">Tích lũy tháng</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                                {brandDigital
                                  .filter((row) => row.hạng_mục === "SEO Content" || row.hạng_mục === "Product Page")
                                  .map((row, idx) => (
                                    <tr key={idx}>
                                      <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                                        {row.hạng_mục} ({row.ngành_hàng})
                                      </td>
                                      <td className="px-4 py-3 text-right font-medium">{row.mục_tiêu_target || "—"}</td>
                                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">{row.thực_tế_actual !== null ? row.thực_tế_actual : "—"}</td>
                                      <td className="px-4 py-3 text-right font-medium text-indigo-600">{row.tích_lũy_tháng || "—"}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------
                      CATEGORY VIEW: 6. BTL & TRADE MARKETING
                     ------------------------------------------------------------ */}
                  {activeCategoryTab === "btl" && (
                    <div className="space-y-8">
                      {/* Grid with 2 Charts as requested */}
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Chart 1: Kế hoạch tháng 6 vs Tích lũy tháng 6 */}
                        <div className="h-80 bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                          <span className="text-xs font-bold text-slate-400 block pb-2 uppercase tracking-wide">
                            Biểu Đồ 1: Kế Hoạch Tháng 6 vs Tích Lũy Đạt Được (Cái/Điểm bán)
                          </span>
                          <ResponsiveContainer width="100%" height="85%">
                            <BarChart
                              data={brandBtl
                                .filter((row) => row.kế_hoạch_tháng_6 !== null || row.tích_lũy_tháng !== null)
                                .map((row) => ({
                                  name: `${row.chi_tiết_hạng_mục} ${row.phân_loại ? `(${row.phân_loại})` : ""}`,
                                  plan: row.kế_hoạch_tháng_6 || 0,
                                  accumulated: row.tích_lũy_tháng || 0,
                                }))
                                .slice(0, 5) // Display major 5 for clarity
                              }
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                              <YAxis />
                              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                              <Legend />
                              <Bar dataKey="plan" name="Kế hoạch Tháng 6" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="accumulated" name="Tích lũy đạt được" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Chart 2: Tích lũy tháng 6 vs Thực hiện tháng 5 (So sánh tăng trưởng) */}
                        <div className="h-80 bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                          <span className="text-xs font-bold text-slate-400 block pb-2 uppercase tracking-wide">
                            Biểu Đồ 2: So Sánh Tăng Trưởng Tích Lũy Tháng 6 vs Thực Hiện Tháng 5
                          </span>
                          <ResponsiveContainer width="100%" height="85%">
                            <BarChart
                              data={brandBtl
                                .filter((row) => row.thực_hiện_tháng_5 !== null || row.tích_lũy_tháng !== null)
                                .map((row) => ({
                                  name: `${row.chi_tiết_hạng_mục} ${row.phân_loại ? `(${row.phân_loại})` : ""}`,
                                  mayActual: row.thực_hiện_tháng_5 || 0,
                                  juneAccumulated: row.tích_lũy_tháng || 0,
                                }))
                                .slice(0, 5) // Display same major 5 for parity
                              }
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                              <YAxis />
                              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                              <Legend />
                              <Bar dataKey="mayActual" name="Thực hiện Tháng 5" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="juneAccumulated" name="Tích lũy Tháng 6" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Full Data table */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          Bảng Dữ Liệu BTL, POSM & Trade Marketing Chi Tiết
                        </span>
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Hạng mục lớn</th>
                                <th className="px-4 py-3">Chi tiết & Phân loại</th>
                                <th className="px-4 py-3">Tần suất / Đơn vị</th>
                                <th className="px-4 py-3 text-right">Thực hiện tháng 5</th>
                                <th className="px-4 py-3 text-right">Kế hoạch tháng 6</th>
                                <th className="px-4 py-3 text-right">Tích lũy tháng 6</th>
                                <th className="px-4 py-3 text-right">Đạt kế hoạch</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {brandBtl.map((row, idx) => {
                                const rate = row.kế_hoạch_tháng_6 && row.tích_lũy_tháng
                                  ? Math.round((row.tích_lũy_tháng / row.kế_hoạch_tháng_6) * 100)
                                  : null;
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-semibold text-slate-900">{row.hạng_mục_lớn}</td>
                                    <td className="px-4 py-3 font-sans">
                                      <div className="font-medium text-slate-800">{row.chi_tiết_hạng_mục}</div>
                                      {row.phân_loại && <div className="text-slate-400 text-[10px] font-mono">{row.phân_loại}</div>}
                                    </td>
                                    <td className="px-4 py-3 font-sans text-slate-500">
                                      {row.tần_suất} / <span className="font-mono text-[10px]">{row.đơn_vị_tính}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-medium">{row.thực_hiện_tháng_5 !== null ? row.thực_hiện_tháng_5.toLocaleString() : "—"}</td>
                                    <td className="px-4 py-3 text-right font-mono font-medium">{row.kế_hoạch_tháng_6 !== null ? row.kế_hoạch_tháng_6.toLocaleString() : "—"}</td>
                                    <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-600">{row.tích_lũy_tháng !== null ? row.tích_lũy_tháng.toLocaleString() : "—"}</td>
                                    <td className="px-4 py-3 text-right font-mono font-bold">
                                      {rate !== null ? (
                                        <span className={rate >= 100 ? "text-emerald-600" : rate >= 70 ? "text-amber-500" : "text-rose-500"}>
                                          {rate}%
                                        </span>
                                      ) : "—"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </section>
          </div>
        ) : (
          /* ------------------------------------------------------------
              GIAO DIỆN CONTROL PANEL (BẢNG ĐIỀU KHIỂN RIÊNG BIỆT)
             ------------------------------------------------------------ */
          <div className="space-y-8 animate-fade-in">
            <div id="editor_title_section" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                  <Settings2 className="h-6 w-6 text-indigo-600 animate-spin-slow" />
                  Control Panel & Quản Trị Báo Cáo
                </h2>
                <p className="text-sm text-slate-500">
                  Cung cấp nguồn dữ liệu JSON mới và biên tập trực tiếp các bài nhận định tiếp thị trước khi xuất bản báo cáo.
                </p>
              </div>

              {/* Reset to defaults button */}
              <button
                onClick={handleResetData}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-sm self-start sm:self-auto"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Khôi phục mặc định
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 items-start">
              
              {/* LEFT COLUMN: JSON DATA SOURCE MANAGEMENT (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Option 1: Google Drive Import */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Globe className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      1. Kết nối Google Drive trực tuyến
                    </h3>
                  </div>

                  <form onSubmit={handleDriveImport} className="space-y-3">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Lưu trữ file JSON của bạn trên Google Drive, thiết lập chế độ chia sẻ <strong>&quot;Bất kỳ ai có liên kết đều xem được&quot; (Anyone with link)</strong>, sau đó dán link vào đây:
                    </p>
                    <div className="flex gap-2">
                      <input
                        id="drive_url_input"
                        type="text"
                        value={driveUrl}
                        onChange={(e) => setDriveUrl(e.target.value)}
                        placeholder="Dán link chia sẻ hoặc ID tệp Google Drive..."
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isDriveLoading || !driveUrl.trim()}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition shrink-0"
                      >
                        {isDriveLoading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        Đồng bộ
                      </button>
                    </div>
                  </form>
                  
                  {/* Public Sample Links */}
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                    <span className="font-semibold text-slate-800 block">💡 Cách chuẩn bị Link tệp nhanh:</span>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Bấm nút <span className="font-medium text-slate-800">Chia sẻ (Share)</span> trên file JSON ở Drive của bạn.</li>
                      <li>Chọn <span className="font-medium text-slate-800">Bất kỳ ai có đường liên kết (Anyone with link)</span>.</li>
                      <li>Copy liên kết đó dán vào khung trên và bấm <span className="font-medium text-indigo-600">Đồng bộ</span>.</li>
                    </ul>
                  </div>
                </div>

                {/* Option 2: Paste Raw JSON */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <FileJson className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        2. Soạn thảo hoặc Paste JSON thủ công
                      </h3>
                    </div>
                  </div>

                  <form onSubmit={handleJsonSubmit} className="space-y-3">
                    <div className="relative">
                      <textarea
                        id="json_text_editor"
                        rows={12}
                        value={pastedJson}
                        onChange={(e) => setPastedJson(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-3 font-mono text-[11px] text-slate-800 bg-slate-950 text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 scrollbar"
                      />
                      <span className="absolute bottom-2 right-2 rounded bg-slate-800 px-2 py-0.5 font-mono text-[9px] text-slate-400">
                        JSON Editor
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Cập nhật dữ liệu cấu trúc
                    </button>
                  </form>
                </div>

                {/* Section 3: Quản Lý Người Dùng & Phân Quyền (Only Admin) */}
                {currentUser.role === "Admin" ? (
                  <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Quản lý tài khoản & Phân quyền
                        </h3>
                        <p className="text-[11px] text-slate-500">Thêm, sửa, xóa người dùng hệ thống</p>
                      </div>
                    </div>

                    {/* Add / Edit Form */}
                    <form onSubmit={handleAddOrEditUser} className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <span className="text-xs font-bold text-indigo-900 block uppercase tracking-wider">
                        {editingUsername ? "⚡ Cập nhật người dùng" : "➕ Thêm tài khoản mới"}
                      </span>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Tên hiển thị</label>
                          <input
                            id="manager_name_input"
                            type="text"
                            required
                            value={managerName}
                            onChange={(e) => setManagerName(e.target.value)}
                            placeholder="Ví dụ: Nguyễn Văn A"
                            className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Tên đăng nhập (Email)</label>
                          <input
                            id="manager_username_input"
                            type="text"
                            required
                            disabled={!!editingUsername}
                            value={managerUsername}
                            onChange={(e) => setManagerUsername(e.target.value)}
                            placeholder="Ví dụ: name@gmail.com"
                            className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Mật khẩu</label>
                          <input
                            id="manager_password_input"
                            type="password"
                            required={!editingUsername}
                            value={managerPassword}
                            onChange={(e) => setManagerPassword(e.target.value)}
                            placeholder={editingUsername ? "Để trống nếu giữ nguyên..." : "Nhập mật khẩu..."}
                            className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Vai trò phân quyền</label>
                          <select
                            id="manager_role_select"
                            value={managerRole}
                            onChange={(e) => setManagerRole(e.target.value as any)}
                            className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                          >
                            <option value="Viewer">Viewer (Chỉ xem báo cáo)</option>
                            <option value="Editor">Editor (Biên tập dữ liệu)</option>
                            <option value="Admin">Admin (Toàn quyền hệ thống)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          id="btn_submit_manager"
                          className="flex-1 rounded bg-indigo-600 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition cursor-pointer"
                        >
                          {editingUsername ? "Lưu thay đổi" : "Tạo tài khoản"}
                        </button>
                        {editingUsername && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUsername(null);
                              setManagerUsername("");
                              setManagerPassword("");
                              setManagerName("");
                              setManagerRole("Viewer");
                            }}
                            className="rounded bg-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-400 transition cursor-pointer"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </form>

                    {/* Users list table */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Danh sách tài khoản ({users.length})
                      </span>
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white max-h-56 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-[10px]">Tài khoản</th>
                              <th className="px-3 py-2 text-[10px]">Vai trò</th>
                              <th className="px-3 py-2 text-right text-[10px]">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                            {users.map((u) => (
                              <tr key={u.username} className="hover:bg-slate-50 transition-colors">
                                <td className="px-3 py-2">
                                  <span className="font-semibold text-slate-900 block leading-tight">{u.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block leading-tight">{u.username}</span>
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-extrabold ${
                                    u.role === "Admin" ? "bg-indigo-100 text-indigo-700" :
                                    u.role === "Editor" ? "bg-emerald-100 text-emerald-700" :
                                    "bg-amber-100 text-amber-700"
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right space-x-1.5">
                                  <button
                                    onClick={() => handleStartEditUser(u)}
                                    className="text-indigo-600 hover:text-indigo-900 text-[11px] font-semibold cursor-pointer"
                                    title="Sửa phân quyền"
                                  >
                                    Sửa
                                  </button>
                                  {/* Cannot delete oneself */}
                                  {u.username !== currentUser.username ? (
                                    <button
                                      onClick={() => handleDeleteUser(u.username)}
                                      className="text-rose-600 hover:text-rose-900 text-[11px] font-semibold cursor-pointer"
                                      title="Xóa người dùng"
                                    >
                                      Xóa
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-[11px] select-none">Bản thân</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-slate-400" />
                      <h3 className="font-bold text-slate-700 text-sm">
                        Phân quyền & Tài khoản
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Bạn đang đăng nhập với quyền <strong className="text-emerald-600">{currentUser.role}</strong>. Chỉ có tài khoản Quản trị viên (Admin) mới có thể xem danh sách và phân quyền quản trị tài khoản người dùng khác.
                    </p>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: REVIEWS & SUGGESTIONS WRITER (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Assessment Editor Box */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-base">
                        Biên tập nhận định & Đề xuất tuần này
                      </h3>
                      <p className="text-xs text-slate-500">
                        Đang sửa nhận xét cho nhãn hàng: <strong className="text-indigo-600">{selectedBrand.toUpperCase()}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* AI Suggestion Generator */}
                      <button
                        onClick={handleAiSuggestions}
                        disabled={isAiLoading}
                        className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 shadow-sm transition"
                      >
                        {isAiLoading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        💡 Gợi ý bởi AI
                      </button>

                      {/* State status badge */}
                      {hasUnpublishedChanges ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600 border border-amber-200 uppercase tracking-wider shrink-0">
                          Bản Nháp (Draft)
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-200 uppercase tracking-wider shrink-0">
                          Đã Xuất Bản (Live)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Executive Summary: Evaluation */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Đánh giá Thực Trạng Triển Khai (Box 2 - Cột 1)
                      </label>
                      <textarea
                        id="edit_eval_textarea"
                        rows={3}
                        value={draftComments[selectedBrand].evaluation}
                        onChange={(e) => handleDraftCommentChange("evaluation", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* Executive Summary: Proposals */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Đề xuất Tối Ưu Tuần Kế Tiếp (Box 2 - Cột 2)
                      </label>
                      <textarea
                        id="edit_prop_textarea"
                        rows={3}
                        value={draftComments[selectedBrand].proposals}
                        onChange={(e) => handleDraftCommentChange("proposals", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* Category Analysis Individual Tab Comments */}
                    <div className="border-t border-slate-100 pt-4 space-y-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Nhận xét chi tiết cho từng danh mục (Box 3)
                      </span>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* SOV */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Percent className="h-3.5 w-3.5 text-indigo-500" />
                            Nhận xét Share of Voice (SOV)
                          </label>
                          <textarea
                            id="edit_sov_textarea"
                            rows={3}
                            value={draftComments[selectedBrand].categories.sov}
                            onChange={(e) => handleDraftCategoryChange("sov", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        {/* KOL/KOC */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-indigo-500" />
                            Nhận xét KOL / KOC
                          </label>
                          <textarea
                            id="edit_kol_textarea"
                            rows={3}
                            value={draftComments[selectedBrand].categories.kol_koc}
                            onChange={(e) => handleDraftCategoryChange("kol_koc", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        {/* TVC */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Video className="h-3.5 w-3.5 text-indigo-500" />
                            Nhận xét Clip TVC
                          </label>
                          <textarea
                            id="edit_tvc_textarea"
                            rows={3}
                            value={draftComments[selectedBrand].categories.tvc}
                            onChange={(e) => handleDraftCategoryChange("tvc", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        {/* Paid Ads */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Target className="h-3.5 w-3.5 text-indigo-500" />
                            Nhận xét Paid Ads (Quảng cáo)
                          </label>
                          <textarea
                            id="edit_ads_textarea"
                            rows={3}
                            value={draftComments[selectedBrand].categories.paid_ads}
                            onChange={(e) => handleDraftCategoryChange("paid_ads", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        {/* SEO */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5 text-indigo-500" />
                            Nhận xét SEO Website & Content
                          </label>
                          <textarea
                            id="edit_seo_textarea"
                            rows={3}
                            value={draftComments[selectedBrand].categories.seo}
                            onChange={(e) => handleDraftCategoryChange("seo", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        {/* BTL & Trade */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                            Nhận xét BTL & Trade Marketing
                          </label>
                          <textarea
                            id="edit_btl_textarea"
                            rows={3}
                            value={draftComments[selectedBrand].categories.btl_trade}
                            onChange={(e) => handleDraftCategoryChange("btl_trade", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Draft to Live reporting database */}
                  <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        // Revert draft changes back to published
                        setDraftComments(JSON.parse(JSON.stringify(publishedComments)));
                        setHasUnpublishedChanges(false);
                        triggerNotification("success", "Đã hủy bỏ toàn bộ các thay đổi nháp.");
                      }}
                      disabled={!hasUnpublishedChanges}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                    >
                      Hủy bản nháp
                    </button>
                    
                    <button
                      id="publish_btn"
                      onClick={handlePublish}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-md transition"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Xuất bản báo cáo chính thức
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
      </main>

      {/* Footer credits */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-400 sm:px-6">
          <p>© 2026 Livotec & Karofi Marketing Reporting Console. All rights reserved.</p>
          <p className="mt-1 font-mono">Dữ liệu phân tích tuần • Thiết kế với triết lý tối giản tinh tế</p>
        </div>
      </footer>
    </div>
  );
}
