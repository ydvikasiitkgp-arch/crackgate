export const metadata = {
  title: "About",
  description:
    "CrackGate is a test-prep platform built for serious GATE aspirants by IIT Kharagpur alumni. Combining academic depth with real exam insights for GATE Mining, Civil, Geology & PSU exams.",
  alternates: { canonical: "/about" },
};
export default function About() {
  return (
    <article className="max-w-3xl mx-auto px-5 py-16 text-ink">
      <h1 className="text-4xl font-extrabold tracking-tight">About CrackGate</h1>
      <p className="mt-4 text-lg text-ink/80 leading-relaxed">
        A test-prep platform built for serious GATE aspirants, combining academic depth with real exam insights.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Team</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Founder
          name="Vikas Yadav"
          role="Founder"
          credentials="M.Tech, IIT Kharagpur"
          blurb="Built CrackGate to help serious aspirants prepare beyond generic coaching."
        />
        <Founder
          name="Vishal Kumar"
          role="Co-founder"
          credentials="B.Tech, BIT Sindri · M.Tech, IIT Kharagpur"
          blurb="Curates question banks and validates solutions for accuracy and real-world relevance."
        />
      </div>
    </article>
  );
}

function Founder({
  name,
  role,
  credentials,
  blurb,
}: {
  name: string;
  role: string;
  credentials: string;
  blurb: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="card p-5 flex gap-4">
      <div className="shrink-0 w-12 h-12 rounded-full bg-brand/10 text-brand grid place-items-center font-bold">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="font-bold text-ink">{name}</div>
        <div className="text-xs uppercase tracking-wider text-muted font-semibold">{role}</div>
        <div className="text-sm text-ink/80 mt-1">{credentials}</div>
        <p className="text-sm text-muted mt-2 leading-snug">{blurb}</p>
      </div>
    </div>
  );
}
