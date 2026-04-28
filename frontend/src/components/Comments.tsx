import { useEffect, useState, type FormEvent } from "react";

import { addComment, listComments, type Comment } from "../lib/api";

export default function Comments({ projectId }: { projectId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const refresh = async () => {
    try {
      setComments(await listComments(projectId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [projectId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    setError(null);
    try {
      await addComment(projectId, body);
      setBody("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900">Yorumlar</h3>
      {loading ? (
        <p className="text-sm text-slate-500 mt-2">Yükleniyor...</p>
      ) : (
        <ul className="mt-3 space-y-3 max-h-64 overflow-y-auto">
          {comments.length === 0 && (
            <li className="text-sm text-slate-500">Henüz yorum yok.</li>
          )}
          {comments.map((c) => (
            <li
              key={c.id}
              className="border-b border-slate-100 pb-2 last:border-0 last:pb-0"
            >
              <div className="flex justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  {c.author_name}
                </span>
                <span>{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-4 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Bir yorum yazın..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={posting || !body.trim()}
          className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:bg-slate-300"
        >
          {posting ? "Gönderiliyor..." : "Gönder"}
        </button>
      </form>
    </div>
  );
}
