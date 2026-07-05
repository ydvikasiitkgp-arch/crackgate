"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Status = "online" | "offline" | "reconnected";

export function OfflineToast({ onReconnect }: { onReconnect?: () => void }) {
  const [status, setStatus] = useState<Status>("online");
  const [visible, setVisible] = useState(false);
  const timer = useRef<number>(0);

  const goOnline = useCallback(() => {
    if (status === "offline") {
      setStatus("reconnected");
      setVisible(true);
      onReconnect?.();
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setVisible(false), 3000);
    }
  }, [status, onReconnect]);

  const goOffline = useCallback(() => {
    setStatus("offline");
    setVisible(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!navigator.onLine) {
      setStatus("offline");
      setVisible(true);
    }
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      clearTimeout(timer.current);
    };
  }, [goOnline, goOffline]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-[90] px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-all duration-300 max-w-[90vw] text-center pointer-events-none",
        status === "offline"
          ? "bg-amber-100 text-amber-900 border border-amber-300"
          : "bg-emerald-100 text-emerald-900 border border-emerald-300",
      )}
    >
      {status === "offline" ? (
        <>You&apos;re offline — answers saved locally</>
      ) : (
        <>Back online — answers synced!</>
      )}
    </div>
  );
}
