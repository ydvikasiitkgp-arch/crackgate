/** Public support / contact constants. Centralised so links stay consistent
 *  across the pay flow, trust sections and the Founder Console. */

// E.164 without '+'. WhatsApp deep-links use this form (wa.me/<number>).
export const SUPPORT_WHATSAPP = "917248556138";

/** WhatsApp community group invite — used for user-facing support CTAs. */
export const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/D0bRgzW1YPHH76Gu1PTsUI";

/** Official CrackGate social profiles. `label` keys into the icon set in social-icons.
 *  Canonical URLs — reuse these (or SOCIALS) anywhere socials are needed. */
export const SOCIALS = [
  { label: "YouTube", href: "https://www.youtube.com/@CrackGate" },
  { label: "Instagram", href: "https://www.instagram.com/crackgate.in/" },
  { label: "Telegram", href: "https://t.me/cracgate" },
  { label: "WhatsApp", href: WHATSAPP_COMMUNITY_URL },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/crackgate" },
] as const;

/** Build a wa.me link with an optional prefilled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SUPPORT_WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
