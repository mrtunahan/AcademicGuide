type Status = "draft" | "review" | "approved";

interface Project {
  id: string;
  student: string;
  title: string;
  status: Status;
  aiScore: number;
  updatedAt: string;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: "p-001",
    student: "Ayşe Yılmaz",
    title: "Yapay zeka destekli erken tanı sistemi",
    status: "review",
    aiScore: 78,
    updatedAt: "2 saat önce",
  },
  {
    id: "p-002",
    student: "Mehmet Demir",
    title: "Sürdürülebilir tarım için IoT sensör ağı",
    status: "draft",
    aiScore: 54,
    updatedAt: "1 gün önce",
  },
  {
    id: "p-003",
    student: "Zeynep Kara",
    title: "Düşük güçlü gömülü sistemlerde federe öğrenme",
    status: "approved",
    aiScore: 91,
    updatedAt: "3 gün önce",
  },
];

const COLUMNS: { status: Status; label: string }[] = [
  { status: "draft", label: "Taslak" },
  { status: "review", label: "İncelemede" },
  { status: "approved", label: "Onaylandı" },
];

const statusBadge: Record<Status, string> = {
  draft: "bg-slate-100 text-slate-700",
  review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
};

export default function AdvisorDashboard() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">
          Danışman Dashboard
        </h2>
        <p className="text-sm text-slate-500">
          Öğrencilerin başvuru ilerlemelerini ve yapay zeka ön değerlendirmelerini takip edin.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className="bg-slate-100 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {col.label}
            </h3>
            <div className="space-y-3">
              {MOCK_PROJECTS.filter((p) => p.status === col.status).map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-md p-3 border border-slate-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {p.title}
                      </p>
                      <p className="text-xs text-slate-500">{p.student}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${statusBadge[p.status]}`}
                    >
                      {p.aiScore}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Güncellendi: {p.updatedAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
