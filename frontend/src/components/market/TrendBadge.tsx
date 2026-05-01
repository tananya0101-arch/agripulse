"use client";

interface TrendBadgeProps {
  trend: 'up' | 'down' | 'stable' | 'no_data'
  changeValue?: number
  changePercent?: number
}

export default function TrendBadge({ trend, changeValue, changePercent }: TrendBadgeProps) {
  if (trend === 'up') {
    const valStr = changeValue != null ? `+${changeValue.toFixed(2)}` : ''
    const pctStr = changePercent != null ? `(+${changePercent.toFixed(1)}%)` : ''
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        background: '#dcfce7', color: '#059669',
        borderRadius: 20, padding: '3px 9px', fontSize: 11, fontWeight: 700,
        whiteSpace: 'nowrap',
      }}>
        ▲ {valStr} {pctStr}
      </span>
    )
  }
  if (trend === 'down') {
    const valStr = changeValue != null ? `${changeValue.toFixed(2)}` : ''
    const pctStr = changePercent != null ? `(${changePercent.toFixed(1)}%)` : ''
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        background: '#fee2e2', color: '#dc2626',
        borderRadius: 20, padding: '3px 9px', fontSize: 11, fontWeight: 700,
        whiteSpace: 'nowrap',
      }}>
        ▼ {valStr} {pctStr}
      </span>
    )
  }
  if (trend === 'stable') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        background: '#f3f4f6', color: '#6b7280',
        borderRadius: 20, padding: '3px 9px', fontSize: 11, fontWeight: 700,
        whiteSpace: 'nowrap',
      }}>
        → เท่าเดิม
      </span>
    )
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: '#f3f4f6', color: '#9ca3af',
      borderRadius: 20, padding: '3px 9px', fontSize: 11, fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      — ไม่มีข้อมูล
    </span>
  )
}
