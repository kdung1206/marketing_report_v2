import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { normalizeMarketingData } from "./src/data";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Persistent JSON Database Configuration
const DB_FILE_PATH = path.join(process.cwd(), "src", "db_store.json");
const INITIAL_DATA_PATH = path.join(process.cwd(), "src", "initial_data.json");

function getDatabaseData() {
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      console.error("Failed to read/parse db_store.json, falling back to initial data:", err);
    }
  }
  
  // Fallback to initial_data
  try {
    const raw = fs.readFileSync(INITIAL_DATA_PATH, "utf8");
    const data = JSON.parse(raw);
    // Write it initially so db_store.json exists
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
    return data;
  } catch (err) {
    console.error("Failed to read initial_data.json:", err);
    return { digital_marketing: [], kol_koc: [], btl_trade: [], monthly_ooh_pr: [] };
  }
}

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not configured or uses placeholder value.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini API Client:", error);
}

// API: Fetch file from Google Drive via direct link
app.post("/api/fetch-drive", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Vui lòng cung cấp link Google Drive" });
    }

    // Regular expressions to extract file ID from Google Drive link
    const regId1 = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const regId2 = /[?&]id=([a-zA-Z0-9_-]+)/;
    const regId3 = /\/folders\/([a-zA-Z0-9_-]+)/; // Folders are not direct files, let the user know
    
    let fileId = "";
    const match1 = url.match(regId1);
    const match2 = url.match(regId2);
    
    if (match1 && match1[1]) {
      fileId = match1[1];
    } else if (match2 && match2[1]) {
      fileId = match2[1];
    } else {
      // Direct string can be treated as ID
      fileId = url.trim();
    }

    if (url.includes("/folders/")) {
      return res.status(400).json({ error: "Đường dẫn bạn cung cấp là Thư mục (Folder). Vui lòng cung cấp link của một tệp tin (File) JSON cụ thể ở chế độ công khai." });
    }

    if (!fileId || fileId.length < 10) {
      return res.status(400).json({ error: "Không tìm thấy ID tệp Google Drive hợp lệ từ đường dẫn." });
    }

    // Google Drive direct export download link
    const downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
    console.log(`Attempting to fetch Google Drive file ID: ${fileId} from ${downloadUrl}`);

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Google Drive trả về mã lỗi: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    // Verify if downloaded content is actually HTML (often Google login or permission screen)
    if (text.includes("<!DOCTYPE html>") || text.includes("<html") || text.includes("google.com/accounts/Login")) {
      return res.status(401).json({
        error: "Không thể tải trực tuyến. Tệp Google Drive phải được chia sẻ ở chế độ 'Bất kỳ ai có đường link đều có thể xem' (Anyone with link can view). Vui lòng kiểm tra lại quyền chia sẻ trên Google Drive hoặc copy-paste thủ công."
      });
    }

    try {
      const jsonData = JSON.parse(text);
      return res.json({ success: true, data: jsonData });
    } catch (parseError) {
      console.error("Failed to parse fetched content as JSON. Head:", text.substring(0, 200));
      return res.status(422).json({
        error: "Tải tệp thành công nhưng nội dung tệp không phải định dạng JSON hợp lệ. Vui lòng kiểm tra lại cấu trúc file.",
        preview: text.substring(0, 200)
      });
    }

  } catch (error: any) {
    console.error("Fetch Drive error:", error);
    return res.status(500).json({ error: `Lỗi kết nối tệp: ${error.message || error}` });
  }
});

