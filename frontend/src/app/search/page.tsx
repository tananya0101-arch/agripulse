"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, type Article } from "@/lib/api";
import ArticleCard from "@/components/ArticleCard";

const FILTERS = ["ทั้งหมด", "ล่าสุด", "ไทย", "โลก", "ปุ๋ย", "พืช", "ราคา", "นโยบาย", "จีน", "อินเดีย"];

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") || "";
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<Article[]>([]);
  const [expandedTerms, setExpandedTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    api.search(q)
      .then((d) => { setResults(d.results); setCount(d.count); setExpandedTerms(d.expanded_terms || []); })
      .finally(() => setLoading(false));
  }, [q]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div>
      <div style={{ height: 44, background: "#fff" }} />

      {/* Search bar */}
      <div style={{ background: "#fff", padding: "0 16px 14px" }}>
        <form onSubmit={handleSearch}>
          <div style={{ background: "#eef2ff", border: "1.5px solid #c7d2fe", borderRadius: 12, height: 48, display: "flex", alignItems: "center", padding: "0 14px", gap: 10 }}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหา..."
              autoFocus
              style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: 14, color: "#4f46e5", fontWeight: 600 }}
            />
            {query && (
              <button type="button" onClick={() => { setQuery(""); router.push("/search"); }} style={{ fontSize: 18, color: "#999", background: "none", border: "none", cursor: "pointer" }}>✕</button>
            )}
          </div>
        </form>
      </div>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Result count */}
        {q && !loading && (
          <div style={{ fontSize: 12, color: "#888" }}>
            พบ {count} ผลลัพธ์สำหรับ "{q}"
            {expandedTerms.length > 1 && (
              <span> · รวมคำที่เกี่ยวข้อง: {expandedTerms.filter(t => t !== q.toLowerCase()).join(", ")}</span>
            )}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
          {FILTERS.map((f, i) => (
            <div
              key={f}
              style={{
                flexShrink: 0, padding: "7px 13px", borderRadius: 20,
                border: "1.5px solid" + (i === 0 ? "#4f46e5" : "#e0e0e0"),
                background: i === 0 ? "#4f46e5" : "#fff",
                color: i === 0 ? "#fff" : "#444",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* AI Insight block — shown when results exist */}
        {!loading && results.length > 0 && (
          <div style={{ background: "#f5f3ff", border: "1.5px solid #c7d2fe", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", letterSpacing: 0.5 }}>
                AI INSIGHT — {q.toUpperCase()}
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#3730a3", lineHeight: 1.6 }}>
              พบ {count} บทความที่เกี่ยวข้องกับ "{q}" ตรวจสอบข่าวล่าสุดด้านล่างและใช้ปุ่ม AI วิเคราะห์เพื่อดูผลกระทบต่อธุรกิจของคุณ
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {results[0]?.category.slice(0, 2).map(c => (
                <span key={c} style={{ background: "#eef2ff", color: "#4f46e5", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="skeleton" style={{ height: 14, width: "40%", borderRadius: 6, background: "#e0e0e6" }} />
                  <div className="skeleton" style={{ height: 16, borderRadius: 6, background: "#e0e0e6" }} />
                  <div className="skeleton" style={{ height: 12, width: "60%", borderRadius: 6, background: "#e0e0e6" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && q && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
            <div style={{ fontSize: 36 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 12 }}>ไม่พบผลลัพธ์</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>ลองค้นหาด้วยคำอื่น เช่น ยูเรีย, ยาง, อินเดีย</div>
          </div>
        )}

        {/* No query state */}
        {!q && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
            <div style={{ fontSize: 36 }}>🌾</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 12 }}>ค้นหาข่าวเกษตรและปุ๋ย</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>พิมพ์ภาษาไทยหรืออังกฤษ รองรับคำพ้องความหมาย</div>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {results.map((a) => (
              <div key={a.id}>
                <ArticleCard article={a} />
                <Link href={`/studio?article_id=${a.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: "0 0 14px 14px", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: -6 }}>
                    <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>✨ สร้างคอนเทนต์จากข่าวนี้</span>
                    <span style={{ fontSize: 12, color: "#059669" }}>→</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
