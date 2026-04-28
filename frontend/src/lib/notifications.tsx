import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { notificationStreamUrl } from "./api";
import { getToken, useAuth } from "./auth";

export interface NotificationItem {
  id: string;
  event: string;
  data: Record<string, unknown>;
  receivedAt: number;
  read: boolean;
}

interface NotificationContextValue {
  items: NotificationItem[];
  unread: number;
  markAllRead: () => void;
  clear: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    sourceRef.current?.close();
    sourceRef.current = null;

    if (!user) return;
    const token = getToken();
    if (!token) return;

    const es = new EventSource(notificationStreamUrl(token));
    sourceRef.current = es;

    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data) as { event: string; data: Record<string, unknown> };
        setItems((prev) =>
          [
            {
              id: crypto.randomUUID(),
              event: parsed.event,
              data: parsed.data,
              receivedAt: Date.now(),
              read: false,
            },
            ...prev,
          ].slice(0, 50),
        );
      } catch {
        /* ignore */
      }
    };

    es.onerror = () => {
      // browser will auto-reconnect for transient errors
    };

    return () => {
      es.close();
      sourceRef.current = null;
    };
  }, [user]);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);

  const value = useMemo(
    () => ({ items, unread, markAllRead, clear }),
    [items, unread, markAllRead, clear],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
