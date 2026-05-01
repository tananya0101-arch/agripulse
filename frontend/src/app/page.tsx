"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, type Article, type Price } from "@/lib/api";
import ArticleCard from "@/components/ArticleCard";
import PriceCard from "@/components/PriceCard";

const TOPICS = [
  { emoji: "🌿", name: "ยางพารา" },
  { emoji: "🌴", name: "ปาล์ม" },
  { emoji: "🌟", name: "ทุเรียน" },
  { emoji: "🌾", name: "ข้าว" },
  { emoji: "⚗️", name: "ยูเรีย" },
  { emoji: "🧪", name: "DAP" },
  { emoji: "🧪", name: "MOP" },
  { emoji: "🇨🇳", name: "จีน" },
  { emoji: "🇮🇳", name: "อินเดีย" },
];

function Skel({ h = 14, w = "100%" }: { h?: number; w?: string }) {
  return (
    <div
      className="skeleton"
      style={{ height: h, width: w, borderRadius: 6, background: "#e0e0e6" }}
    />
  );
}


export default function HomePage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([api.articles(), api.prices()])
      .then(([a, p]) => { setArticles(a); setPrices(p); })
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  }

  const today = new Date().toLocaleDateString("th-TH", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div>
      <div style={{ height: 44, background: "#fff" }} />

      {/* Top bar */}
      <div style={{ background: "#fff", padding: "0 16px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "#888" }}>สวัสดีตอนเช้า 👋</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: -0.4 }}>AgriPulse AI</div>
        </div>
        <Link href="/brief" style={{ textDecoration: "none" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📋</div>
        </Link>
      </div>

      {/* Search */}
      <div style={{ background: "#fff", padding: "0 16px 16px" }}>
        <form onSubmit={handleSearch}>
          <div style={{ background: "#f3f4f6", borderRadius: 12, height: 48, display: "flex", alignItems: "center", padding: "0 14px", gap: 10 }}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา ยูเรีย, ยาง, DAP, อินเดีย..."
              style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: 14, color: "#111" }}
            />
          </div>
        </form>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 16px" }}>

        {/* ── Commodity nav buttons ── */}
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/rubber" style={{
            flex: 1, textAlign: "center", padding: "10px 0",
            background: "#fff", borderRadius: 10, border: "1.5px solid #e0e0e0",
            fontSize: 12, fontWeight: 600, color: "#444", textDecoration: "none",
          }}>
            🌿 ดูราคายางทั้งหมด →
          </Link>
          <Link href="/palm" style={{
            flex: 1, textAlign: "center", padding: "10px 0",
            background: "#fff", borderRadius: 10, border: "1.5px solid #e0e0e0",
            fontSize: 12, fontWeight: 600, color: "#444", textDecoration: "none",
          }}>
            🌴 ดูราคาปาล์มทั้งหมด →
          </Link>
          <Link href="/durian" style={{
            flex: 1, textAlign: "center", padding: "10px 0",
            background: "#fff", borderRadius: 10, border: "1.5px solid #e0e0e0",
            fontSize: 12, fontWeight: 600, color: "#444", textDecoration: "none",
          }}>
            🌟 ดูราคาทุเรียนทั้งหมด →
          </Link>
        </div>

        {/* Daily Brief hero */}
        <Link href="/brief" style={{ textDecoration: "none" }}>
          <div style={{ background: "linear-gradient(135deg,#312e81 0%,#4f46e5 100%)", borderRadius: 16, padding: 16, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, letterSpacing: 0.5 }}>AI DAILY BRIEF</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{today}</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginTop: 8 }}>
              ตลาดปุ๋ยและเกษตรวันนี้ — วิเคราะห์ด้วย AI
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
              {loading ? "กำลังโหลด..." : `${articles.length} ข่าวใหม่ · ${prices.length} ราคาสำคัญ`}
            </div>
            <div style={{ marginTop: 12, background: "rgba(255,255,255,0.18)", borderRadius: 8, padding: "8px 12px", fontSize: 12, textAlign: "center" }}>
              อ่าน Brief วันนี้ →
            </div>
          </div>
        </Link>

        {/* Topics */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.5, marginBottom: 8 }}>หมวดหมู่</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
            {TOPICS.map((t) => (
              <Link key={t.name} href={`/search?q=${encodeURIComponent(t.name)}`} style={{ textDecoration: "none" }}>
                <div style={{ flexShrink: 0, padding: "7px 13px", background: "#fff", borderRadius: 20, border: "1.5px solid #e0e0e0", fontSize: 12, fontWeight: 600, color: "#444", whiteSpace: "nowrap" }}>
                  {t.emoji} {t.name}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Prices */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.5 }}>ราคาวันนี้</div>
          </div>
          {loading
            ? [1, 2, 3, 4, 5, 6].map((i) => <div key={i} style={{ marginBottom: 10 }}><Skel h={40} /></div>)
            : prices.map((p) => <PriceCard key={p.id} price={p} />)
          }
          <div style={{ fontSize: 10, color: "#bbb", marginTop: 8 }}>ราคาจากแหล่งข้อมูลที่อนุมัติแล้ว · อัพเดทรายวัน</div>
        </div>

        {/* News feed */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.5 }}>ข่าวล่าสุด</div>
          </div>
          {loading
            ? [1, 2, 3].map((i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Skel h={14} w="40%" /><Skel h={16} /><Skel h={12} w="60%" /><Skel h={12} />
                  </div>
                </div>
              ))
            : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
              </div>
          }
        </div>

      </div>
    </div>
  );
}
