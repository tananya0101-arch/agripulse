"use client";

import type { PriceHistory } from '@/types/market'

interface PriceChartProps {
  history: PriceHistory[]
  height?: number
  color?: string
}

export default function PriceChart({ history, height = 60, color = '#4f46e5' }: PriceChartProps) {
  if (!history || history.length === 0) return null

  const W = 300
  const H = height
  const PAD_X = 0
  const PAD_Y = 6

  const prices = history.map((h) => h.price)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const range = maxP - minP

  // Map price to Y coordinate (inverted — high price = low Y)
  const toY = (p: number): number => {
    if (range === 0) return H / 2
    return PAD_Y + ((maxP - p) / range) * (H - PAD_Y * 2)
  }

  // Map index to X coordinate
  const toX = (i: number): number =>
    PAD_X + (i / Math.max(history.length - 1, 1)) * (W - PAD_X * 2)

  const points = history.map((h, i) => ({ x: toX(i), y: toY(h.price) }))

  // Build smooth SVG path using cubic bezier curves
  let pathD = `M ${points[0].x} ${points[0].y}`

  if (points.length === 1) {
    // Single dot — just a circle, path stays at origin
  } else {
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpX = (prev.x + curr.x) / 2
      pathD += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
    }
  }

  // Area fill path
  const lastPt = points[points.length - 1]
  const firstPt = points[0]
  const areaD = `${pathD} L ${lastPt.x} ${H} L ${firstPt.x} ${H} Z`

  const minLabel = minP.toLocaleString('th-TH', { maximumFractionDigits: 2 })
  const maxLabel = maxP.toLocaleString('th-TH', { maximumFractionDigits: 2 })

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        style={{ display: 'block', overflow: 'visible' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={areaD}
          fill={`url(#fill-${color.replace('#', '')})`}
        />

        {/* Line */}
        {points.length > 1 ? (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <circle cx={points[0].x} cy={points[0].y} r={4} fill={color} />
        )}

        {/* Last point dot */}
        {points.length > 1 && (
          <circle
            cx={lastPt.x}
            cy={lastPt.y}
            r={3}
            fill={color}
          />
        )}
      </svg>

      {/* Y-axis labels */}
      {range > 0 && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          height: H, pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 9, color: '#9ca3af', lineHeight: 1 }}>{maxLabel}</span>
          <span style={{ fontSize: 9, color: '#9ca3af', lineHeight: 1 }}>{minLabel}</span>
        </div>
      )}
    </div>
  )
}
