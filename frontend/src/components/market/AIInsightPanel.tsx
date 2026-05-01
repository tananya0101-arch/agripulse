"use client";

import { useState } from 'react'
import type { MarketInsight } from '@/types/market'

interface AIInsightPanelProps {
  insight: MarketInsight
  defaultOpen?: boolean
}

export default function AIInsightPanel({ insight, defaultOpen = false }: AIInsightPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)

  async function copyContentIdea() {
    try {
      await navigator.clipboard.writeText(insight.contentIdea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
            🤖 วิเคราะห์ตลาดด้วย AI
          </div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{insight.title}</div>
        </div>
        <span style={{ fontSize: 18, color: '#4f46e5', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ▾
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Confirmed facts */}
          <div style={{ borderLeft: '3px solid #059669', paddingLeft: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 6 }}>
              ✅ ข้อเท็จจริงที่ยืนยันแล้ว
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {insight.confirmedFacts.map((fact, i) => (
                <li key={i} style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
                  • {fact}
                </li>
              ))}
            </ul>
          </div>

          {/* Possible drivers */}
          <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 6 }}>
              🔍 ปัจจัยที่ควรติดตาม
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {insight.possibleDrivers.map((d, i) => (
                <li key={i} style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
                  • {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Farmer impact */}
          <div style={{ borderLeft: '3px solid #d97706', paddingLeft: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
              👨‍🌾 ผลกระทบต่อเกษตรกร
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
              {insight.farmerImpact}
            </p>
          </div>

          {/* Fertilizer shop impact */}
          <div style={{ borderLeft: '3px solid #7c3aed', paddingLeft: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6d28d9', marginBottom: 4 }}>
              🏪 ผลกระทบต่อร้านปุ๋ย
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
              {insight.fertilizerShopImpact}
            </p>
          </div>

          {/* Content idea */}
          <div style={{ background: '#eef2ff', borderRadius: 10, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>💡 ไอเดียคอนเทนต์</span>
              <button
                onClick={copyContentIdea}
                style={{
                  fontSize: 11, color: copied ? '#059669' : '#4f46e5',
                  background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
                }}
              >
                {copied ? '✓ คัดลอกแล้ว' : '📋 คัดลอก'}
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
              {insight.contentIdea}
            </p>
          </div>

          {/* Uncertainty */}
          <div style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic', lineHeight: 1.5 }}>
            ⚠️ {insight.uncertainty}
          </div>

          {/* Sources */}
          <div style={{ fontSize: 10, color: '#9ca3af' }}>
            แหล่งข้อมูล: {insight.sources.join(' · ')}
          </div>

          {/* Disclaimer */}
          <div style={{
            background: '#fff7ed', border: '1px solid #fed7aa',
            borderRadius: 8, padding: '8px 12px',
            fontSize: 11, color: '#92400e', lineHeight: 1.5,
          }}>
            ⚠️ AI วิเคราะห์จากข้อมูลที่มี ตรวจสอบก่อนนำไปใช้
          </div>
        </div>
      )}
    </div>
  )
}
