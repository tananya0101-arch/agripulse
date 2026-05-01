"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mainTabs = [
  { href: "/",          icon: "🏠", label: "หน้าหลัก" },
  { href: "/rubber",    icon: "🌾", label: "ยางพารา" },
  { href: "/palm",      icon: "🌴", label: "ปาล์ม" },
  { href: "/durian",    icon: "🍈", label: "ทุเรียน" },
  { href: "/fertilizer",icon: "🌱", label: "ปุ๋ย & ตลาด" },
  { href: "/search",    icon: "🔍", label: "ค้นหา" },
  { href: "/brief",     icon: "📋", label: "Brief" },
  { href: "/watchlist", icon: "📌", label: "Watchlist" },
  { href: "/studio",    icon: "✨", label: "คอนเทนต์" },
];

const adminTabs = [
  { href: "/admin/sources", icon: "⚙️", label: "แหล่งข้อมูล" },
  { href: "/admin/review",  icon: "📋", label: "รีวิวข้อมูล" },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="desktop-sidebar">
      <div style={{ padding: "24px 16px 16px" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#4f46e5", letterSpacing: -0.5, marginBottom: 4 }}>
          🌾 AgriPulse
        </div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 28 }}>ตลาดเกษตรและปุ๋ยไทย</div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {mainTabs.map((t) => {
            const active = isActive(t.href);
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

        {/* Admin section */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#bbb", letterSpacing: 0.5, marginBottom: 8, paddingLeft: 4 }}>
            ADMIN
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {adminTabs.map((t) => {
              const active = isActive(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: active ? "#eef2ff" : "transparent",
                    color: active ? "#4f46e5" : "#777",
                    textDecoration: "none",
                    fontWeight: active ? 700 : 500,
                    fontSize: 13,
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{t.icon}</span>
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 10, color: "#bbb", lineHeight: 1.5 }}>
          AI-powered market intelligence<br />สำหรับธุรกิจเกษตรไทย
        </div>
      </div>
    </aside>
  );
}
