import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { SocialLinks } from "@/components/social-icons";
import { PricingLink } from "@/components/pricing-link";
import { AshokaChakra } from "@/components/ashoka-chakra";
import { INDEPENDENCE_DAY_ACTIVE } from "@/lib/celebration";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-20 bg-slate-900 text-slate-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
      <div className="max-w-7xl mx-auto px-5 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-white">
            <BrandMark size={36} />
            <span>
              CrackGate
            </span>
          </div>
          <p className="text-sm mt-3 text-slate-400 max-w-xs">
            India's dedicated GATE &amp; PSU test prep. Full-length mocks, topic-wise practice, SWOT analytics.
          </p>
          <div className="mt-4">
            <SocialLinks dark size="sm" />
          </div>
        </div>
        <FooterCol title="Resources">
          <FooterLink href="/blog">Blog</FooterLink>
          <FooterLink href="/news">News</FooterLink>
          <FooterLink href="/about">About Us</FooterLink>
          <FooterLink href="/about/careers">Careers</FooterLink>
        </FooterCol>
        <FooterCol title="Company">
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/faq">FAQ</FooterLink>
          <li><PricingLink className="text-sm text-slate-400 hover:text-white">Pricing</PricingLink></li>
        </FooterCol>
        <FooterCol title="Legal">
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
          <FooterLink href="/terms">Terms of Service</FooterLink>
          <FooterLink href="/refund">Refund Policy</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          © {year} CrackGate · Built for India's GATE &amp; PSU aspirants
          {INDEPENDENCE_DAY_ACTIVE && (
            <span className="inline-flex items-center gap-1.5 text-[#FFC34D]">
              <AshokaChakra size={14} aria-hidden /> Happy Independence Day!
            </span>
          )}
        </p>
      </div>
      {INDEPENDENCE_DAY_ACTIVE && (
        <div aria-hidden className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
      )}
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-white font-semibold mb-3">{title}</h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li><Link href={href} className="text-sm text-slate-400 hover:text-white">{children}</Link></li>
  );
}
