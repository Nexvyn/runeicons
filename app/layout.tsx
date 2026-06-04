import type { Metadata } from "next";
import { Geist, Geist_Mono, Gemunu_Libre, Inter, Inter_Tight } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ShapeProvider } from "@/lib/shape-context";
import { MotionProvider } from "@/provider/motion-provider";
import { ThemeProvider } from "@/provider/theme-provider";
import { Agentation } from "agentation";

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

export const metadata: Metadata = {
  title: "RuneIcon",
  description: "Beautiful icons for your next project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${gemunuLibre.variable} ${interTight.variable} antialiased`}
      >
        <MotionProvider>
          <ShapeProvider>
                {process.env.NODE_ENV === "development" && <Agentation />}

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
