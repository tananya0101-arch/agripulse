"use client";

import Link from 'next/link'
import type { MarketPrice, PriceHistory } from '@/types/market'
import TrendBadge from './TrendBadge'
import ConfidenceBadge from './ConfidenceBadge'
import SourceBadge from './SourceBadge'
import PriceChart from './PriceChart'

interface MarketCardProps {
  price: MarketPrice
  showChart?: boolean
  history?: PriceHistory[]
  onExplain?: () => void
}

const TREND_COLOR: Record<string, string> = {
  up: '#059669',
  down: '#dc2626',
  stable: '#6b7280',
  no_data: '#9ca3af',
}

function formatThaiDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return iso
  }
}

function formatPrice(price: number | null, currency: string): string {
  if (price == null) return '—'
  return price.toLocaleString('th-TH', { maximumFractionDigits: 2 })
}

export default function MarketCard({ price, showChart, history, onExplain }: MarketCardProps) {
  const chartColor = TREND_COLOR[price.trend] ?? '#4f46e5'
  const priceDisplay = formatPrice(price.price, price.currency)

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      padding: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Top row: product name + trend badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.3, flex: 1 }}>
          {price.productTypeTh}
        </div>
        <TrendBadge
          trend={price.trend}
          changeValue={price.changeValue}
          changePercent={price.changePercent}
        />
      </div>

      {/* Price row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: -0.5, lineHeight: 1 }}>
          {priceDisplay}
        </span>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
          {price.currency}/{price.unit}
        </span>
        {price.previousPrice != null && (
          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 4 }}>
            จาก {formatPrice(price.previousPrice, price.currency)}
          </span>
        )}
      </div>

      {/* Chart */}
      {showChart && history && history.length > 0 && (
        <PriceChart history={history} height={56} color={chartColor} />
      )}

      {/* Confidence + Source badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <ConfidenceBadge confidence={price.confidence} />
        <SourceBadge
          sourceType={price.sourceType}
          sourceName={price.sourceName}
          sourceUrl={price.sourceUrl}
        />
      </div>

      {/* Source name + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#6b7280' }}>{price.sourceName}</span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatThaiDate(price.reportedAt)}</span>
      </div>

      {/* Market location */}
      {price.marketLocation && (
        <div style={{ fontSize: 11, color: '#6b7280' }}>
          📍 {price.marketLocation}
        </div>
      )}

      {/* Notes */}
      {price.notes && (
        <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.5, borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
          {price.notes}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        {onExplain && (
          <button
            onClick={onExplain}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 10,
              background: '#eef2ff',
              color: '#4f46e5',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            🤖 อธิบายด้วย AI
          </button>
        )}
        <Link
          href="/studio"
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 10,
            background: '#f0fdf4',
            color: '#059669',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✨ สร้างคอนเทนต์
        </Link>
      </div>
    </div>
  )
}
