import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AgriPulse AI",
  description: "ข่าวสารและวิเคราะห์ตลาดปุ๋ยและเกษตรสำหรับธุรกิจไทย",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <div className="app-shell">
          <Sidebar />
          <main className="page-scroll">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
