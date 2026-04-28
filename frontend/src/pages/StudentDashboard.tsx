import { useState } from "react";

import { reviewSection, type ReviewResponse, type Section } from "../lib/api";

const SECTIONS: { value: Section; label: string }[] = [
  { value: "ozgun_deger", label: "Özgün Değer" },
  { value: "yontem", label: "Yöntem" },
  { value: "is_paketleri", label: "İş Paketleri" },
  { value: "yaygin_etki", label: "Yaygın Etki" },
  { value: "risk_yonetimi", label: "Risk Yönetimi" },
];

const severityClass: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-emerald-100 text-emerald-800",
};

export default function StudentDashboard() {
  const [section, setSection] = useState<Section>("ozgun_deger");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResponse | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await reviewSection(section, text);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Taslak Analizi</h2>
        <p className="text-sm text-slate-500 mt-1">
          Bir bölüm seçin ve metninizi yapıştırın — yapay zeka rehberlik raporu üretsin.
        </p>

        <label className="block mt-5 text-sm font-medium text-slate-700">
          Bölüm
        </label>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value as Section)}
          className="mt-1 w-full rounded-md border-slate-300 border px-3 py-2 text-sm"
        >
          {SECTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <label className="block mt-4 text-sm font-medium text-slate-700">
          Metin
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
          placeholder="Bölüm metnini buraya yapıştırın..."
        />

        <button
          onClick={submit}
          disabled={loading || text.trim().length < 20}
          className="mt-4 px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {loading ? "Analiz ediliyor..." : "Analiz Et"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Geri Bildirim</h2>
        {!result && !loading && (
          <p className="text-sm text-slate-500 mt-1">
            Henüz bir analiz yapılmadı.
          </p>
        )}

        {result && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-brand-600">
                {result.score}
                <span className="text-base text-slate-400">/100</span>
              </div>
              <p className="text-sm text-slate-700">{result.summary}</p>
            </div>

            <div className="space-y-2">
              {result.findings.map((f, i) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-md p-3 text-sm"
                >
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${
                      severityClass[f.severity] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {f.severity.toUpperCase()}
                  </span>
                  <p className="mt-2 text-slate-800">{f.message}</p>
                  {f.suggestion && (
                    <p className="mt-1 text-slate-600 italic">
                      Öneri: {f.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {result.citations.length > 0 && (
              <div className="text-xs text-slate-500">
                Kaynaklar: {result.citations.join(", ")}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
