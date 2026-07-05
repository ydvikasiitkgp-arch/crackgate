import Link from "next/link";
import { auth } from "@/lib/auth";
import { FreshMockRunner } from "@/components/fresh-mock-runner";

export const metadata = {
  title: "Fresh Mock — Premium GATE-pattern Generator",
  description:
    "Generate a fresh GATE Mining mock test on demand. AI-curated questions from a 2000+ bank — unlimited unique mocks for premium users of CrackGate.",
};
export const dynamic = "force-dynamic";

export default async function FreshMockPage(props: { searchParams: Promise<{ seed?: string }> }) {
  const sp = await props.searchParams;
  const session = await auth();
  const plan = (session?.user as { plan?: string } | undefined)?.plan ?? "free";

  if (plan !== "premium") {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16 text-center">
        <div className="text-5xl">💎</div>
        <h1 className="text-3xl font-extrabold mt-4">Fresh Mock — Premium only</h1>
        <p className="text-muted mt-3 max-w-xl mx-auto">
          Generate an unlimited supply of fresh GATE-pattern mock tests from our 906-question bank.
          Every mock is unique (or replayable via seed) — perfect for the final stretch.
        </p>
        <ul className="text-left max-w-md mx-auto mt-6 space-y-2 text-sm">
          <li className="flex gap-2"><span className="text-ok">✓</span> 65 questions · 3 sections (GA + 1-mark + 2-mark)</li>
          <li className="flex gap-2"><span className="text-ok">✓</span> 100 marks, 180 minutes — exact GATE pattern</li>
          <li className="flex gap-2"><span className="text-ok">✓</span> Negative marking (−1/3 on 1-mark, −2/3 on 2-mark)</li>
          <li className="flex gap-2"><span className="text-ok">✓</span> Unlimited regenerations · share/replay via seed</li>
        </ul>
        <Link href="/pricing" className="btn btn-accent mt-8 inline-flex">Upgrade to Premium</Link>
      </div>
    );
  }

  return <FreshMockRunner initialSeed={sp.seed ? parseInt(sp.seed, 10) : undefined} />;
}
