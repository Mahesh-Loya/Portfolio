import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Reveal } from "@/components/reveal";
import { CommandPalette } from "@/components/command-palette";
import { ThemeScript } from "@/components/theme-script";

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

const SITE = "https://maheshloya.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Mahesh Loya — AI systems engineer",
    template: "%s · Mahesh Loya",
  },
  description:
    "I build AI-native systems that turn noisy reality into structured action — voice pipelines, retrieval over live inventory, and products that ship.",
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
    url: SITE,
    title: "Mahesh Loya — AI systems engineer",
    description:
      "I make noisy reality machine-readable. Voice pipelines, retrieval systems, and AI products in daily production use.",
    siteName: "Mahesh Loya",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahesh Loya — AI systems engineer",
    description:
      "I make noisy reality machine-readable. Voice pipelines, retrieval systems, and AI products in daily production use.",
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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${grotesk.variable} ${mono.variable} ${editorial.variable} grain`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-[var(--color-signal)] focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-[#0a0a0b]"
        >
          Skip to content
        </a>
        {children}
        <Reveal />
        <CommandPalette />
      </body>
    </html>
  );
}
