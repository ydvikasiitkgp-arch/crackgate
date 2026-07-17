"use client";

import { useEffect, useState } from "react";
import { Wifi } from "lucide-react";

/** Live visitor badge — subscribes to SSE and shows current online count. */
export function RealtimeBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/admin/realtime");
    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (typeof d.count === "number") setCount(d.count);
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  if (count === null) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ok/10 text-ok text-xs font-semibold tabular-nums">
      <Wifi className="w-3 h-3 animate-pulse" />
      {count} online now
    </div>
  );
}
