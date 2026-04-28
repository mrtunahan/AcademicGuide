const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type Section =
  | "ozgun_deger"
  | "yontem"
  | "is_paketleri"
  | "yaygin_etki"
  | "risk_yonetimi";

export interface Finding {
  severity: "high" | "medium" | "low";
  message: string;
  suggestion?: string;
}

export interface ReviewResponse {
  section: Section;
  score: number;
  summary: string;
  findings: Finding[];
  citations: string[];
}

export async function reviewSection(
  section: Section,
  text: string,
): Promise<ReviewResponse> {
  const res = await fetch(`${API_BASE}/api/analysis/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section, text }),
  });
  if (!res.ok) {
    throw new Error(`Review failed: ${res.status}`);
  }
  return res.json();
}

export async function queryRag(
  question: string,
  topK = 4,
): Promise<{ answer: string; chunks: { content: string; source: string }[] }> {
  const res = await fetch(`${API_BASE}/api/rag/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, top_k: topK }),
  });
  if (!res.ok) {
    throw new Error(`Query failed: ${res.status}`);
  }
  return res.json();
}
