import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { createProject, listProjects, type Project } from "../lib/api";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createProject(title, abstract || undefined);
      setTitle("");
      setAbstract("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Projelerim</h2>
        <p className="text-sm text-slate-500">
          Bir 2209 başvurusu oluşturun ve taslaklar üzerinde AI mentorluğu alın.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
      >
        <h3 className="font-semibold text-slate-900">Yeni Proje</h3>
        <input
          required
          minLength={3}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Proje başlığı"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          rows={3}
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          placeholder="Kısa özet (opsiyonel)"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">
          Oluştur
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 divide-y">
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Yükleniyor...</p>
        ) : projects.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">Henüz proje yok.</p>
        ) : (
          projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="block p-4 hover:bg-slate-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-900">{p.title}</p>
                  {p.abstract && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {p.abstract}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span className="inline-block bg-slate-100 px-2 py-0.5 rounded">
                    {p.status}
                  </span>
                  {p.ai_score !== null && (
                    <p className="mt-1">AI: {p.ai_score}/100</p>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
