const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export type Article = {
  id: number;
  title: string;
  title_th: string | null;
  source: string;
  url: string;
  published_at: string;
  language: string;
  country: string[];
  category: string[];
  keywords: string[];
  summary_short: string | null;
  summary_ai: string | null;
  impact_ai: string | null;
  impact_thailand: string | null;
  impact_south_thailand: string | null;
  business_recommendation: string | null;
  trust_score: string;
  license_status: string;
  is_pinned: boolean;
};

export type Price = {
  id: number;
  product: string;
  product_th: string;
  price: number;
  currency: string;
  unit: string;
  price_type: string;
  region: string;
  source: string;
  date: string;
  trend_direction: string;
  change_percent: number;
};

export type Topic = {
  id: number;
  slug: string;
  name: string;
  name_th: string;
  synonyms: string[];
  category: string;
  follow_count: number;
  emoji: string;
};

export type Brief = {
  date: string;
  generated_at: string;
  fertilizer_summary: string;
  crop_summary: string;
  thailand_impact: string;
  south_thailand_impact: string;
  risk_signals: { level: string; message: string }[];
  business_actions: string[];
  content_ideas: string[];
  top_articles: { id: number; title: string; source: string }[];
  prices: Price[];
};

export const api = {
  articles: () => get<Article[]>("/articles/"),
  article: (id: number) => get<Article>(`/articles/${id}`),
  search: (q: string) =>
    get<{ query: string; count: number; expanded_terms: string[]; results: Article[] }>(`/search/?q=${encodeURIComponent(q)}`),
  prices: () => get<Price[]>("/prices/"),
  topics: () => get<Topic[]>("/topics/"),
  brief: () => get<Brief>("/ai/brief"),
  summarize: (article_id: number, style: string) =>
    post<{ summary: string; source: string; source_url: string }>("/ai/summarize", { article_id, style }),
  generateContent: (article_id: number, content_type: string, tone: string) =>
    post<{ id: number; body: string }>("/ai/generate-content", { article_id, content_type, tone }),
};
