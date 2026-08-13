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
      {/* Subtle tricolour accent line at top of footer */}
      <div
        className="absolute inset-x-0 top-0 h-[1px]"
        aria-hidden
        style={{
          background: INDEPENDENCE_DAY_ACTIVE
            ? 'linear-gradient(90deg, transparent 5%, #FF9933 15%, #ffffff 40%, #138808 60%, #138808 85%, transparent 95%)'
            : 'linear-gradient(to right, transparent, #6366f1, transparent)',
          opacity: INDEPENDENCE_DAY_ACTIVE ? 0.85 : 0.5
        }}
      />

      <div className="max-w-7xl mx-auto px-5 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-white">
            <BrandMark size={36} />
            <span>CrackGate</span>
          </div>
          <p className="text-sm mt-3 text-slate-400 max-w-xs">
            India's dedicated GATE & PSU test prep. Full-length mocks, topic-wise practice, SWOT analytics.
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

      <div className="border-t border-slate-800 py-5">
        <p className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left text-xs text-slate-500">
          <span>© {year} CrackGate · Built for India's GATE & PSU aspirants</span>
          {INDEPENDENCE_DAY_ACTIVE && (
            <span className="inline-flex items-center gap-1.5 relative px-3 py-1 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255,153,51,0.12), rgba(19,136,8,0.12))',
                color: '#FFC34D',
                border: '1px solid rgba(255,153,51,0.2)'
              }}
            >
              <AshokaChakra size={12} aria-hidden />
              Happy Independence Day
            </span>
          )}
        </p>
      </div>

      {/* Subtle bottom edge accent */}
      {INDEPENDENCE_DAY_ACTIVE && (
        <div
          aria-hidden
          className="absolute bottom-0 inset-x-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent 5%, #FF9933 15%, #ffffff 40%, #138808 60%, #138808 85%, transparent 95%)',
            opacity: 0.85
          }}
        />
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