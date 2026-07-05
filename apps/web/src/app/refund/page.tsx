export const metadata = {
  title: "Refund Policy",
  description:
    "Refund and cancellation policy for CrackGate.in — terms for premium plan subscriptions, mock test purchases, and access to GATE & PSU exam preparation content.",
};
export default function Refund() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto px-5 py-16">
      <h1>Refund Policy</h1>
      <p><em>Last updated: 1 June 2026</em></p>
      <p>
        Full refund within <b>7 days</b> of payment if you've attempted no more than one paid mock.
        Email billing@crackgate.in with your order ID. Refunds reach your source account
        within 5-7 working days via Razorpay.
      </p>
    </article>
  );
}
