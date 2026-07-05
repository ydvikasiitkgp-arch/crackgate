export const metadata = {
  title: "Contact",
  description:
    "Get in touch with the CrackGate team. Email us at support@crackgate.in or reach out via WhatsApp for help with GATE preparation, PSU exams, or your account.",
};
export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <h1 className="text-3xl font-extrabold">Get in touch</h1>
      <p className="text-muted mt-2">We reply within one working day.</p>
      <ul className="mt-8 space-y-4">
        <Row icon="📧" label="Support" value="support@crackgate.in" />
      </ul>
    </div>
  );
}
function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <li className="card p-5 flex items-center gap-4">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <div className="text-sm text-muted">{label}</div>
        <a href={`mailto:${value}`} className="font-semibold text-brand">{value}</a>
      </div>
    </li>
  );
}
