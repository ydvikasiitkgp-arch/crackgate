import { getGateSubject } from "@/data/gate/registry";
import { SubjectHeader } from "@/components/subject-header";
import { PricingBody } from "./pricing-body";

export default async function PricingPage(props: { searchParams: Promise<{ subject?: string }> }) {
  const { subject = "" } = await props.searchParams;

  // Live non-mining subjects get their own mini-site header (the root layout
  // renders MiningHeader only when /pricing carries no subject or subject=mining).
  const meta = getGateSubject(subject);

  return (
    <>
      {meta && subject !== "mining" && <SubjectHeader subject={subject} />}
      <PricingBody defaultSubject={subject} />
    </>
  );
}
