import type { Price } from "@/lib/api";

const trendIcon: Record<string, string> = { up: "▲", down: "▼", flat: "→" };
const trendColor: Record<string, string> = { up: "#dc2626", down: "#059669", flat: "#6b7280" };

export default function PriceCard({ price }: { price: Price }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>{price.product_th}</div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>
          {price.price_type} · {price.region} · {price.source}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
          {price.price.toLocaleString()} {price.currency}/{price.unit === "metric_ton" ? "ton" : price.unit}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: trendColor[price.trend_direction] || "#888",
          }}
        >
          {trendIcon[price.trend_direction]} {price.change_percent > 0 ? "+" : ""}{price.change_percent}%
        </div>
      </div>
    </div>
  );
}
