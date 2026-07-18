/** UI helpers — kept tiny on purpose. */
export function cn(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

export function fmtDate(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function secondsToHMS(s: number) {
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export function inr(paise: number): string {
  return "₹" + Math.round(paise / 100).toLocaleString("en-IN");
}
