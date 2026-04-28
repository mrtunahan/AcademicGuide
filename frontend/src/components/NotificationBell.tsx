import { useState } from "react";
import { Link } from "react-router-dom";

import { useNotifications } from "../lib/notifications";

function formatTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff} sn önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  return new Date(ts).toLocaleTimeString();
}

export default function NotificationBell() {
  const { items, unread, markAllRead, clear } = useNotifications();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) markAllRead();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Bildirimler"
        data-testid="notification-bell"
        className="relative px-2 py-1 rounded-md text-slate-700 hover:bg-slate-200"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span
            data-testid="notification-badge"
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 grid place-items-center"
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-10">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-700">Bildirimler</span>
            <button
              onClick={clear}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Temizle
            </button>
          </div>

          {items.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Henüz bildirim yok.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((n) => {
                const projectId = n.data.project_id as number | undefined;
                const author = n.data.author_name as string | undefined;
                const body = n.data.body as string | undefined;
                const projectTitle = n.data.project_title as string | undefined;
                return (
                  <li key={n.id} className="p-3 text-sm">
                    <p className="font-medium text-slate-800">
                      {author ?? "Bildirim"}
                      {projectTitle && (
                        <span className="text-slate-500 font-normal">
                          {" — "}
                          {projectTitle}
                        </span>
                      )}
                    </p>
                    {body && (
                      <p className="text-slate-600 mt-1 line-clamp-2">{body}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                      <span>{formatTime(n.receivedAt)}</span>
                      {projectId !== undefined && (
                        <Link
                          to={`/projects/${projectId}`}
                          onClick={() => setOpen(false)}
                          className="text-brand-600 hover:underline"
                        >
                          Projeyi aç
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
