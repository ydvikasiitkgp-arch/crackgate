"use client";

import { useRouter } from "next/navigation";

export default function CheckoutError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] grid place-items-center p-5">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-extrabold text-bad">500</h1>
        <p className="text-muted mt-3">Checkout hit a temporary issue. This is usually a brief database hiccup — please try again in a moment.</p>
        {error.digest && (
          <p className="text-xs text-muted mt-1">Error ID: <code className="font-mono">{error.digest}</code></p>
        )}
        <div className="flex gap-3 mt-6 justify-center">
          <button onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <button onClick={() => router.push("/cart")} className="btn btn-ghost">
            Back to cart
          </button>
        </div>
      </div>
    </div>
  );
}
