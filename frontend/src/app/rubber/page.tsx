"use client";
import { useEffect, useState } from "react";
import MarketCard from "@/components/market/MarketCard";
import AIInsightPanel from "@/components/market/AIInsightPanel";
import BusinessImpactPanel from "@/components/market/BusinessImpactPanel";
import {
  getRubberPrices,
  getPriceHistory,
  getBusinessRecommendations,
  getMarketInsight,
  mergeWithBackend,
} from "@/services/marketData";
import { api } from "@/lib/api";
import type { MarketPrice, PriceHistory, MarketInsight, BusinessRecommendation } from "@/types/market";

function Skel({ h = 14, w = "100%" }: { h?: number; w?: string }) {
  return (
    <div className="skeleton" style={{ height: h, width: w, borderRadius: 8, background: "#e0e0e6" }} />
  );
}

const FACTORS = [
  { icon: "🌧️", title: "ปริมาณฝน / วันกรีด", desc: "ฝนมากกรีดไม่ได้ ทำให้ผลผลิตลด กดดันราคาขึ้น แต่ฝนแล้งนานก็กระทบต้นยาง" },
  { icon: "🌍", title: "ตลาดโลกและ Futures", desc: "ราคายาง SICOM สิงคโปร์และ TOCOM ญี่ปุ่นเป็นราคาอ้างอิงสำคัญของตลาดโลก" },
  { icon: "🇨🇳", title: "ความต้องการจากจีน", desc: "จีนเป็นผู้นำเข้ายางรายใหญ่ที่สุด ความต้องการจากอุตสาหกรรมยานยนต์และถุงมือมีผลโดยตรง" },
  { icon: "🚗", title: "อุตสาหกรรมยานยนต์", desc: "ยางรถยนต์ใช้ยางธรรมชาติเป็นส่วนประกอบหลัก ยอดขายรถโลกจึงมีผลต่อราคายาง" },
  { icon: "💱", title: "ค่าเงินบาท/ดอลลาร์", desc: "ยางส่งออกราคาดอลลาร์ บาทอ่อนทำให้เกษตรกรได้บาทมากขึ้น บาทแข็งกดราคา" },
];

const REGIONS = [
  {
    name: "ยะลา / ปัตตานี / นราธิวาส",
    icon: "🌿",
    area: "ภาคใต้ตอนล่าง",
    desc: "แหล่งผลิตยางพาราขนาดใหญ่ มีสหกรณ์และโรงงานรับซื้อหลายแห่ง ราคามักสูงกว่าภาคอื่นเล็กน้อยเพราะคุณภาพน้ำยางดี",
  },
  {
    name: "สงขลา / พัทลุง / ตรัง",
    icon: "🌾",
    area: "ภาคใต้ตอนกลาง",
    desc: "มีตลาดกลางยางพาราหาดใหญ่เป็นราคาอ้างอิง โลจิสติกส์ดี ส่งออกง่าย ราคาใกล้เคียงราคา กยท. มาก",
  },
  {
    name: "เบตง / รามัน",
    icon: "⛰️",
    area: "พื้นที่สูงชายแดน",
    desc: "ยางคุณภาพดีจากสภาพอากาศเย็น แต่ต้นทุนขนส่งสูง ราคาปากสวนอาจต่างจากราคากลาง 2-3 บาท/กก",
  },
];

export default function RubberPage() {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [histories, setHistories] = useState<Record<string, PriceHistory[]>>({});
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [rec, setRec] = useState<BusinessRecommendation | null>(null);
  const [explainId, setExplainId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "ตลาดยางพารา — AgriPulse";
    api.prices().catch(() => []).then((backendPrices) => {
      const p = mergeWithBackend(getRubberPrices(), backendPrices);
      const h: Record<string, PriceHistory[]> = {};
      p.forEach((price) => { h[price.id] = getPriceHistory(price.id, price.price ?? undefined); });
      setPrices(p);
      setHistories(h);
      setInsight(getMarketInsight("rubber"));
      setRec(getBusinessRecommendations("rubber")[0]);
      setLoading(false);
    });
  }, []);

  const today = new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <div style={{ height: 44, background: "#fff" }} />

      {/* Header */}
      <div style={{ background: "#fff", padding: "12px 16px 16px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>🌾 ตลาดยางพารา</div>
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>ราคายางวันนี้</div>
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
                  onExplain={() => setExplainId(explainId === p.id ? null : p.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* AI Insight */}
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>ผลกระทบภาคใต้</div>
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>ปัจจัยที่กระทบราคายาง</div>
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

        {/* Data disclaimer */}
        <div style={{ background: "#f9fafb", borderRadius: 10, padding: 12, fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>
          ⚠️ ราคาที่แสดงเป็นราคาอ้างอิงจากแหล่งที่อนุมัติ อาจมีความแตกต่างจากราคาจริงในพื้นที่ ควรตรวจสอบกับแหล่งต้นทาง
        </div>

      </div>
    </div>
  );
}
