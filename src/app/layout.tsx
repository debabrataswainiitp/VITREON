import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VITREON | Clarity, orchestrated.",
  description: "A multi-agent AI assistant platform.",
};

import { BackgroundOrbs } from "@/components/glass/BackgroundOrbs";
import { CustomCursor } from "@/components/layout/CustomCursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={clsx(spaceGrotesk.variable, inter.variable, "antialiased cursor-none")}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col font-sans relative text-[15px] sm:text-[16px] leading-[1.6]">
        <div className="bg-noise"></div>
        <BackgroundOrbs />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
