// ---------------------------------------------------------------------------
// Minimal fetch helper for the Social Report feature — reads the same
// "marketing_auth_token" localStorage key App.tsx's safeFetchJson uses, so a
// logged-in session carries over automatically. Kept as its own small copy
// rather than importing from App.tsx (a 5000+ line file) to avoid a
// circular-import edge case and keep this new feature's footprint isolated.
// ---------------------------------------------------------------------------

function getAuthToken(): string | null {
  return typeof localStorage !== "undefined" ? localStorage.getItem("marketing_auth_token") : null;
}

export async function socialReportFetch(url: string, options?: RequestInit): Promise<any> {
  const token = getAuthToken();
  const headers = { ...(options?.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const response = await fetch(url, { ...options, headers });
  const text = await response.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    const err: any = new Error(`Phản hồi không hợp lệ từ máy chủ (status ${response.status}).`);
    err.status = response.status;
    throw err;
  }
  if (!response.ok) {
    const err: any = new Error(parsed?.error || `Lỗi máy chủ (status ${response.status}).`);
    err.status = response.status;
    throw err;
  }
  return parsed;
}
