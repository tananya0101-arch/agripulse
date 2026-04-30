import Link from "next/link";
import type { Article } from "@/lib/api";

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชม. ที่แล้ว`;
  return `${Math.floor(diff / 86400)} วันที่แล้ว`;
}

const trustColors: Record<string, string> = {
  high: "#059669",
  medium: "#f59e0b",
  low: "#dc2626",
};

export default function ArticleCard({ article }: { article: Article }) {
  const display = article.title_th || article.title;
  return (
    <Link href={`/articles/${article.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          cursor: "pointer",
        }}
      >
        {/* Tags row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {article.category.slice(0, 2).map((c) => (
            <span
              key={c}
              style={{
                background: "#eef2ff",
                color: "#4f46e5",
                padding: "3px 8px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {c}
            </span>
          ))}
          {article.country.slice(0, 1).map((c) => (
            <span
              key={c}
              style={{
                background: "#fff7ed",
                color: "#ea580c",
                padding: "3px 8px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {c}
            </span>
          ))}
        </div>

        {/* Title */}
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111", lineHeight: 1.35 }}>
          {display}
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "#999" }}>
          <span style={{ fontWeight: 600, color: trustColors[article.trust_score] || "#888" }}>
            {article.source}
          </span>
          <span>·</span>
          <span>{timeAgo(article.published_at)}</span>
        </div>

        {/* AI summary preview */}
        {article.summary_ai && (
          <div
            style={{
              fontSize: 12,
              color: "#555",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.summary_ai}
          </div>
        )}
      </div>
    </Link>
  );
}
