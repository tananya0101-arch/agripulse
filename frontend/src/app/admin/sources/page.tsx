"use client";
import { useEffect, useState } from "react";
import { getApprovedSources } from "@/services/marketData";
import type { ApprovedSource } from "@/types/market";

function Skel({ h = 14, w = "100%" }: { h?: number; w?: string }) {
  return (
    <div className="skeleton" style={{ height: h, width: w, borderRadius: 8, background: "#e0e0e6" }} />
  );
}

const SOURCE_TYPE_CONFIG = {
  official:     { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", label: "🏛️ ราชการ" },
  industry:     { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe", label: "🏭 อุตสาหกรรม" },
  news:         { bg: "#fffbeb", color: "#92400e", border: "#fde68a", label: "📰 ข่าว" },
  local_signal: { bg: "#f9fafb", color: "#374151", border: "#e5e7eb", label: "📍 ภาคสนาม" },
}

const TRUST_CONFIG = {
  high:   { bg: "#dcfce7", color: "#059669", label: "สูง" },
  medium: { bg: "#fff7ed", color: "#d97706", label: "ปานกลาง" },
  low:    { bg: "#fee2e2", color: "#dc2626", label: "ต่ำ" },
}

function SourceCard({ source }: { source: ApprovedSource }) {
  const typeConf = SOURCE_TYPE_CONFIG[source.sourceType]
  const trustConf = TRUST_CONFIG[source.trustLevel]

  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: 16,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      opacity: source.isActive ? 1 : 0.55,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", lineHeight: 1.3, marginBottom: 2 }}>
            {source.sourceName}
          </div>
          <div style={{ fontSize: 11, color: "#888" }}>{source.cropOrProduct}</div>
        </div>
        {/* Active toggle (visual only) */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 8,
        }}>
          <div style={{
            width: 36, height: 20, borderRadius: 10,
            background: source.isActive ? "#059669" : "#d1d5db",
            position: "relative", flexShrink: 0,
          }}>
            <div style={{
              position: "absolute", top: 2,
              left: source.isActive ? 18 : 2,
              width: 16, height: 16, borderRadius: "50%",
              background: "#fff",
              transition: "left 0.2s",
            }} />
          </div>
          <span style={{ fontSize: 11, color: source.isActive ? "#059669" : "#9ca3af", fontWeight: 600 }}>
            {source.isActive ? "เปิด" : "ปิด"}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        <span style={{
          fontSize: 11, fontWeight: 600,
          background: typeConf.bg, color: typeConf.color,
          border: `1px solid ${typeConf.border}`,
          borderRadius: 20, padding: "2px 8px",
        }}>
          {typeConf.label}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600,
          background: trustConf.bg, color: trustConf.color,
          borderRadius: 20, padding: "2px 8px",
        }}>
          ความน่าเชื่อถือ: {trustConf.label}
        </span>
      </div>

      {/* Detail rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#555" }}>
          <span style={{ color: "#9ca3af", flexShrink: 0 }}>ประเภทข้อมูล:</span>
          <span>{source.dataType}</span>
        </div>
        <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#555" }}>
          <span style={{ color: "#9ca3af", flexShrink: 0 }}>อัพเดท:</span>
          <span>{source.updateFrequency}</span>
        </div>
        {source.sourceUrl && (
          <div style={{ fontSize: 12 }}>
            <a
              href={source.sourceUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: "#4f46e5", textDecoration: "none" }}
            >
              {source.sourceUrl} ↗
            </a>
          </div>
        )}
        <div style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginTop: 2 }}>
          📄 {source.licenseNote}
        </div>
      </div>
    </div>
  )
}

export default function AdminSourcesPage() {
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<ApprovedSource[]>([]);

  useEffect(() => {
    document.title = "แหล่งข้อมูล — AgriPulse Admin";
    setTimeout(() => {
      setSources(getApprovedSources());
      setLoading(false);
    }, 300);
  }, []);

  const activeSources = sources.filter((s) => s.isActive);
  const inactiveSources = sources.filter((s) => !s.isActive);

  return (
    <div>
      <div style={{ height: 44, background: "#fff" }} />

      {/* Header */}
      <div style={{ background: "#fff", padding: "12px 16px 16px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: -0.4 }}>⚙️ แหล่งข้อมูล</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
              {loading ? "กำลังโหลด..." : `${activeSources.length} เปิดใช้งาน · ${inactiveSources.length} ปิด`}
            </div>
          </div>
          <button style={{
            padding: "9px 14px", borderRadius: 10,
            background: "#4f46e5", color: "#fff",
            border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 700,
          }}>
            + เพิ่มแหล่งข้อมูล
          </button>
        </div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Admin warning */}
        <div style={{
          background: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: 10, padding: "10px 12px",
          fontSize: 12, color: "#1d4ed8", lineHeight: 1.5,
        }}>
          🔒 หน้านี้สำหรับผู้ดูแลระบบ การเปลี่ยนแปลงแหล่งข้อมูลมีผลต่อข้อมูลที่แสดงให้ผู้ใช้ทั้งหมด
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3,4].map((i) => <Skel key={i} h={140} />)}
          </div>
        ) : (
          <>
            {/* Active sources */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", letterSpacing: 0.5, marginBottom: 8 }}>
                ✅ เปิดใช้งาน ({activeSources.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeSources.map((s) => <SourceCard key={s.id} source={s} />)}
              </div>
            </div>

            {/* Inactive sources */}
            {inactiveSources.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.5, marginBottom: 8 }}>
                  ⏸️ ปิดการใช้งาน ({inactiveSources.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {inactiveSources.map((s) => <SourceCard key={s.id} source={s} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
