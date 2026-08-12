import Link from "next/link";
import { AshokaChakra } from "@/components/ashoka-chakra";
import {
  INDEPENDENCE_DAY_ACTIVE,
  INDEPENDENCE_DAY_DISCOUNT,
  INDEPENDENCE_DAY_PROMO_CODE,
} from "@/lib/celebration";

export function IndependenceDaySection() {
  if (!INDEPENDENCE_DAY_ACTIVE) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 pt-10">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF9933] via-white to-[#138808] p-1 shadow-lg">
        <div className="flex flex-col items-center gap-6 rounded-xl bg-surface px-6 py-8 text-center sm:flex-row sm:text-left">
          <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-line bg-white shadow-sm">
            <AshokaChakra size={64} />
          </div>

          <div className="flex-1">
            <span className="badge bg-[#FF9933]/10 text-[#B45309]">Independence Day Sale</span>
            <h2 className="mt-2 text-xl font-extrabold text-ink sm:text-2xl">
              {`${INDEPENDENCE_DAY_DISCOUNT.replace("up to", "Up to")} on Pro & Premium All-Access`}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Use code{" "}
              <code className="rounded bg-[#FF9933]/10 px-1.5 py-0.5 font-mono font-bold text-[#B45309]">
                {INDEPENDENCE_DAY_PROMO_CODE}
              </code>{" "}
              at checkout.
            </p>
          </div>

          <Link
            href="/pricing"
            className="btn btn-indian w-full shrink-0 sm:w-auto"
          >
            Get {INDEPENDENCE_DAY_DISCOUNT} &#x2192;
          </Link>
        </div>
      </div>
    </section>
  );
}