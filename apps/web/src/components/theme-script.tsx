'use client';

/**
 * Anti-FOUC (Flash of Unstyled Content) theme script.
 * Runs before paint to read localStorage/system preference and set data-theme on <html>.
 * Uses a plain <script> tag instead of next/script to avoid lint issues with
 * beforeInteractive outside _document.js and the required id attribute.
 */
export function ThemeScript() {
  const themeScript = `(function(){try{var s=localStorage.getItem('cg.theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=s||(m?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
