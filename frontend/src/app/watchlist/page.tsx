"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Topic, type Article } from "@/lib/api";

const RISK_COLORS: Record<string, { border: string; badge: string; bg: string }> = {
  high:   { border: "#dc2626", badge: "#fef2f2", bg: "#dc2626" },
  medium: { border: "#f59e0b", badge: "#fffbeb", bg: "#f59e0b" },
  low:    { border: "#22c55e", badge: "#f0fdf4", bg: "#22c55e" },
};

const ALERT_FREQ = ["ทันที", "รายวัน", "รายสัปดาห์", "ปิด"];

// Mock watchlist — in production this comes from user account
const DEFAULT_WATCHLIST = ["urea", "rubber", "palm-oil", "china-export"];

export default function WatchlistPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [loading, setLoading] = useState(true);
  const [freq, setFreq] = useState("รายวัน");

  useEffect(() => {
    Promise.all([api.topics(), api.articles()])
      .then(([t, a]) => { setTopics(t); setArticles(a); })
      .finally(() => setLoading(false));
  }, []);

  const watched = topics.filter(t => watchlist.includes(t.slug));
  const suggested = topics.filter(t => !watchlist.includes(t.slug)).slice(0, 5);

  function toggle(slug: string) {
    setWatchlist(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  }

  function latestForTopic(topic: Topic): Article | undefined {
    return articles.find(a =>
      a.keywords.some(k => topic.synonyms.some(s => k.toLowerCase().includes(s.toLowerCase())))
      || a.category.some(c => c.toLowerCase().includes(topic.slug.split("-")[0]))
    );
  }

  const riskLevel = (topic: Topic) => {
    const a = latestForTopic(topic);
    if (!a) return "low";
    if (a.trust_score === "high" && (topic.slug === "urea" || topic.slug === "china-export")) return "high";
    return "medium";
  };

  return (
    <div>
      <div style={{ height: 44, background: "#fff" }} />

      <div style={{ background: "#fff", padding: "12px 16px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: -0.4 }}>Watchlist ของฉัน</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>ติดตาม {watchlist.length} หัวข้อ</div>
        </div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14, background: "#e0e0e6" }} />)
        ) : (
          <>
            {watched.map(topic => {
              const level = riskLevel(topic);
              const colors = RISK_COLORS[level];
              const latest = latestForTopic(topic);
              const levelLabel = level === "high" ? "สูง" : level === "medium" ? "กลาง" : "ต่ำ";
              const levelIcon = level === "high" ? "🔴" : level === "medium" ? "🟡" : "🟢";

              return (
                <div key={topic.slug} style={{ background: "#fff", borderRadius: 14, padding: 14, borderLeft: `4px solid ${colors.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{topic.emoji} {topic.name_th}</div>
                      <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                        {latest ? `อัพเดทล่าสุด: ${topic.name}` : "ยังไม่มีข้อมูลใหม่"}
                      </div>
                    </div>
                    <div style={{ background: colors.badge, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: colors.bg }}>
                      {levelIcon} {levelLabel}
                    </div>
                  </div>

                  {latest && (
                    <div style={{ fontSize: 12, color: "#555", marginTop: 8, lineHeight: 1.5 }}>
                      {latest.summary_ai?.slice(0, 100) || latest.summary_short?.slice(0, 100)}...
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <Link href={`/search?q=${encodeURIComponent(topic.name_th)}`} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "7px 12px", borderRadius: 10, background: "#eef2ff", color: "#4f46e5", fontSize: 12, fontWeight: 600 }}>ดูข่าว</div>
                    </Link>
                    <div style={{ padding: "7px 12px", borderRadius: 10, background: "#f3f4f6", color: "#555", fontSize: 12, fontWeight: 600 }}>🔔 {freq}</div>
                    <button
                      onClick={() => toggle(topic.slug)}
                      style={{ padding: "7px 12px", borderRadius: 10, background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}
                    >
                      ✕ ยกเลิก
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Alert settings */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>🔔</span>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.5 }}>ตั้งค่าการแจ้งเตือน</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, color: "#333" }}>ความถี่การแจ้งเตือน</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {ALERT_FREQ.map(f => (
                      <button
                        key={f}
                        onClick={() => setFreq(f)}
                        style={{
                          padding: "5px 10px", borderRadius: 16, fontSize: 11, fontWeight: 600, border: "1.5px solid",
                          borderColor: freq === f ? "#4f46e5" : "#e0e0e0",
                          background: freq === f ? "#4f46e5" : "#fff",
                          color: freq === f ? "#fff" : "#555",
                          cursor: "pointer",
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, color: "#333" }}>ระดับขั้นต่ำ</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5" }}>กลางขึ้นไป ▾</div>
                </div>
              </div>
            </div>

            {/* Suggested */}
            {suggested.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.5, marginBottom: 8 }}>หัวข้อแนะนำ</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {suggested.map(t => (
                    <button
                      key={t.slug}
                      onClick={() => toggle(t.slug)}
                      style={{ padding: "8px 14px", borderRadius: 20, background: "#fff", border: "1.5px solid #e0e0e0", fontSize: 12, fontWeight: 600, color: "#444", cursor: "pointer" }}
                    >
                      {t.emoji} {t.name_th} +
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
