import Link from "next/link";
import { ONGC_PATTERN, buildOngcMockPlan, type OngcMock } from "@/data/ongc-mocks";
import { ongcLiveSetNos } from "@/data/ongc-mock-bank";
import { ONGC_PRICE_RUPEES } from "@/data/ongc";
import { AddToCartBtn } from "@/components/add-to-cart-btn";

export function OngcMockPlan({
  discipline,
  slug,
  unlocked,
}: {
  discipline: string;
  slug: string;
  unlocked: boolean;
}) {
  const payHref = `/pay/upi?plan=pro&exam=PSU&subject=${slug}`;
  const plan = buildOngcMockPlan(ongcLiveSetNos(slug));
  const liveCount = plan.filter((m) => m.status === "live").length;
  return (
    <section className="max-w-7xl mx-auto px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">{discipline} — {plan.length} Full-length Mock Tests</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            A complete ONGC CBT series in the official pattern:{" "}
            <b>{ONGC_PATTERN.questions} MCQs · {ONGC_PATTERN.durationMin / 60} hours · no negative marking</b> ·
            Domain Knowledge ({ONGC_PATTERN.sections[0].count} Q) + Aptitude ({ONGC_PATTERN.sections[1].count} Q) +
            General Awareness ({ONGC_PATTERN.sections[2].count} Q) + English ({ONGC_PATTERN.sections[3].count} Q).
          </p>
        </div>
        <span className="badge badge-pro shrink-0">
          {liveCount > 0 ? `${liveCount} of ${plan.length} live` : "Launching soon"}
        </span>
      </div>

      {unlocked ? (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-sm">
          <span aria-hidden className="text-ok">✓</span>
          <span className="font-semibold text-ink">{discipline} series unlocked.</span>
          <span className="text-muted">
            {liveCount > 0
              ? `All ${liveCount} mocks are open — start any set below.`
              : "Mocks open here as soon as each one ships."}
          </span>
        </div>
      ) : (
        <OngcPaywall discipline={discipline} slug={slug} payHref={payHref} count={plan.length} />
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plan.map((m) => (
          <MockCard key={m.no} mock={m} slug={slug} unlocked={unlocked} payHref={payHref} />
        ))}
      </div>
    </section>
  );
}

function OngcPaywall({ discipline, slug, payHref, count }: { discipline: string; slug: string; payHref: string; count: number }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-blue-400/30 bg-gradient-to-r from-[#003580] to-slate-900 text-white">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span aria-hidden className="mt-0.5 text-2xl">🔒</span>
          <div>
            <h3 className="text-lg font-extrabold">Unlock all {count} {discipline} mocks</h3>
            <p className="mt-1 max-w-xl text-sm text-white/70">
              Full official ONGC CBT pattern — {count} complete 85-question papers covering
              Domain Knowledge, Aptitude, General Awareness, and English.
              One payment, valid through the recruitment cycle.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
          <div className="text-right">
            <span className="text-3xl font-extrabold">₹{ONGC_PRICE_RUPEES}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={payHref}
              className="cg-neon inline-flex items-center justify-center gap-2 rounded-lg border border-blue-300/70 bg-blue-300/10 px-6 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-300/20"
            >
              Unlock now <span aria-hidden>→</span>
            </Link>
            <AddToCartBtn exam="PSU" subject={slug} variant="light" size="md" />
          </div>
          <span className="text-[11px] text-white/50">Pay via UPI · access in a few hours</span>
        </div>
      </div>
    </div>
  );
}

function MockCard({
  mock,
  slug,
  unlocked,
  payHref,
}: {
  mock: OngcMock;
  slug: string;
  unlocked: boolean;
  payHref: string;
}) {
  const live = mock.status === "live";
  const canStart = unlocked && live;
  return (
    <div className="card relative flex flex-col p-5 opacity-90">
      <span className="badge badge-pro absolute right-4 top-4">
        {live ? (unlocked ? "Ready" : "Locked") : "Coming soon"}
      </span>
      <div className="text-xs font-mono text-brand">Mock {String(mock.no).padStart(2, "0")}</div>
      <h4 className="mt-1 pr-20 font-bold text-ink leading-snug">{mock.title}</h4>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-md bg-canvas px-2 py-1">{mock.questions} Q</span>
        <span className="rounded-md bg-canvas px-2 py-1">{mock.durationMin} min</span>
      </div>

      <ul className="mt-3 space-y-1 text-xs text-muted">
        {mock.sections.map((s) => (
          <li key={s.name}>▸ {s.name} · {s.count} Q</li>
        ))}
      </ul>

      {canStart ? (
        <Link
          href={`/mocks/${slug}-${String(mock.no).padStart(2, "0")}`}
          className="btn btn-primary mt-4 w-full justify-center"
        >
          Start Mock
        </Link>
      ) : !unlocked ? (
        <Link
          href={payHref}
          title="Unlock to access"
          className="btn btn-ghost mt-4 w-full justify-center gap-2"
        >
          <span aria-hidden>🔒</span> Unlock to access
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled
          title="Coming soon"
          className="btn btn-ghost mt-4 w-full cursor-not-allowed justify-center opacity-60"
        >
          Start Mock
        </button>
      )}
    </div>
  );
}
