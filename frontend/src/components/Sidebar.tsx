"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/",          icon: "🏠", label: "หน้าหลัก" },
  { href: "/search",    icon: "🔍", label: "ค้นหา" },
  { href: "/brief",     icon: "📋", label: "Brief" },
  { href: "/watchlist", icon: "📌", label: "Watchlist" },
  { href: "/studio",    icon: "✨", label: "คอนเทนต์" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="desktop-sidebar">
      <div style={{ padding: "24px 16px 16px" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#4f46e5", letterSpacing: -0.5, marginBottom: 4 }}>
          🌾 AgriPulse
        </div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 28 }}>ตลาดเกษตรและปุ๋ยไทย</div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {tabs.map((t) => {
            const active = pathname === t.href || (t.href !== "/" && pathname.startsWith(t.href));
            return (
              <Link
                key={t.href}
                href={t.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: active ? "#eef2ff" : "transparent",
                  color: active ? "#4f46e5" : "#555",
                  textDecoration: "none",
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  transition: "background 0.15s",
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 10, color: "#bbb", lineHeight: 1.5 }}>
          AI-powered market intelligence<br />สำหรับธุรกิจเกษตรไทย
        </div>
      </div>
    </aside>
  );
}
