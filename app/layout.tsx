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
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
