# SEO & Growth Plan — crackgate.in

## 🔴 Critical (fix immediately)

- [x] **#1: Add description metadata** to all 20+ pages that only have a title
- [x] **#2: Fix `/pricing` metadata** — client component → server layout wrapper
- [x] **#3: Add canonical URLs** — per-page; added to all 35+ pages including dynamic routes
- [x] **#4: Set up Google Search Console + GA4** — env vars + layout hooks added (needs real IDs from Google)
- [x] **#5: Create `/public/og-banner.svg`** — SVG fallback created; OG meta updated
- [x] **#6: Add JSON-LD structured data** — Organization + WebSite in root layout, FAQPage on /faq, Breadcrumb component with JSON-LD

## 🟡 High impact / low effort (1-2 days)

- [x] **#7: Auto-generate sitemap from data** — include learn topics (~159), study notes, CIL disciplines, subject sub-pages
- [x] **#8: Add email/newsletter capture** — Prisma model, API route, NewsletterForm component on landing + learn pages
- [x] **#9: Add "Share on WhatsApp" buttons** to learn, study, and CIL discipline pages
- [x] **#10: Add 3-5 student testimonials** on landing page (3 shown)
- [x] **#11: Add breadcrumb component** to all content pages (learn, study, CIL, gate/[subject])

## 🟢 Growth levers (1-2 weeks)

- [ ] **#12: Add blog/articles section** — target informational keywords ("How to prepare for GATE Mining 2027", etc.)
- [ ] **#13: Add subject-specific 300-500 word intros** on each `/gate/[subject]` page
- [ ] **#14: Implement referral/invite system** — share mock results → unlock free mocks
- [ ] **#15: Add "Coming Soon" email capture** for upcoming PSU subjects
- [x] **#16: Add per-page OG images** (dynamic, with subject name + stats) — via /api/og route

## 🗺️ 2-4 week roadmap

- [ ] **#17: PWA manifest + `theme-color` meta tag**
- [ ] **#18: Implement PostHog** (already configured in env but not imported)
- [ ] **#19: Core Web Vitals monitoring** (Lighthouse CI, CrUX)
- [ ] **#20: hreflang tags** if regional languages planned
