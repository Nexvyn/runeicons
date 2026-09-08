import type { Metadata, Viewport } from "next";
import { Caveat, Geist, Geist_Mono, Gemunu_Libre, Inter, Inter_Tight } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { ShapeProvider } from "@/lib/shape-context";
import { MotionProvider } from "@/provider/motion-provider";
import { ThemeProvider } from "@/provider/theme-provider";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gemunuLibre = Gemunu_Libre({
  variable: "--font-gemunu-libre",
  subsets: ["latin"],
  weight: ["700"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://runeicons.com";

const DESCRIPTION =
  "An open-source icon library where every glyph comes in five styles: outline, duotone, fill, pixelated and glass. Reshape any path in the browser, then copy it out as SVG or JSX. Apache 2.0 licensed.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rune Icons: open-source icons in five styles",
    template: "%s | Rune Icons",
  },
  description: DESCRIPTION,
  applicationName: "Rune Icons",
  authors: [{ name: "Nexvyn", url: "https://nexvyn.dev" }],
  creator: "Nexvyn",
  keywords: [
    "icons",
    "svg icons",
    "open source icons",
    "icon library",
    "react icons",
    "duotone icons",
    "pixel art icons",
    "glass icons",
    "Apache 2.0 licensed icons",
    "free icons for developers",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Rune Icons",
    locale: "en_US",
    url: SITE_URL,
    title: "Rune Icons: open-source icons in five styles",
    description: DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Rune Icons",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@RuneIcon",
    creator: "@RuneIcon",
    title: "Rune Icons: open-source icons in five styles",
    description: DESCRIPTION,
    images: [`${SITE_URL}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
  other: { "llms-txt": `${SITE_URL}/llms.txt` },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F5F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Rune Icons",
      url: SITE_URL,
      logo: `${SITE_URL}/icon`,
      sameAs: ["https://x.com/RuneIcon", "https://github.com/Nexvyn/runeicons"],
    },
    {
      "@type": "WebSite",
      name: "Rune Icons",
      url: SITE_URL,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="author" href="/humans.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${gemunuLibre.variable} ${interTight.variable} ${caveat.variable} antialiased`}
      >
        <MotionProvider>
          <ShapeProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster position="top-center" />
            </ThemeProvider>
          </ShapeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
