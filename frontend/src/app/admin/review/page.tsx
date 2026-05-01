"use client";
import { useEffect, useState } from "react";
import { getLocalSignals } from "@/services/marketData";
import type { LocalSignal } from "@/types/market";

function Skel({ h = 14, w = "100%" }: { h?: number; w?: string }) {
  return (
    <div className="skeleton" style={{ height: h, width: w, borderRadius: 8, background: "#e0e0e6" }} />
  );
}

const STATUS_CONFIG = {
  unverified: { bg: "#fff7ed", color: "#d97706", border: "#fde68a", label: "รอตรวจสอบ" },
  verified:   { bg: "#dcfce7", color: "#059669", border: "#86efac", label: "อนุมัติแล้ว" },
  rejected:   { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5", label: "ปฏิเสธ" },
}

const CONFIDENCE_CONFIG = {
  high:   { color: "#059669", label: "ความน่าเชื่อถือ: สูง" },
  medium: { color: "#d97706", label: "ความน่าเชื่อถือ: ปานกลาง" },
  low:    { color: "#dc2626", label: "ความน่าเชื่อถือ: ต่ำ" },
}

function SignalCard({ signal }: { signal: LocalSignal }) {
  const status = STATUS_CONFIG[signal.verificationStatus]
  const conf = CONFIDENCE_CONFIG[signal.confidence]

  const timeDisplay = (() => {
    try {
      return new Date(signal.timeReported).toLocaleString("th-TH", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    } catch { return signal.timeReported }
  })()

  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: 14,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{signal.productType}</div>
          <div style={{ fontSize: 11, color: "#888" }}>📍 {signal.location}</div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700,
          background: status.bg, color: status.color,
          border: `1px solid ${status.border}`,
          borderRadius: 20, padding: "3px 10px",
          whiteSpace: "nowrap",
        }}>
          {status.label}
        </span>
      </div>

      {/* Price */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 10 }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: "#111" }}>
          {signal.price.toLocaleString("th-TH", { maximumFractionDigits: 2 })}
        </span>
        <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
          THB/{signal.unit}
        </span>
      </div>

      {/* Detail rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ color: "#9ca3af" }}>รายงานโดย</span>
          <span style={{ color: "#374151", fontWeight: 600 }}>{signal.submittedBy}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ color: "#9ca3af" }}>เวลา</span>
          <span style={{ color: "#374151" }}>{timeDisplay}</span>
        </div>
        {signal.evidence && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "#9ca3af" }}>หลักฐาน</span>
            <span style={{ color: "#374151" }}>{signal.evidence}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, alignItems: "center" }}>
          <span style={{ color: "#9ca3af" }}>ความน่าเชื่อถือ</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: conf.color, fontWeight: 600, fontSize: 11 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: conf.color, display: "inline-block" }} />
            {conf.label}
          </span>
        </div>
      </div>

      {/* Notes */}
      {signal.notes && (
        <div style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginBottom: 10, lineHeight: 1.5 }}>
          {signal.notes}
        </div>
      )}

      {/* Action buttons (visual only) */}
      {signal.verificationStatus === "unverified" && (
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{
            flex: 1, padding: "8px 0", borderRadius: 10,
            background: "#f0fdf4", color: "#059669",
            border: "1.5px solid #86efac", cursor: "pointer",
            fontSize: 12, fontWeight: 700,
          }}>
            ✅ อนุมัติ
          </button>
          <button style={{
            flex: 1, padding: "8px 0", borderRadius: 10,
            background: "#fff", color: "#dc2626",
            border: "1.5px solid #fca5a5", cursor: "pointer",
            fontSize: 12, fontWeight: 700,
          }}>
            ❌ ปฏิเสธ
          </button>
        </div>
      )}
    </div>
  )
}

const TABS = [
  { key: "all",        label: "ทั้งหมด" },
  { key: "unverified", label: "รอตรวจสอบ" },
  { key: "verified",   label: "อนุมัติแล้ว" },
]

export default function AdminReviewPage() {
  const [loading, setLoading] = useState(true);
  const [signals, setSignals] = useState<LocalSignal[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unverified" | "verified">("all");

  useEffect(() => {
    document.title = "รีวิวข้อมูล — AgriPulse Admin";
    setTimeout(() => {
      setSignals(getLocalSignals());
      setLoading(false);
    }, 300);
  }, []);

  const filtered = signals.filter((s) => {
    if (activeTab === "all") return true;
    return s.verificationStatus === activeTab;
  });

  const pendingCount = signals.filter((s) => s.verificationStatus === "unverified").length;

  return (
    <div>
      <div style={{ height: 44, background: "#fff" }} />

      {/* Header */}
      <div style={{ background: "#fff", padding: "12px 16px 16px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: -0.4 }}>📋 รีวิวข้อมูล</div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
          {loading ? "กำลังโหลด..." : `${signals.length} รายการ · รอตรวจสอบ ${pendingCount} รายการ`}
        </div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Warning banner */}
        <div style={{
          background: "#fee2e2", border: "1.5px solid #fca5a5",
          borderRadius: 10, padding: "12px 14px",
          fontSize: 12, color: "#991b1b", lineHeight: 1.5, fontWeight: 600,
        }}>
          ⚠️ ข้อมูลด้านล่างยังไม่ผ่านการตรวจสอบ ห้ามแสดงเป็นราคากลางทางการ ต้องผ่านการรีวิวก่อนเผยแพร่
        </div>

        {/* Filter tabs */}
        <div style={{
          display: "flex", background: "#f3f4f6", borderRadius: 10, padding: 3, gap: 3,
        }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            const count = tab.key === "all" ? signals.length
              : signals.filter((s) => s.verificationStatus === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 8, border: "none",
                  background: active ? "#fff" : "transparent",
                  color: active ? "#4f46e5" : "#6b7280",
                  fontWeight: active ? 700 : 500,
                  fontSize: 12, cursor: "pointer",
                  boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "background 0.15s",
                }}
              >
                {tab.label}
                {!loading && (
                  <span style={{
                    marginLeft: 4, fontSize: 10,
                    background: active ? "#eef2ff" : "#e5e7eb",
                    color: active ? "#4f46e5" : "#6b7280",
                    borderRadius: 20, padding: "1px 6px",
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Signal list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map((i) => <Skel key={i} h={180} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af", fontSize: 13 }}>
            ไม่มีข้อมูลในหมวดนี้
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((s) => <SignalCard key={s.id} signal={s} />)}
          </div>
        )}

      </div>
    </div>
  );
}
