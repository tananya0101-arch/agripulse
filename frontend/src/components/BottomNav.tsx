"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/",        icon: "🏠", label: "หน้าหลัก" },
  { href: "/rubber",  icon: "🌾", label: "ยางพารา" },
  { href: "/palm",    icon: "🌴", label: "ปาล์ม" },
  { href: "/brief",   icon: "📋", label: "Brief" },
  { href: "/studio",  icon: "✨", label: "คอนเทนต์" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="bottom-nav-mobile"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        background: "#fff",
        borderTop: "1px solid #e8e8e8",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        height: 60,
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {tabs.map((t) => {
        const active =
          t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              fontSize: 10,
              fontWeight: 600,
              color: active ? "#4f46e5" : "#888",
              textDecoration: "none",
              padding: "4px 10px",
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
