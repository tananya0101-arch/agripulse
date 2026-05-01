"use client";

interface SourceBadgeProps {
  sourceType: 'official' | 'industry' | 'news' | 'local_signal'
  sourceName: string
  sourceUrl?: string
}

const CONFIG = {
  official:     { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: '🏛️', label: 'ราชการ' },
  industry:     { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe', icon: '🏭', label: 'อุตสาหกรรม' },
  news:         { bg: '#fffbeb', color: '#92400e', border: '#fde68a', icon: '📰', label: 'ข่าว' },
  local_signal: { bg: '#f9fafb', color: '#374151', border: '#e5e7eb', icon: '📍', label: 'ภาคสนาม' },
}

export default function SourceBadge({ sourceType, sourceName, sourceUrl }: SourceBadgeProps) {
  const cfg = CONFIG[sourceType]
  const pill = (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 3 }}>
      {sourceUrl ? (
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          {pill}
        </a>
      ) : pill}
      {sourceType === 'local_signal' && (
        <span style={{ fontSize: 10, color: '#d97706' }}>
          ⚠️ ยังไม่ใช่ราคากลางทางการ
        </span>
      )}
    </span>
  )
}
