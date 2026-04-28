import { useEffect, useState } from "react";

import { listProjects, updateProject, type Project, type ProjectStatus } from "../lib/api";

const COLUMNS: { status: ProjectStatus; label: string }[] = [
  { status: "draft", label: "Taslak" },
  { status: "review", label: "İncelemede" },
  { status: "approved", label: "Onaylandı" },
];

const statusBadge: Record<ProjectStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
};

export default function AdvisorDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setProjects(await listProjects());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const move = async (project: Project, status: ProjectStatus) => {
    await updateProject(project.id, { status });
    await refresh();
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Danışman Dashboard</h2>
        <p className="text-sm text-slate-500">
          Öğrencilerin başvuru ilerlemelerini ve yapay zeka ön değerlendirmelerini takip edin.
        </p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Yükleniyor...</p>}

      <div className="grid md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className="bg-slate-100 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {col.label} ({projects.filter((p) => p.status === col.status).length})
            </h3>
            <div className="space-y-3">
              {projects
                .filter((p) => p.status === col.status)
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-md p-3 border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.student_name}</p>
                      </div>
                      {p.ai_score !== null && (
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${statusBadge[p.status]}`}
                        >
                          {p.ai_score}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex gap-1">
                      {COLUMNS.filter((c) => c.status !== p.status).map((c) => (
                        <button
                          key={c.status}
                          onClick={() => move(p, c.status)}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200"
                        >
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
