"use client";

interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low' | 'unknown'
}

const CONFIG = {
  high:    { color: '#059669', label: 'ความน่าเชื่อถือ: สูง' },
  medium:  { color: '#d97706', label: 'ความน่าเชื่อถือ: ปานกลาง' },
  low:     { color: '#dc2626', label: 'ความน่าเชื่อถือ: ต่ำ' },
  unknown: { color: '#9ca3af', label: 'ความน่าเชื่อถือ: ไม่ทราบ' },
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const cfg = CONFIG[confidence]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, color: '#555',
    }}>
      <span style={{
        display: 'inline-block',
        width: 7, height: 7,
        borderRadius: '50%',
        background: cfg.color,
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  )
}
