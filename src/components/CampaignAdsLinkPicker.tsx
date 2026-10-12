import React, { useEffect, useMemo, useState } from "react";
import { X, Search, PlusCircle, AlertCircle } from "lucide-react";
import { safeFetchJson } from "../App";

type AdsChannel = "facebook" | "google" | "tiktok";

interface AdsOption {
  channel: AdsChannel;
  campaign_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  first_date: string;
  last_date: string;
}

interface ExistingLink {
  id: string;
  channel: AdsChannel;
  ads_campaign_name: string;
}

const CHANNEL_LABEL: Record<AdsChannel, string> = { facebook: "Facebook", google: "Google", tiktok: "TikTok" };

const keyOf = (channel: AdsChannel, name: string) => `${channel}|${name}`;

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtDate(s: string): string {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

// Opens when a Calendar campaign is switched to Live (and from the campaign's
// drilldown): lists the real ad campaigns synced for the campaign's brand, with
// their figures, so the Editor ticks the ones running under this campaign. The
// links are what the drilldown's "Chi phí quảng cáo" tab tracks. Saving applies
// the difference against the existing links (adds new ticks, removes un-ticked
// ones) through the same POST/DELETE endpoints the manual form uses.
export default function CampaignAdsLinkPicker({
  campaign,
  existingLinks,
  onClose,
  onSaved,
}: {
  campaign: { id: string; name: string; brand: string; start_date: string; end_date: string };
  existingLinks: ExistingLink[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [options, setOptions] = useState<AdsOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTime, setAllTime] = useState(false);
  const [channelFilter, setChannelFilter] = useState<AdsChannel | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(existingLinks.map((l) => keyOf(l.channel, l.ads_campaign_name))));
  const [manualChannel, setManualChannel] = useState<AdsChannel>("facebook");
  const [manualName, setManualName] = useState("");
  const [manualExtras, setManualExtras] = useState<{ channel: AdsChannel; name: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Window around the campaign: starts 14 days before it (ads are often
  // created ahead of the calendar date) and runs to the later of its end / today.
  const { since, until } = useMemo(() => {
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);
    const from = new Date(Number.isNaN(start.getTime()) ? Date.now() : start.getTime() - 14 * 24 * 3600 * 1000);
    const to = new Date(Math.max(Number.isNaN(end.getTime()) ? 0 : end.getTime(), Date.now()));
    return { since: toDateStr(from), until: toDateStr(to) };
  }, [campaign.start_date, campaign.end_date]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ brand: campaign.brand });
        if (!allTime) {
          qs.set("since", since);
          qs.set("until", until);
        }
        const result = await safeFetchJson(`/api/campaign/ads-campaign-options?${qs.toString()}`);
        if (cancelled) return;
        if (result.success) setOptions(result.options || []);
        else setError(result.error || "Không tải được danh sách chiến dịch quảng cáo.");
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Không tải được danh sách chiến dịch quảng cáo.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaign.brand, allTime, since, until]);

  // Rows to show: synced campaigns in the window, plus anything already linked
  // or typed in by hand that has no data in the window (so it can still be
  // un-ticked and is never silently dropped from the list).
  const rows = useMemo(() => {
    const known = new Set(options.map((o) => keyOf(o.channel, o.campaign_name)));
    const extras: AdsOption[] = [];
    const addExtra = (channel: AdsChannel, name: string) => {
      const k = keyOf(channel, name);
      if (known.has(k)) return;
      known.add(k);
      extras.push({ channel, campaign_name: name, spend: 0, impressions: 0, clicks: 0, conversions: 0, first_date: "", last_date: "" });
    };
    existingLinks.forEach((l) => addExtra(l.channel, l.ads_campaign_name));
    manualExtras.forEach((m) => addExtra(m.channel, m.name));
    const q = search.trim().toLowerCase();
    return [...extras, ...options].filter(
      (o) => (channelFilter === "all" || o.channel === channelFilter) && (!q || o.campaign_name.toLowerCase().includes(q))
    );
  }, [options, existingLinks, manualExtras, channelFilter, search]);

  function toggle(channel: AdsChannel, name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      const k = keyOf(channel, name);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  function addManual() {
    const name = manualName.trim();
    if (!name) return;
    setManualExtras((prev) => (prev.some((m) => m.channel === manualChannel && m.name === name) ? prev : [...prev, { channel: manualChannel, name }]));
    setSelected((prev) => new Set(prev).add(keyOf(manualChannel, name)));
    setManualName("");
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    const existingKeys = new Map(existingLinks.map((l) => [keyOf(l.channel, l.ads_campaign_name), l]));
    const toAdd = Array.from<string>(selected).filter((k) => !existingKeys.has(k));
    const toRemove = existingLinks.filter((l) => !selected.has(keyOf(l.channel, l.ads_campaign_name)));
    const failures: string[] = [];

    await Promise.all([
      ...toAdd.map(async (k) => {
        const sep = k.indexOf("|");
        const channel = k.slice(0, sep) as AdsChannel;
        const name = k.slice(sep + 1);
        try {
          const result = await safeFetchJson(`/api/campaign/campaigns/${campaign.id}/ads-links`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channel, ads_campaign_name: name }),
          });
          if (!result.success) failures.push(`${name}: ${result.error || "không gắn được"}`);
        } catch (err: any) {
          failures.push(`${name}: ${err.message}`);
        }
      }),
      ...toRemove.map(async (l) => {
        try {
          const result = await safeFetchJson(`/api/campaign/ads-links/${l.id}`, { method: "DELETE" });
          if (!result.success) failures.push(`${l.ads_campaign_name}: ${result.error || "không gỡ được"}`);
        } catch (err: any) {
          failures.push(`${l.ads_campaign_name}: ${err.message}`);
        }
      }),
    ]);

    setIsSaving(false);
    if (failures.length > 0) {
      setError(`Một số liên kết chưa lưu được — ${failures.join("; ")}`);
      return;
    }
    onSaved();
  }

  const fmtMoney = (n: number) => `${Math.round(n).toLocaleString("vi-VN")}đ`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Gắn chiến dịch quảng cáo</h4>
            <p className="text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">{campaign.name}</span> · {campaign.brand} — chọn các chiến dịch đang chạy cho campaign này để theo dõi chi phí và kết quả triển khai.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Đóng">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 border-b border-slate-100 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              {(["all", "facebook", "google", "tiktok"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChannelFilter(c)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${channelFilter === c ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {c === "all" ? "Tất cả" : CHANNEL_LABEL[c]}
                </button>
              ))}
            </div>
            <div className="relative min-w-[180px] flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên chiến dịch..."
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-7 pr-2 text-xs focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <input type="checkbox" checked={allTime} onChange={(e) => setAllTime(e.target.checked)} />
              Xem toàn bộ thời gian
            </label>
          </div>
          <p className="text-[11px] text-slate-400">
            {allTime ? "Số liệu toàn bộ lịch sử đã đồng bộ" : `Số liệu từ ${fmtDate(since)} đến ${fmtDate(until)}`} (chỉ chiến dịch thuộc brand {campaign.brand}).
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {error && (
            <div className="mb-2 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {isLoading ? (
            <p className="py-6 text-center text-xs text-slate-400">Đang tải danh sách chiến dịch quảng cáo...</p>
          ) : rows.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              Chưa có chiến dịch quảng cáo nào của brand này trong khoảng thời gian trên. Bấm "Xem toàn bộ thời gian", hoặc nhập tên thủ công bên dưới.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-slate-400">
                  <th className="w-6 pb-1.5"></th>
                  <th className="pb-1.5 font-medium">Kênh</th>
                  <th className="pb-1.5 font-medium">Tên chiến dịch</th>
                  <th className="pb-1.5 text-right font-medium">Chi phí</th>
                  <th className="pb-1.5 text-right font-medium">Leads/KQ</th>
                  <th className="pb-1.5 text-right font-medium">Dữ liệu mới nhất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((o) => {
                  const k = keyOf(o.channel, o.campaign_name);
                  const checked = selected.has(k);
                  return (
                    <tr key={k} onClick={() => toggle(o.channel, o.campaign_name)} className={`cursor-pointer hover:bg-slate-50 ${checked ? "bg-indigo-50/40" : ""}`}>
                      <td className="py-1.5">
                        <input type="checkbox" checked={checked} onChange={() => toggle(o.channel, o.campaign_name)} onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td className="py-1.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">{CHANNEL_LABEL[o.channel]}</span>
                      </td>
                      <td className="py-1.5 pr-2 font-medium text-slate-700">{o.campaign_name}</td>
                      <td className="py-1.5 text-right text-slate-600">{o.last_date ? fmtMoney(o.spend) : "—"}</td>
                      <td className="py-1.5 text-right text-slate-600">{o.last_date ? o.conversions.toLocaleString("vi-VN") : "—"}</td>
                      <td className="py-1.5 text-right text-slate-500">{o.last_date ? fmtDate(o.last_date) : <span className="text-amber-600">chưa có dữ liệu</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-2 border-t border-slate-100 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Chưa thấy trong danh sách? Nhập tên:</span>
            <select value={manualChannel} onChange={(e) => setManualChannel(e.target.value as AdsChannel)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">
              <option value="facebook">Facebook</option>
              <option value="google">Google</option>
              <option value="tiktok">TikTok</option>
            </select>
            <input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addManual();
                }
              }}
              placeholder="Tên chiến dịch đúng như trên nền tảng"
              className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none"
            />
            <button type="button" onClick={addManual} disabled={!manualName.trim()} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              <PlusCircle className="h-3 w-3" /> Thêm
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Đã chọn {selected.size} chiến dịch</span>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Để sau
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSaving ? "Đang lưu..." : "Lưu liên kết"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
