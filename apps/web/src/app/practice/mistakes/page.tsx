import { MistakesDrill } from "@/components/mistakes-drill";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Drill mistakes",
  description:
    "Review and re-attempt your past mistakes from GATE mock tests and practice sessions. Targeted revision to strengthen weak areas for GATE Mining Engineering.",
  alternates: { canonical: "/practice/mistakes" },
};

export default function MistakesDrillPage() {
  return <MistakesDrill />;
}
