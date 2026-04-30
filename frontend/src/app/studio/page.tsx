"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api, type Article } from "@/lib/api";

const CONTENT_TYPES = [
  { type: "facebook_post", icon: "📘", label: "Facebook Post",  desc: "ให้ความรู้ตลาด" },
  { type: "tiktok_script", icon: "🎵", label: "TikTok Script",  desc: "วิดีโอสั้น" },
  { type: "line_oa",       icon: "💬", label: "LINE OA",        desc: "ข้อความลูกค้า" },
  { type: "sales_talk",    icon: "🗣️", label: "Sales Talk",     desc: "พนักงานขาย" },
  { type: "farmer",        icon: "👨‍🌾", label: "เกษตรกร",      desc: "เข้าใจง่าย" },
  { type: "executive",     icon: "📊", label: "ผู้บริหาร",      desc: "รายงานภายใน" },
];

const TONES = [
  { key: "friendly",     label: "เป็นมิตร" },
  { key: "professional", label: "มืออาชีพ" },
  { key: "simple",       label: "เข้าใจง่าย" },
  { key: "warning",      label: "เตือนตลาด" },
  { key: "educational",  label: "ให้ความรู้" },
];

function StudioContent() {
  const params = useSearchParams();
  const articleIdParam = params.get("article_id");
  const typeParam = params.get("type") || "facebook_post";

  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [contentType, setContentType] = useState(typeParam);
  const [tone, setTone] = useState("friendly");
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.articles().then(list => {
      setArticles(list);
      const target = articleIdParam ? list.find(a => a.id === Number(articleIdParam)) : list[0];
      if (target) setSelectedArticle(target);
    }).finally(() => setLoading(false));
  }, [articleIdParam]);

  async function generate() {
    if (!selectedArticle) return;
    setGenerating(true);
    setOutput("");
    try {
      const res = await api.generateContent(selectedArticle.id, contentType, tone);
      setOutput(res.body);
    } finally {
      setGenerating(false);
    }
  }

  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div style={{ height: 44, background: "#fff" }} />

      <div style={{ background: "#fff", padding: "12px 16px 16px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: -0.4 }}>✨ Content Studio</div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>สร้างคอนเทนต์จากข่าวตลาด</div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Source article */}
        <div style={{ background: "#f5f3ff", border: "1.5px solid #c7d2fe", borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", letterSpacing: 0.5, marginBottom: 8 }}>แหล่งข่าว</div>
          {loading ? (
            <div className="skeleton" style={{ height: 40, borderRadius: 8, background: "#e0e0e6" }} />
          ) : selectedArticle ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111", lineHeight: 1.3 }}>
                {selectedArticle.title_th || selectedArticle.title}
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{selectedArticle.source}</div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#888" }}>ไม่พบบทความ</div>
          )}

          {/* Article picker */}
          {articles.length > 1 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>เปลี่ยนข่าว:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 140, overflowY: "auto" }}>
                {articles.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedArticle(a); setOutput(""); }}
                    style={{
                      textAlign: "left", padding: "8px 10px", borderRadius: 8, border: "1.5px solid",
                      borderColor: selectedArticle?.id === a.id ? "#4f46e5" : "#e0e0e0",
                      background: selectedArticle?.id === a.id ? "#eef2ff" : "#fff",
                      cursor: "pointer", fontSize: 12, color: "#333",
                    }}
                  >
                    {a.title_th || a.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 1: Content type */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 12 }}>1. เลือกประเภทคอนเทนต์</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {CONTENT_TYPES.map(ct => (
              <button
                key={ct.type}
                onClick={() => { setContentType(ct.type); setOutput(""); }}
                style={{
                  padding: 12, borderRadius: 10, textAlign: "center", cursor: "pointer",
                  border: "2px solid",
                  borderColor: contentType === ct.type ? "#4f46e5" : "#e0e0e0",
                  background: contentType === ct.type ? "#eef2ff" : "#fff",
                }}
              >
                <div style={{ fontSize: 22 }}>{ct.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: contentType === ct.type ? "#4f46e5" : "#333", marginTop: 4 }}>{ct.label}</div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{ct.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Tone */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 10 }}>2. เลือกโทนเสียง</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TONES.map(t => (
              <button
                key={t.key}
                onClick={() => { setTone(t.key); setOutput(""); }}
                style={{
                  padding: "8px 14px", borderRadius: 20, border: "1.5px solid",
                  borderColor: tone === t.key ? "#4f46e5" : "#e0e0e0",
                  background: tone === t.key ? "#4f46e5" : "#fff",
                  color: tone === t.key ? "#fff" : "#444",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate */}
        <button
          onClick={generate}
          disabled={generating || !selectedArticle}
          style={{
            padding: 14, borderRadius: 12, background: generating ? "#8b85f4" : "#4f46e5", color: "#fff",
            border: "none", cursor: generating ? "not-allowed" : "pointer",
            fontSize: 15, fontWeight: 700, letterSpacing: -0.2,
          }}
        >
          {generating ? "⏳ กำลังสร้างคอนเทนต์..." : "🤖 สร้างคอนเทนต์"}
        </button>

        {/* Output */}
        {output && (
          <div style={{ background: "#f0fdf4", border: "1.5px solid #6ee7b7", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", letterSpacing: 0.5 }}>
                ผลลัพธ์ — {CONTENT_TYPES.find(c => c.type === contentType)?.label}
              </div>
              <span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>✓ สร้างแล้ว</span>
            </div>

            <div
              style={{
                background: "#fff", borderRadius: 10, padding: 12,
                fontSize: 13, color: "#111", lineHeight: 1.7,
                border: "1px solid #d1fae5", whiteSpace: "pre-wrap",
                minHeight: 120, maxHeight: 320, overflowY: "auto",
              }}
            >
              {output}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button
                onClick={copy}
                style={{ padding: "9px 16px", borderRadius: 10, background: "#059669", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                {copied ? "✓ คัดลอกแล้ว!" : "📋 คัดลอก"}
              </button>
              <button
                onClick={generate}
                style={{ padding: "9px 16px", borderRadius: 10, background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                🔄 สร้างใหม่
              </button>
            </div>

            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 10, lineHeight: 1.4 }}>
              ⚠️ ตรวจสอบข้อเท็จจริงก่อนโพสต์ · ดูแหล่งต้นฉบับเสมอ
              {selectedArticle && (
                <> · <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", textDecoration: "none" }}>{selectedArticle.source} ↗</a></>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense>
      <StudioContent />
    </Suspense>
  );
}
