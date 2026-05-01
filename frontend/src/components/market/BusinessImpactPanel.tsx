"use client";

import Link from 'next/link'
import type { BusinessRecommendation } from '@/types/market'

interface BusinessImpactPanelProps {
  rec: BusinessRecommendation
}

const CASH_FLOW_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  improving: { label: '📈 ดีขึ้น', bg: '#dcfce7', color: '#059669' },
  tight:     { label: '📉 ตึงตัว', bg: '#fee2e2', color: '#dc2626' },
  stable:    { label: '→ ทรงตัว', bg: '#f3f4f6', color: '#6b7280' },
  unknown:   { label: '— ไม่ทราบ', bg: '#f3f4f6', color: '#9ca3af' },
}

const DEMAND_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  increasing: { label: '📈 เพิ่มขึ้น', bg: '#dcfce7', color: '#059669' },
  decreasing: { label: '📉 ลดลง', bg: '#fee2e2', color: '#dc2626' },
  stable:     { label: '→ ทรงตัว', bg: '#f3f4f6', color: '#6b7280' },
  unknown:    { label: '— ไม่ทราบ', bg: '#f3f4f6', color: '#9ca3af' },
}

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      background: bg, color,
      borderRadius: 20, padding: '2px 10px',
      fontSize: 12, fontWeight: 700,
    }}>
      {label}
    </span>
  )
}

export default function BusinessImpactPanel({ rec }: BusinessImpactPanelProps) {
  const cashFlow = CASH_FLOW_LABELS[rec.farmerCashFlowSignal] ?? CASH_FLOW_LABELS.unknown
  const demand = DEMAND_LABELS[rec.fertilizerDemandSignal] ?? DEMAND_LABELS.unknown

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      padding: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Header */}
      <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
        💼 ผลกระทบต่อธุรกิจร้านปุ๋ย
      </div>

      {/* Signal box */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fde68a',
        borderRadius: 10, padding: '10px 12px',
        fontSize: 13, fontWeight: 600, color: '#92400e',
      }}>
        📡 {rec.signal}
      </div>

      {/* Info rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#555' }}>🌾 สัญญาณกำลังซื้อ</span>
          <Badge {...cashFlow} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#555' }}>📈 ความต้องการปุ๋ย</span>
          <Badge {...demand} />
        </div>
        <div style={{ fontSize: 12, color: '#555' }}>
          <span style={{ fontWeight: 600 }}>📦 สินค้าแนะนำ:</span>
          <span style={{ color: '#374151', marginLeft: 6 }}>{rec.productCategory}</span>
        </div>
      </div>

      {/* Suggested action */}
      <div style={{
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        borderRadius: 10, padding: '10px 12px',
        fontSize: 13, color: '#065f46', lineHeight: 1.5,
      }}>
        ✅ {rec.suggestedAction}
      </div>

      {/* Content idea */}
      <div style={{
        background: '#eef2ff', borderRadius: 10, padding: '10px 12px',
      }}>
        <div style={{ fontSize: 11, color: '#4f46e5', fontWeight: 700, marginBottom: 4 }}>
          💡 ไอเดียคอนเทนต์
        </div>
        <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, marginBottom: 8 }}>
          {rec.contentIdea}
        </div>
        <Link
          href="/studio"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 600,
            textDecoration: 'none',
            background: '#4f46e5', color: '#fff',
            borderRadius: 8, padding: '6px 12px',
          }}
        >
          ✨ สร้างคอนเทนต์
        </Link>
      </div>

      {/* Risk warning */}
      <div style={{ fontSize: 11, color: '#dc2626', lineHeight: 1.5 }}>
        ⚠️ {rec.riskWarning}
      </div>
    </div>
  )
}
