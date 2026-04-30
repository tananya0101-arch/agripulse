"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, type Article } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type FullArticle = {
  article_id: number;
  headline_th: string;
  summary: string;
  body: string;
  thailand_impact: string | null;
  south_thailand_impact: string | null;
  business_tip: string | null;
  key_facts: string[];
  uncertainty_note: string | null;
  source: string;
  source_url: string;
  published_at: string;
  generated_by: string;
};

const CONTENT_TYPES = [
  { type: "facebook_post", icon: "📘", label: "Facebook" },
  { type: "tiktok_script", icon: "🎵", label: "TikTok" },
  { type: "line_oa",       icon: "💬", label: "LINE OA" },
  { type: "sales_talk",    icon: "🗣️", label: "Sales" },
  { type: "farmer",        icon: "👨‍🌾", label: "เกษตรกร" },
];

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชม. ที่แล้ว`;
  return `${Math.floor(diff / 86400)} วันที่แล้ว`;
}

function BodyText({ text }: { text: string }) {
  // Render **bold** markdown and newlines
  const parts = text.split("\n").filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {parts.map((line, i) => {
        const isBold = line.startsWith("**") && line.endsWith("**");
        const clean = line.replace(/\*\*/g, "");
        return (
          <p key={i} style={{
            fontSize: 14,
            color: isBold ? "#111" : "#444",
            fontWeight: isBold ? 700 : 400,
            lineHeight: 1.7,
            margin: 0,
          }}>
            {clean}
          </p>
        );
      })}
    </div>
  );
}

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [full, setFull] = useState<FullArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullLoading, setFullLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"article" | "thailand" | "south" | "tips">("article");

  useEffect(() => {
    api.article(Number(id))
      .then(a => {
        setArticle(a);
        setLoading(false);
        // Auto-load full article
        loadFull();
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function loadFull() {
    setFullLoading(true);
    try {
      const res = await fetch(`${BASE}/ai/full-article/${id}`);
      const data = await res.json();
      setFull(data);
    } finally {
      setFullLoading(false);
    }
  }

  if (loading) return (
    <div style={{ padding: 16 }}>
      <div style={{ height: 44 }} />
      {[60, 20, 120, 80, 100].map((h, i) => (
        <div key={i} className="skeleton" style={{ height: h, borderRadius: 12, background: "#e0e0e6", marginBottom: 12 }} />
      ))}
    </div>
  );

  if (!article) return (
    <div style={{ padding: 32, textAlign: "center", color: "#888" }}>
      <div style={{ fontSize: 36 }}>😕</div>
      <div style={{ marginTop: 12, fontSize: 14 }}>ไม่พบบทความ</div>
      <button onClick={() => router.back()} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, background: "#4f46e5", color: "#fff", border: "none", cursor: "pointer" }}>← กลับ</button>
    </div>
  );

  const headline = full?.headline_th || article.title_th || article.title;

  return (
    <div>
      <div style={{ height: 44, background: "#fff" }} />

      {/* Top bar */}
      <div style={{ background: "#fff", padding: "10px 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => router.back()} style={{ padding: "7px 12px", borderRadius: 10, background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#444" }}>← กลับ</button>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#888" }}>อ่านใน AgriPulse</span>
          <a href={article.url} target="_blank" rel="noopener noreferrer"
            style={{ padding: "7px 10px", borderRadius: 10, background: "#f3f4f6", border: "none", fontSize: 12, fontWeight: 600, color: "#888", textDecoration: "none" }}>
            ↗ ต้นฉบับ
          </a>
        </div>
      </div>

      <div style={{ padding: "0 16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {article.category.slice(0, 3).map(c => (
            <span key={c} style={{ background: "#eef2ff", color: "#4f46e5", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{c}</span>
          ))}
          {article.country.slice(0, 1).map(c => (
            <span key={c} style={{ background: "#fff7ed", color: "#ea580c", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{c}</span>
          ))}
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111", lineHeight: 1.3, letterSpacing: -0.4, margin: 0 }}>
          {headline}
        </h1>

        {/* Meta */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "#999" }}>
          <span style={{ fontWeight: 700, color: "#4f46e5" }}>{article.source}</span>
          <span>·</span>
          <span>{timeAgo(article.published_at)}</span>
        </div>

        {/* AI badge */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#f0fdf4", borderRadius: 10, padding: "8px 12px" }}>
          <span style={{ fontSize: 14 }}>🤖</span>
          <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>
            {fullLoading ? "กำลังสร้างบทความ..." : "วิเคราะห์และเขียนใหม่โดย AI AgriPulse"}
          </span>
          {full && <span style={{ fontSize: 11, color: "#6ee7b7", marginLeft: "auto" }}>✓ พร้อมแล้ว</span>}
        </div>

        {/* Loading skeleton for article body */}
        {fullLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[100, 80, 100, 60, 100, 80].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, borderRadius: 4, background: "#e0e0e6" }} />
            ))}
          </div>
        )}

        {/* Full article content */}
        {full && !fullLoading && (
          <>
            {/* Tab nav */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
              {[
                { key: "article",  label: "📰 บทความ" },
                { key: "thailand", label: "🇹🇭 ผลกระทบไทย" },
                { key: "south",    label: "🌿 ภาคใต้" },
                { key: "tips",     label: "💡 คำแนะนำ" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    flexShrink: 0, padding: "8px 14px", borderRadius: 20, border: "1.5px solid",
                    borderColor: activeTab === tab.key ? "#4f46e5" : "#e0e0e0",
                    background: activeTab === tab.key ? "#4f46e5" : "#fff",
                    color: activeTab === tab.key ? "#fff" : "#555",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

              {activeTab === "article" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Summary callout */}
                  {full.summary && (
                    <div style={{ background: "#f5f3ff", borderRadius: 10, padding: "12px 14px", borderLeft: "4px solid #4f46e5" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", marginBottom: 5 }}>สรุปสั้น</div>
                      <div style={{ fontSize: 13, color: "#3730a3", lineHeight: 1.6 }}>{full.summary}</div>
                    </div>
                  )}

                  {/* Key facts */}
                  {full.key_facts?.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>ข้อเท็จจริงสำคัญ</div>
                      {full.key_facts.map((f, i) => (
                        <div key={i} style={{ fontSize: 13, color: "#333", display: "flex", gap: 8 }}>
                          <span style={{ color: "#4f46e5", flexShrink: 0 }}>✅</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ height: 1, background: "#f0f0f0" }} />

                  {/* Body */}
                  <BodyText text={full.body} />

                  {/* Uncertainty */}
                  {full.uncertainty_note && (
                    <div style={{ background: "#fffbeb", borderRadius: 10, padding: "10px 12px", borderLeft: "3px solid #f59e0b" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>⚠️ ความไม่แน่นอน</div>
                      <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.5 }}>{full.uncertainty_note}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "thailand" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>🇹🇭 ผลกระทบต่อไทย</div>
                  <div style={{ fontSize: 14, color: "#166534", lineHeight: 1.7, background: "#f0fdf4", borderRadius: 10, padding: 12 }}>
                    {full.thailand_impact || "ไม่มีข้อมูลผลกระทบต่อไทยสำหรับข่าวนี้"}
                  </div>
                </div>
              )}

              {activeTab === "south" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>🌿 ผลกระทบต่อภาคใต้</div>
                  <div style={{ fontSize: 14, color: "#166534", lineHeight: 1.7, background: "#f0fdf4", borderRadius: 10, padding: 12 }}>
                    {full.south_thailand_impact || "ข่าวนี้ไม่ได้มีผลกระทบโดยตรงต่อภาคใต้ไทยเป็นพิเศษ"}
                  </div>
                </div>
              )}

              {activeTab === "tips" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>💡 คำแนะนำสำหรับธุรกิจ</div>
                  <div style={{ fontSize: 14, color: "#78350f", lineHeight: 1.7, background: "#fffbeb", borderRadius: 10, padding: 12 }}>
                    {full.business_tip || "ติดตามข้อมูลตลาดอย่างต่อเนื่อง และปรึกษาผู้เชี่ยวชาญก่อนตัดสินใจเชิงธุรกิจ"}
                  </div>
                </div>
              )}
            </div>

            {/* Attribution */}
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "#888", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>สรุปและวิเคราะห์โดย AI AgriPulse · อ้างอิงจาก {full.source}</span>
              <a href={full.source_url} target="_blank" rel="noopener noreferrer"
                style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 600, fontSize: 11, flexShrink: 0 }}>
                ต้นฉบับ ↗
              </a>
            </div>
          </>
        )}

        {/* Content generation */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.5 }}>สร้างคอนเทนต์จากข่าวนี้</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CONTENT_TYPES.map(ct => (
              <Link key={ct.type} href={`/studio?article_id=${article.id}&type=${ct.type}`} style={{ textDecoration: "none" }}>
                <div style={{ padding: "9px 14px", borderRadius: 10, background: "#4f46e5", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                  {ct.icon} {ct.label}
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