// API: Call Gemini to analyze marketing report
app.post("/api/analyze", async (req, res) => {
  try {
    const { data, brand } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Không có dữ liệu đầu vào để phân tích." });
    }

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API chưa được định cấu hình. Bạn hãy cấu hình GEMINI_API_KEY trong phần Secrets, hoặc sử dụng các bản biên tập thủ công cực kỳ chi tiết có sẵn.",
      });
    }

    const brandName = brand || "Livotec";
    const dataString = typeof data === "string" ? data : JSON.stringify(data, null, 2);

    const prompt = `Bạn là một Chuyên gia Phân tích Dữ liệu Marketing (Marketing Data Analyst) chuyên nghiệp.
Hãy đọc và phân tích chuyên sâu báo cáo chiến dịch tuần này của thương hiệu "${brandName}" dựa trên dữ liệu JSON được cung cấp dưới đây.

Dưới đây là dữ liệu báo cáo chiến dịch:
${dataString}

YÊU CẦU:
Hãy xuất ra nhận định phân tích bằng tiếng Việt theo cấu trúc JSON định dạng chính xác sau đây. Các nhận xét cần chuyên sâu, kết hợp các con số thực tế có trong dữ liệu (ví dụ: số bài viết, chi phí đã tiêu, impressions, reach, CPM, organic traffic...) và đưa ra phân tích sắc bén, lời khuyên thực tế nhất.

Cấu trúc JSON phản hồi bắt buộc phải đúng 100% mẫu dưới đây, không chứa bất kỳ văn bản nào khác ngoài JSON (không bọc trong dấu markdown \`\`\`json):
{
  "executiveSummary": {
    "evaluation": "Nhận xét tổng quan cực kỳ chi tiết, đánh giá khách quan về thực trạng triển khai trong tuần (những điểm sáng và hạn chế cụ thể của thương hiệu ${brandName}). Sử dụng số liệu chứng minh từ các mảng SEO, Ads, Content, SOV.",
    "proposals": "Các đề xuất cụ thể, hành động thiết thực cho tuần kế tiếp để tối ưu hóa hiệu quả (đưa ra ít nhất 3 đề xuất ngắn gọn, trực diện)."
  },
  "categoryAnalysis": {
    "sov": "Nhận xét phân tích ngắn gọn, súc tích kèm số liệu về thị phần thảo luận (Share of Voice) của thương hiệu ${brandName} so với các đối thủ cạnh tranh như Karofi, Kangaroo, Sunhouse, Hòa Phát...",
    "kol_koc": "Nhận xét về việc triển khai KOL/KOC trong tuần của ${brandName}. Đối chiếu KPI toàn chiến dịch, tích lũy chiến dịch và số thực hiện tuần này.",
    "tvc": "Nhận xét ngắn gọn về tiến độ sản xuất và phát hành Clip TVC trong tuần. Nêu rõ ngành hàng nào đạt/không đạt KPI và tiến độ tích lũy.",
    "paid_ads": "Phân tích hiệu quả Paid Ads trong tuần (về Amount spent, Impressions, Reach, CPM, Frequency), đánh giá mức độ phủ thương hiệu và tối ưu chi phí.",
    "seo": "Phân tích hiệu quả SEO Website & SEO Content trong tuần (Traffic Organic, Impressions Organic, số lượng bài viết). So sánh thực tế đạt được so với mục tiêu đề ra.",
    "btl_trade": "Đánh giá chi tiết hoạt động BTL & Trade Marketing của thương hiệu ${brandName} (biển bảng POSM, quầy kệ, kiểm soát hình ảnh điểm bán, sự kiện activation/workshop). So sánh kế hoạch tháng 6, lũy kế đạt được và đối chiếu tăng trưởng so với thực tế thực hiện tháng 5."
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    try {
      const parsed = JSON.parse(text.trim());
      return res.json({ success: true, analysis: parsed });
    } catch (e) {
      console.error("Gemini raw text parse failure:", text);
      // Fallback: search for first { and last } in case it wrapped in markdown
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start >= 0 && end > start) {
        try {
          const parsedFixed = JSON.parse(text.substring(start, end + 1));
          return res.json({ success: true, analysis: parsedFixed });
        } catch (innerErr) {
          throw new Error("Không thể phân tích phản hồi JSON từ AI.");
        }
      }
      throw new Error("Phản hồi của AI không đúng định dạng JSON.");
    }

  } catch (error: any) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ error: error.message || "Lỗi xử lý phân tích AI" });
  }
});

// GET /api/get-data
app.get("/api/get-data", (req, res) => {
  try {
    const data = getDatabaseData();
    const normalized = normalizeMarketingData(data);
    return res.json({ success: true, data: normalized });
  } catch (err: any) {
    console.error("GET /api/get-data error:", err);
    return res.status(500).json({ error: `Lỗi đọc cơ sở dữ liệu: ${err.message}` });
  }
});

// POST /api/sync-data
app.post("/api/sync-data", (req, res) => {
  try {
    const { newData } = req.body;
    if (!newData) {
      return res.status(400).json({ error: "Không tìm thấy dữ liệu đồng bộ mới." });
    }

    // 1. Normalize the incoming new data
    const normalizedNew = normalizeMarketingData(newData);

    // 2. Load the existing database data
    const currentDb = normalizeMarketingData(getDatabaseData());

    // 3. Helper to merge lists type-safely by replacing existing entries for matching weeks
    function mergeCategory<T extends { week: string }>(currentList: T[], newList: T[]): T[] {
      if (!newList || newList.length === 0) return currentList;
      const incomingWeeks = new Set<string>();
      newList.forEach((row) => {
        if (row.week) incomingWeeks.add(row.week);
      });
      const filtered = currentList.filter((row) => !incomingWeeks.has(row.week));
      return [...filtered, ...newList];
    }

    const mergedData = {
      digital_marketing: mergeCategory(currentDb.digital_marketing, normalizedNew.digital_marketing),
      kol_koc: mergeCategory(currentDb.kol_koc, normalizedNew.kol_koc),
      btl_trade: mergeCategory(currentDb.btl_trade, normalizedNew.btl_trade),
      monthly_ooh_pr: mergeCategory(currentDb.monthly_ooh_pr, normalizedNew.monthly_ooh_pr),
    };

    // 4. Save the fully merged and normalized dataset back to the database file
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(mergedData, null, 2), "utf8");

    return res.json({ success: true, data: mergedData });
  } catch (err: any) {
    console.error("POST /api/sync-data error:", err);
    return res.status(500).json({ error: `Lỗi đồng bộ hóa dữ liệu vào DB: ${err.message}` });
  }
});

// POST /api/reset-data
app.post("/api/reset-data", (req, res) => {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      fs.unlinkSync(DB_FILE_PATH);
    }
    const data = getDatabaseData();
    const normalized = normalizeMarketingData(data);
    return res.json({ success: true, data: normalized });
  } catch (err: any) {
    console.error("POST /api/reset-data error:", err);
    return res.status(500).json({ error: `Lỗi khôi phục cơ sở dữ liệu: ${err.message}` });
  }
});

// Start server
async function startServer() {
  // Vite dev server integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
