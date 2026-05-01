"use client";
import { useEffect, useState } from "react";
import MarketCard from "@/components/market/MarketCard";
import AIInsightPanel from "@/components/market/AIInsightPanel";
import BusinessImpactPanel from "@/components/market/BusinessImpactPanel";
import {
  getDurianPrices,
  getPriceHistory,
  getBusinessRecommendations,
  getMarketInsight,
} from "@/services/marketData";
import type { MarketPrice, PriceHistory, MarketInsight, BusinessRecommendation } from "@/types/market";

function Skel({ h = 14, w = "100%" }: { h?: number; w?: string }) {
  return (
    <div className="skeleton" style={{ height: h, width: w, borderRadius: 8, background: "#e0e0e6" }} />
  );
}

const CROP_STAGES = [
  {
    icon: "🍈",
    stage: "ระยะขยายผล",
    timing: "ช่วงผลอายุ 2-3 เดือน",
    products: "โพแทสเซียมซัลเฟต (K₂SO₄), Ca-B (แคลเซียมโบรอน)",
    tip: "ช่วยผลใหญ่ เนื้อแน่น ลดผลแตก เพิ่มความหวาน ห้ามใช้ยูเรียในช่วงนี้",
    bg: "#fff7ed",
    border: "#fed7aa",
    color: "#92400e",
  },
  {
    icon: "🌱",
    stage: "หลังเก็บเกี่ยว",
    timing: "ภายใน 1 เดือนหลังเก็บ",
    products: "19-19-19, ปุ๋ยอินทรีย์, สารบำรุงราก",
    tip: "ฟื้นฟูต้น สร้างตาดอกรุ่นใหม่ บำรุงรากให้แข็งแรงก่อนฤดูแล้ง",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    color: "#065f46",
  },
  {
    icon: "🌧️",
    stage: "ป้องกันโรค",
    timing: "ช่วงฝนชุก หรือเมื่อพบอาการ",
    products: "สารป้องกันเชื้อรา (Metalaxyl, Fosetyl-Al), ผลิตภัณฑ์ดูแลใบ",
    tip: "โรครากเน่าและผลเน่าสำคัญมาก ป้องกันดีกว่าแก้ ระวังช่วงฝนชุกต่อเนื่อง",
    bg: "#eff6ff",
    border: "#bfdbfe",
    color: "#1d4ed8",
  },
];

const EXPORT_SIGNALS = [
  { label: "ตลาดจีน", status: "เปิด", detail: "ยังนำเข้าต่อเนื่อง ทุเรียนสดและแช่แข็ง", color: "#059669" },
  { label: "ด่านผ่านแดน", status: "ปกติ", detail: "ด่านมุกดาหารและนครพนมปกติ ไม่มีรายงานปัญหา", color: "#059669" },
  { label: "ราคาส่งออก", status: "ทรงตัว", detail: "ราคา FOB ทุเรียนสดเฉลี่ย 4-5 USD/กก", color: "#d97706" },
];

export default function DurianPage() {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [histories, setHistories] = useState<Record<string, PriceHistory[]>>({});
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [rec, setRec] = useState<BusinessRecommendation | null>(null);

  useEffect(() => {
    document.title = "ตลาดทุเรียน — AgriPulse";
    setTimeout(() => {
      const p = getDurianPrices();
      const h: Record<string, PriceHistory[]> = {};
      p.forEach((price) => { h[price.id] = getPriceHistory(price.id); });
      setPrices(p);
      setHistories(h);
      setInsight(getMarketInsight("durian"));
      setRec(getBusinessRecommendations("durian")[0]);
      setLoading(false);
    }, 300);
  }, []);

  const today = new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <div style={{ height: 44, background: "#fff" }} />

      {/* Header */}
      <div style={{ background: "#fff", padding: "12px 16px 16px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>🍈 ตลาดทุเรียน</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{today}</div>
          </div>
          <span style={{ fontSize: 10, background: "#fff7ed", color: "#d97706", borderRadius: 20, padding: "4px 10px", fontWeight: 700 }}>
            สัญญาณ
          </span>
        </div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Season status banner */}
        <div style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          border: "1.5px solid #86efac",
          borderRadius: 12, padding: "12px 14px",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d", marginBottom: 6 }}>📅 ฤดูกาลทุเรียน 2569</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 12, color: "#166534" }}>
              <strong>ภาคตะวันออก (จันทบุรี/ระยอง/ชลบุรี):</strong> ช่วงพีค เม.ย.–มิ.ย. — ผลผลิตออกมาก
            </div>
            <div style={{ fontSize: 12, color: "#166534" }}>
              <strong>ภาคใต้ (ยะลา/สุราษฎร์/ชุมพร):</strong> พีค ก.ค.–ก.ย. — ยังมีโอกาส
            </div>
          </div>
        </div>

        {/* Local signal warning */}
        <div style={{
          background: "#fff7ed", border: "1.5px solid #fed7aa",
          borderRadius: 10, padding: "10px 12px",
          fontSize: 12, color: "#92400e", lineHeight: 1.5,
        }}>
          ⚠️ <strong>หมายเหตุ:</strong> ราคาทุเรียนด้านล่างมาจากสัญญาณภาคสนาม ยังไม่ใช่ราคากลางทางการ ใช้เป็นสัญญาณประกอบการตัดสินใจเท่านั้น
        </div>

        {/* Price cards */}
        <section>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>ราคาทุเรียนวันนี้</div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Skel h={180} /><Skel h={180} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {prices.map((p) => (
                <MarketCard
                  key={p.id}
                  price={p}
                  showChart={true}
                  history={histories[p.id]}
                />
              ))}
            </div>
          )}
        </section>

        {/* AI insight */}
        {!loading && insight && (
          <section>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>วิเคราะห์ตลาดด้วย AI</div>
            <AIInsightPanel insight={insight} defaultOpen={false} />
          </section>
        )}

        {/* Business impact */}
        {!loading && rec && (
          <section>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>ผลกระทบต่อธุรกิจ</div>
            <BusinessImpactPanel rec={rec} />
          </section>
        )}

        {/* Crop stage cards */}
        <section>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>ระยะการดูแลสวนทุเรียน</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CROP_STAGES.map((s) => (
              <div key={s.stage} style={{
                background: s.bg, border: `1.5px solid ${s.border}`,
                borderRadius: 14, padding: 14,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.stage}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{s.timing}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  📦 {s.products}
                </div>
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>💡 {s.tip}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Export signals */}
        <section>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>สัญญาณการส่งออก</div>
          <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {EXPORT_SIGNALS.map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{s.detail}</div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: s.color,
                    background: s.color === "#059669" ? "#dcfce7" : "#fff7ed",
                    borderRadius: 20, padding: "3px 10px",
                  }}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div style={{ background: "#f9fafb", borderRadius: 10, padding: 12, fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>
          ⚠️ ราคาทุเรียนเป็นสัญญาณจากภาคสนาม ยังไม่ผ่านการตรวจสอบอย่างเป็นทางการ ห้ามใช้เป็นราคาอ้างอิงเชิงพาณิชย์
        </div>

      </div>
    </div>
  );
}
