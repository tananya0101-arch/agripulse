"use client";
import { useEffect, useState } from "react";
import MarketCard from "@/components/market/MarketCard";
import AIInsightPanel from "@/components/market/AIInsightPanel";
import BusinessImpactPanel from "@/components/market/BusinessImpactPanel";
import {
  getPalmPrices,
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

const FACTORS = [
  { icon: "📈", title: "CPO Futures มาเลเซีย (FCPO)", desc: "ราคา CPO Bursa Malaysia เป็น benchmark โลก ราคา FFB ไทยมักขยับตาม FCPO ในสัปดาห์เดียวกัน" },
  { icon: "🛢️", title: "สต็อกน้ำมันปาล์มโลก", desc: "สต็อกสูงทำให้ราคาลง สต็อกต่ำดันราคาขึ้น โดยเฉพาะสต็อกมาเลเซียที่รายงานทุกเดือน" },
  { icon: "🚢", title: "การส่งออก CPO ไทย", desc: "ไทยส่งออก CPO และน้ำมันปาล์มบริสุทธิ์ ความต้องการตลาดโลกกระทบโดยตรงต่อราคาในประเทศ" },
  { icon: "⛽", title: "ราคาน้ำมันดิบโลก", desc: "น้ำมันแพง → ไบโอดีเซลน่าสนใจขึ้น → ความต้องการ CPO สูงขึ้น → ราคาปาล์มขึ้น" },
  { icon: "🌿", title: "นโยบายไบโอดีเซล", desc: "ไทยมีนโยบาย B7-B20 ความต้องการ CPO ในประเทศขึ้นกับสัดส่วนไบโอดีเซลที่กำหนด" },
  { icon: "🫘", title: "ราคาน้ำมันถั่วเหลือง", desc: "น้ำมันพืชแข่งขันกัน ถั่วเหลืองถูกลงทำให้ CPO ต้องปรับลงด้วย และในทางกลับกัน" },
];

const REGIONS = [
  {
    name: "สงขลา",
    icon: "🌴",
    area: "ภาคใต้ตอนกลาง",
    desc: "มีโรงงานสกัดน้ำมันปาล์มหลายแห่ง ราคา FFB สงขลามักใกล้เคียงราคากรมการค้าภายใน เป็นราคาอ้างอิงที่ดี",
  },
  {
    name: "สุราษฎร์ธานี",
    icon: "🏭",
    area: "ภาคใต้ตอนบน",
    desc: "แหล่งเพาะปลูกปาล์มที่ใหญ่ที่สุดในไทย มีโรงงานสกัดขนาดใหญ่และสหกรณ์ปาล์มที่แข็งแกร่ง",
  },
  {
    name: "กระบี่",
    icon: "🌊",
    area: "ภาคใต้ฝั่งอันดามัน",
    desc: "มีพื้นที่ปลูกปาล์มเพิ่มขึ้นต่อเนื่อง โรงงานสกัดน้ำมันในพื้นที่ ราคาอาจต่างกับสุราษฎร์ฯ เล็กน้อย",
  },
];

export default function PalmPage() {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [histories, setHistories] = useState<Record<string, PriceHistory[]>>({});
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [rec, setRec] = useState<BusinessRecommendation | null>(null);

  useEffect(() => {
    document.title = "ตลาดปาล์มน้ำมัน — AgriPulse";
    setTimeout(() => {
      const p = getPalmPrices();
      const h: Record<string, PriceHistory[]> = {};
      p.forEach((price) => { h[price.id] = getPriceHistory(price.id); });
      setPrices(p);
      setHistories(h);
      setInsight(getMarketInsight("palm"));
      setRec(getBusinessRecommendations("palm")[0]);
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
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>🌴 ตลาดปาล์มน้ำมัน</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{today}</div>
          </div>
          <span style={{ fontSize: 10, background: "#dcfce7", color: "#059669", borderRadius: 20, padding: "4px 10px", fontWeight: 700 }}>
            LIVE
          </span>
        </div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Price cards */}
        <section>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>ราคาปาล์มวันนี้</div>
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

        {/* Regional cards */}
        <section>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>แหล่งผลิตสำคัญ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {REGIONS.map((r) => (
              <div key={r.name} style={{
                background: "#fff", borderRadius: 14, padding: 14,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{r.area}</div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Price factors */}
        <section>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>ปัจจัยที่กระทบราคาปาล์ม</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FACTORS.map((f) => (
              <div key={f.title} style={{
                background: "#fff", borderRadius: 12, padding: "12px 14px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 3 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div style={{ background: "#f9fafb", borderRadius: 10, padding: 12, fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>
          ⚠️ ราคาที่แสดงเป็นราคาอ้างอิงจากแหล่งที่อนุมัติ อาจมีความแตกต่างจากราคาจริงในพื้นที่ ควรตรวจสอบกับแหล่งต้นทาง
        </div>

      </div>
    </div>
  );
}
