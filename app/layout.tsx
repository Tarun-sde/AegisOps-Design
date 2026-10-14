import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/geist-mono";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
export const metadata: Metadata = {
  title: {
    default: "Heron AI — Works inside your design tools",
    template: "%s — Heron AI",
  },
  description:
    "An architectural concept experience. An AI agent that observes, advises, acts, and learns inside your design tools.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("heron-entered")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("heron-skip-loader")}catch{}`,
          }}
        />
        <noscript>
          <style>{`.preloader { display: none !important; }`}</style>
        </noscript>
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
