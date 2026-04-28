import { useEffect, useState, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";

import Comments from "../components/Comments";
import {
  lintText,
  listDocuments,
  reviewSection,
  uploadDocument,
  type DocumentItem,
  type LintResult,
  type ReviewResponse,
  type Section,
} from "../lib/api";

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

const lintTypeLabel: Record<string, string> = {
  passive_voice: "Pasif yapı",
  first_person: "1. şahıs",
  informal_tone: "Resmi olmayan",
  redundancy: "Tekrar",
  ambiguity: "Belirsizlik",
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const [section, setSection] = useState<Section>("ozgun_deger");
  const [text, setText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResponse | null>(null);

  const [lintLoading, setLintLoading] = useState(false);
  const [lintResult, setLintResult] = useState<LintResult | null>(null);
  const [lintError, setLintError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    listDocuments(projectId).then(setDocuments).catch(() => undefined);
  }, [projectId]);

  const submitReview = async () => {
    setReviewLoading(true);
    setReviewError(null);
    setResult(null);
    try {
      const res = await reviewSection(section, text, projectId);
      setResult(res);
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "Hata");
    } finally {
      setReviewLoading(false);
    }
  };

  const submitLint = async () => {
    setLintLoading(true);
    setLintError(null);
    setLintResult(null);
    try {
      const res = await lintText(text);
      setLintResult(res);
    } catch (e) {
      setLintError(e instanceof Error ? e.message : "Hata");
    } finally {
      setLintLoading(false);
    }
  };

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadDocument(file, projectId);
      setDocuments(await listDocuments(projectId));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Bölüm Analizi</h2>

        <label className="block mt-4 text-sm font-medium text-slate-700">Bölüm</label>
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

        <label className="block mt-4 text-sm font-medium text-slate-700">Metin</label>
        <textarea
          data-testid="section-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Bölüm metni..."
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={submitReview}
            disabled={reviewLoading || text.trim().length < 20}
            className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:bg-slate-300"
          >
            {reviewLoading ? "Analiz ediliyor..." : "Kriter Analizi"}
          </button>
          <button
            onClick={submitLint}
            disabled={lintLoading || text.trim().length < 20}
            className="px-4 py-2 rounded-md bg-slate-100 text-slate-800 text-sm font-medium hover:bg-slate-200 disabled:bg-slate-50"
          >
            {lintLoading ? "Dil kontrolü..." : "Akademik Dil Kontrolü"}
          </button>
        </div>
        {reviewError && <p className="mt-3 text-sm text-red-600">{reviewError}</p>}
        {lintError && <p className="mt-3 text-sm text-red-600">{lintError}</p>}
      </section>

      <section className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Kriter Geri Bildirimi</h2>
          {!result && (
            <p className="text-sm text-slate-500 mt-1">Henüz analiz yapılmadı.</p>
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
              {result.findings.map((f, i) => (
                <div key={i} className="border border-slate-200 rounded-md p-3 text-sm">
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${
                      severityClass[f.severity] ?? "bg-slate-100"
                    }`}
                  >
                    {f.severity.toUpperCase()}
                  </span>
                  <p className="mt-2 text-slate-800">{f.message}</p>
                  {f.suggestion && (
                    <p className="mt-1 text-slate-600 italic">Öneri: {f.suggestion}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {lintResult && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900">Akademik Dil Önerileri</h3>
            {lintResult.issues.length === 0 ? (
              <p className="text-sm text-emerald-700 mt-2">
                Önemli bir dil hatası bulunmadı.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {lintResult.issues.map((i, idx) => (
                  <li key={idx} className="border border-slate-200 rounded-md p-3 text-sm">
                    <span className="inline-block text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {lintTypeLabel[i.type] ?? i.type}
                    </span>
                    <p className="mt-2 text-slate-700 line-through">{i.original}</p>
                    <p className="text-slate-900">{i.suggestion}</p>
                    {i.explanation && (
                      <p className="text-xs text-slate-500 mt-1">{i.explanation}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {lintResult.rewritten && (
              <details className="mt-4">
                <summary className="text-sm text-brand-600 cursor-pointer">
                  Yeniden yazılmış metni göster
                </summary>
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                  {lintResult.rewritten}
                </p>
              </details>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900">Dökümanlar</h3>
          <p className="text-xs text-slate-500 mt-1">
            PDF veya metin yükleyin — bilgi tabanına eklensin.
          </p>
          <input
            type="file"
            accept=".pdf,.txt,.md"
            onChange={onUpload}
            disabled={uploading}
            className="mt-3 block w-full text-sm"
          />
          {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
          <ul className="mt-4 space-y-2 text-sm">
            {documents.length === 0 && (
              <li className="text-slate-500">Henüz döküman yok.</li>
            )}
            {documents.map((d) => (
              <li
                key={d.id}
                className="flex justify-between border-b border-slate-100 pb-1"
              >
                <span className="text-slate-700">{d.source}</span>
                <span className="text-xs text-slate-500">{d.chunks_added} chunk</span>
              </li>
            ))}
          </ul>
        </div>

        <Comments projectId={projectId} />
      </section>
    </div>
  );
}
