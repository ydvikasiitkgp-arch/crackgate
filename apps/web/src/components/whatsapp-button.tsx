"use client";

/** Floating WhatsApp chat button — bottom-right on every page.
 *  Reads NEXT_PUBLIC_WHATSAPP_NUMBER (E.164 without '+'). */
export function WhatsAppButton() {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!num) return null;

  const msg = encodeURIComponent("Hi CrackGate team — I have a question about your prep platform.");
  const href = `https://wa.me/${num}?text=${msg}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 px-4 py-3 font-semibold text-sm"
    >
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="currentColor" d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.7 5.5 2.1 7.9L0 32l8.4-2.4c2.3 1.3 4.9 2 7.6 2 8.6 0 15.6-7 15.6-15.6S24.6.4 16 .4zm0 28.5c-2.5 0-4.9-.7-7-2l-.5-.3-5 1.4 1.4-4.9-.3-.5c-1.4-2.2-2.2-4.8-2.2-7.5C2.4 8.5 8.5 2.4 16 2.4S29.6 8.5 29.6 16 23.5 28.9 16 28.9zm7.4-9.8c-.4-.2-2.4-1.2-2.8-1.3-.4-.1-.6-.2-.9.2s-1.1 1.3-1.3 1.6c-.2.2-.5.3-.9.1-2.4-1.2-4-2.1-5.6-4.8-.4-.7.4-.7 1.2-2.2.1-.3.1-.5 0-.7l-1.3-3c-.3-.8-.7-.7-.9-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.5s1.5 4 1.7 4.3c.2.3 2.9 4.5 7.1 6.3 2.7 1.1 3.7 1.2 5 1 .8-.1 2.4-1 2.7-1.9.3-1 .3-1.8.2-1.9-.1-.2-.4-.3-.8-.5z"/>
      </svg>
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
