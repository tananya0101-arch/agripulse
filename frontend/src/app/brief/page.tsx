"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Brief } from "@/lib/api";
import PriceCard from "@/components/PriceCard";

const levelStyle: Record<string, { bg: string; border: string; icon: string; titleColor: string; textColor: string }> = {
  low:      { bg: "#f0fdf4", border: "#22c55e", icon: "🟢", titleColor: "#166534", textColor: "#166534" },
  medium:   { bg: "#fffbeb", border: "#f59e0b", icon: "🟡", titleColor: "#92400e", textColor: "#78350f" },
  high:     { bg: "#fff7ed", border: "#ea580c", icon: "🔴", titleColor: "#9a3412", textColor: "#7c2d12" },
  critical: { bg: "#fef2f2", border: "#dc2626", icon: "🚨", titleColor: "#7f1d1d", textColor: "#7f1d1d" },
};

export default function BriefPage() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.brief().then(setBrief).finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("th-TH", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (loading) return (
    <div style={{ padding: 16 }}>
      <div style={{ height: 44 }} />
      {[80, 120, 100, 140].map((h, i) => (
        <div key={i} className="skeleton" style={{ height: h, borderRadius: 14, background: "#e0e0e6", marginBottom: 12 }} />
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ height: 44, background: "#fff" }} />

      <div style={{ background: "#fff", padding: "12px 16px 16px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.5 }}>AI DAILY BRIEF</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: -0.4, marginTop: 4 }}>{today}</div>
        {brief && <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>สร้างเมื่อ {new Date(brief.generated_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.</div>}
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Fertilizer section */}
        {brief?.fertilizer_summary && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>⚗️</span>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.5 }}>ตลาดปุ๋ย</div>
            </div>
            <div style={{ fontSize: 13, color: "#333", lineHeight: 1.6 }}>{brief.fertilizer_summary}</div>
          </div>
        )}

        {/* Crop section */}
        {brief?.crop_summary && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>🌾</span>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.5 }}>ตลาดพืช</div>
            </div>
            <div style={{ fontSize: 13, color: "#333", lineHeight: 1.6 }}>{brief.crop_summary}</div>
          </div>
        )}

        {/* Prices */}
        {brief?.prices && brief.prices.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>📊</span>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.5 }}>ราคาสำคัญวันนี้</div>
            </div>
            {brief.prices.map((p, i) => <PriceCard key={i} price={p as any} />)}
          </div>
        )}

        {/* Risk signals */}
        {brief?.risk_signals && brief.risk_signals.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>🚦</span>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.5 }}>สัญญาณความเสี่ยง</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {brief.risk_signals.map((rs, i) => {
                const style = levelStyle[rs.level] || levelStyle.medium;
                return (
                  <div key={i} style={{ background: style.bg, borderLeft: `4px solid ${style.border}`, borderRadius: 8, padding: "10px 12px", display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{style.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: style.titleColor, textTransform: "capitalize" }}>
                        สัญญาณ{rs.level === "high" ? "สูง" : rs.level === "medium" ? "กลาง" : rs.level === "critical" ? "วิกฤต" : "ต่ำ"}
                      </div>
                      <div style={{ fontSize: 12, color: style.textColor, marginTop: 2, lineHeight: 1.4 }}>{rs.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Thailand impact */}
        {brief?.thailand_impact && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>🇹🇭</span>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", letterSpacing: 0.5 }}>ผลกระทบต่อไทย</div>
            </div>
            <div style={{ fontSize: 13, color: "#166534", lineHeight: 1.6 }}>{brief.thailand_impact}</div>
          </div>
        )}

        {/* South Thailand impact */}
        {brief?.south_thailand_impact && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>🌿</span>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", letterSpacing: 0.5 }}>ผลกระทบต่อภาคใต้</div>
            </div>
            <div style={{ fontSize: 13, color: "#166534", lineHeight: 1.6 }}>{brief.south_thailand_impact}</div>
          </div>
        )}

        {/* Business actions */}
        {brief?.business_actions && brief.business_actions.length > 0 && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", letterSpacing: 0.5 }}>คำแนะนำธุรกิจ</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {brief.business_actions.map((a, i) => (
                <div key={i} style={{ fontSize: 13, color: "#78350f", paddingLeft: 16, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0 }}>→</span>
                  {a}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content ideas */}
        {brief?.content_ideas && brief.content_ideas.length > 0 && (
          <div style={{ background: "#ecfdf5", border: "1.5px solid #6ee7b7", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", letterSpacing: 0.5 }}>ไอเดียคอนเทนต์วันนี้</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {brief.content_ideas.map((idea, i) => (
                <Link key={i} href="/studio" style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#065f46", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{i + 1}. {idea}</span>
                    <span style={{ color: "#059669", flexShrink: 0, marginLeft: 8 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Top articles links */}
        {brief?.top_articles && brief.top_articles.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.5, marginBottom: 10 }}>ข่าวสำคัญวันนี้</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {brief.top_articles.map((a) => (
                <Link key={a.id} href={`/articles/${a.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#111", lineHeight: 1.3 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: "#4f46e5", fontWeight: 600, flexShrink: 0 }}>{a.source}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
