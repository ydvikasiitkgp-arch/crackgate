export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for CrackGate.in — how we collect, use, and protect your personal data when you use our GATE and PSU exam preparation platform.",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto px-5 py-16">
      <h1>Privacy Policy</h1>
      <p><em>Last updated: 1 June 2026</em></p>
      <p>
        CrackGate.in ("we", "us") respects your privacy. This policy explains what data we collect,
        why, and your rights — drafted in line with the Indian DPDP Act, 2023.
      </p>
      <h2>Data we collect</h2>
      <ul>
        <li><b>Account</b> — name, email, profile picture (via Google Sign-In).</li>
        <li><b>Usage</b> — attempts, scores, time spent, pages visited.</li>
        <li><b>Payment</b> — handled entirely by Razorpay; we store only the order/payment IDs.</li>
      </ul>
      <h2>Where it lives</h2>
      <p>AWS data centres in Mumbai (ap-south-1). Encrypted at rest and in transit.</p>
      <h2>Your rights</h2>
      <ul>
        <li>Access — download your data via <a href="/dashboard">Dashboard → Export</a>.</li>
        <li>Delete — request deletion via support@crackgate.in.</li>
      </ul>
      <p>Grievance officer: grievance@crackgate.in.</p>
    </article>
  );
}
