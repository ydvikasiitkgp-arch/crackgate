"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm({ source = "landing" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setStatus("success");
        setMsg("You're subscribed! Check your inbox for updates.");
        setEmail("");
      } else {
        setStatus("error");
        setMsg(json?.error ? "Invalid email." : "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        disabled={status === "loading"}
        className="flex-1 rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn btn-accent shrink-0"
      >
        {status === "loading" ? "Sending…" : "Subscribe"}
      </button>
      {msg && (
        <p className={`text-sm ${status === "success" ? "text-green-600" : "text-red-600"}`}>
          {msg}
        </p>
      )}
    </form>
  );
}
