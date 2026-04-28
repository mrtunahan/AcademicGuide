const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const TOKEN_KEY = "ag_token";

export type Role = "student" | "advisor";

export type Section =
  | "ozgun_deger"
  | "yontem"
  | "is_paketleri"
  | "yaygin_etki"
  | "risk_yonetimi";

export type ProjectStatus = "draft" | "review" | "approved";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Project {
  id: number;
  title: string;
  abstract: string | null;
  status: ProjectStatus;
  student_id: number;
  student_name: string;
  advisor_id: number | null;
  ai_score: number | null;
  created_at: string;
  updated_at: string;
}

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

export interface DocumentItem {
  id: number;
  source: string;
  chunks_added: number;
  project_id: number | null;
  created_at: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Auth
export const login = (email: string, password: string) =>
  request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const register = (
  email: string,
  full_name: string,
  password: string,
  role: Role,
) =>
  request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, full_name, password, role }),
  });

export const authMe = () => request<User>("/api/auth/me");

// Projects
export const listProjects = () => request<Project[]>("/api/projects");
export const createProject = (title: string, abstract?: string) =>
  request<Project>("/api/projects", {
    method: "POST",
    body: JSON.stringify({ title, abstract }),
  });
export const updateProject = (
  id: number,
  patch: Partial<Pick<Project, "title" | "abstract" | "status">>,
) =>
  request<Project>(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
export const deleteProject = (id: number) =>
  request<void>(`/api/projects/${id}`, { method: "DELETE" });

// Analysis
export const reviewSection = (
  section: Section,
  text: string,
  project_id?: number,
) =>
  request<ReviewResponse>("/api/analysis/review", {
    method: "POST",
    body: JSON.stringify({ section, text, project_id }),
  });

// Documents
export const uploadDocument = (file: File, projectId?: number) => {
  const fd = new FormData();
  fd.append("file", file);
  if (projectId !== undefined) fd.append("project_id", String(projectId));
  return request<DocumentItem>("/api/documents", { method: "POST", body: fd });
};
export const listDocuments = (projectId?: number) => {
  const qs = projectId !== undefined ? `?project_id=${projectId}` : "";
  return request<DocumentItem[]>(`/api/documents${qs}`);
};

// RAG
export const queryRag = (question: string, top_k = 4) =>
  request<{ answer: string; chunks: { content: string; source: string }[] }>(
    "/api/rag/query",
    { method: "POST", body: JSON.stringify({ question, top_k }) },
  );
