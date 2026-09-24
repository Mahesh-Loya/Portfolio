import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Reveal } from "@/components/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { CommandPalette } from "@/components/command-palette";
import { ThemeScript } from "@/components/theme-script";
import { SITE_URL } from "@/lib/site-url";

const grotesk = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
});

const editorial = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mahesh Loya — AI systems engineer",
    template: "%s · Mahesh Loya",
  },
  description:
    "I build AI products that businesses actually use — WhatsApp assistants that handle voice notes and photos, voice agents that answer the phone, and search over your own data.",
  keywords: [
    "Mahesh Loya",
    "AI engineer",
    "RAG",
    "voice AI",
    "full-stack engineer",
    "Pune",
  ],
  authors: [{ name: "Mahesh Loya" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Mahesh Loya — AI systems engineer",
    description:
      "WhatsApp assistants, real-time voice agents, and retrieval over live data — shipped and in daily production use.",
    siteName: "Mahesh Loya",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahesh Loya — AI systems engineer",
    description:
      "WhatsApp assistants, real-time voice agents, and retrieval over live data — shipped and in daily production use.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The font variables must live on <html>, not <body>. The @theme block
    // defines --font-sans/-mono/-serif at :root in terms of these; if they are
    // only defined on <body>, those references are unresolvable at :root and
    // compute to invalid, and inheritance passes the invalid value down rather
    // than re-resolving it — so every font silently falls back to system.
    <html
      lang="en"
      data-theme="dark"
      className={`${grotesk.variable} ${mono.variable} ${editorial.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="grain">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-[var(--color-signal)] focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-[#0a0a0b]"
        >
          Skip to content
        </a>
        {children}
        <Reveal />
        <ScrollProgress />
        <CommandPalette />
      </body>
    </html>
  );
}
