"use client";
import { useEffect, useState } from "react";
import MarketCard from "@/components/market/MarketCard";
import BusinessImpactPanel from "@/components/market/BusinessImpactPanel";
import {
  getFertilizerPrices,
  getPriceHistory,
  getBusinessRecommendations,
} from "@/services/marketData";
import type { MarketPrice, PriceHistory, BusinessRecommendation } from "@/types/market";

function Skel({ h = 14, w = "100%" }: { h?: number; w?: string }) {
  return (
    <div className="skeleton" style={{ height: h, width: w, borderRadius: 8, background: "#e0e0e6" }} />
  );
}

const GLOBAL_SIGNALS = [
  {
    id: "india-tender",
    flag: "🇮🇳",
    country: "อินเดีย",
    event: "ประมูลนำเข้ายูเรีย",
    status: "กำลังดำเนินการ",
    statusColor: "#d97706",
    statusBg: "#fffbeb",
    detail: "อินเดียประกาศประมูลนำเข้ายูเรีย 1.5 ล้านตัน มีผลกดดันราคายูเรียโลกขึ้น คาดว่าจะสิ้นสุดในเดือนนี้",
  },
  {
    id: "china-export",
    flag: "🇨🇳",
    country: "จีน",
    event: "ข้อจำกัดส่งออกปุ๋ย",
    status: "ยังคงมีผล",
    statusColor: "#dc2626",
    statusBg: "#fee2e2",
    detail: "จีนยังคงจำกัดการส่งออกปุ๋ยในช่วงนี้ ทำให้อุปทานโลกตึง โดยเฉพาะยูเรียและฟอสเฟต",
  },
  {
    id: "russia-sanction",
    flag: "🇷🇺",
    country: "รัสเซีย/เบลารุส",
    event: "การค้า MOP",
    status: "มีผลบ้าง",
    statusColor: "#d97706",
    statusBg: "#fffbeb",
    detail: "มาตรการคว่ำบาตรยังมีผลต่อการซื้อขาย MOP บางส่วน แต่ไทยส่วนใหญ่นำเข้าจาก Canada และ Jordan",
  },
];

const SHOP_TIPS = [
  "ล็อคราคายูเรียล่วงหน้าก่อนราคาขึ้นอีก — สัญญาณอินเดียประมูลใหม่",
  "DAP ราคาลงเล็กน้อย อาจรอดูอีก 1-2 สัปดาห์ก่อนซื้อล็อตใหม่",
  "ติดตามค่าเงินบาทคู่กับราคาโลก — บาทแข็งช่วยลดต้นทุนนำเข้า",
  "สื่อสารเหตุผลราคากับลูกค้าโดยใช้ข้อมูลจากแหล่งอ้างอิง ช่วยสร้างความเชื่อถือ",
];

export default function FertilizerPage() {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [histories, setHistories] = useState<Record<string, PriceHistory[]>>({});
  const [rec, setRec] = useState<BusinessRecommendation | null>(null);

  useEffect(() => {
    document.title = "ปุ๋ย & ตลาดโลก — AgriPulse";
    setTimeout(() => {
      const p = getFertilizerPrices();
      const h: Record<string, PriceHistory[]> = {};
      p.forEach((price) => { h[price.id] = getPriceHistory(price.id); });
      setPrices(p);
      setHistories(h);
      setRec(getBusinessRecommendations("fertilizer")[0]);
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
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>🌱 ปุ๋ย & ตลาดโลก</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{today}</div>
          </div>
          <span style={{ fontSize: 10, background: "#eef2ff", color: "#4f46e5", borderRadius: 20, padding: "4px 10px", fontWeight: 700 }}>
            Global
          </span>
        </div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Price normalization note */}
        <div style={{
          background: "#f9fafb", border: "1px solid #e5e7eb",
          borderRadius: 10, padding: "10px 12px",
          fontSize: 11, color: "#6b7280", lineHeight: 1.6,
        }}>
          📌 <strong>หมายเหตุ:</strong> ราคาที่แสดงเป็น <strong>ราคาโลก (FOB)</strong> หน่วย USD/tonne ยังไม่รวมค่าขนส่ง ภาษี และค่าดำเนินการ ราคานำเข้าไทยจริงจะสูงกว่าประมาณ 30–80 USD/tonne ขึ้นกับเส้นทางและ exchange rate
        </div>

        {/* Price cards */}
        <section>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>ราคาปุ๋ยโลกวันนี้</div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Skel h={180} /><Skel h={180} /><Skel h={180} />
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

        {/* Global signal cards */}
        <section>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>สัญญาณตลาดโลก</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {GLOBAL_SIGNALS.map((s) => (
              <div key={s.id} style={{
                background: "#fff", borderRadius: 14, padding: 14,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 18 }}>{s.flag}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{s.country}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{s.event}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: s.statusColor, background: s.statusBg,
                    borderRadius: 20, padding: "3px 10px",
                    whiteSpace: "nowrap",
                  }}>
                    {s.status}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.6 }}>{s.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Business impact */}
        {!loading && rec && (
          <section>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>ผลกระทบต่อธุรกิจ</div>
            <BusinessImpactPanel rec={rec} />
          </section>
        )}

        {/* Shop tips */}
        <section>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>💡 คำแนะนำร้านปุ๋ยในช่วงนี้</div>
          <div style={{ background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SHOP_TIPS.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{
                    flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                    background: "#eef2ff", color: "#4f46e5",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div style={{ background: "#f9fafb", borderRadius: 10, padding: 12, fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>
          ⚠️ ราคาโลกและราคานำเข้ายังมีส่วนต่างค่าขนส่งและภาษี ข้อมูลนี้ใช้เพื่อประกอบการวางแผนเท่านั้น ไม่ใช่ราคาขายปลีกในประเทศ
        </div>

      </div>
    </div>
  );
}
