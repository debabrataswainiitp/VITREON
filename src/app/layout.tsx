import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const rajdhani = Rajdhani({
  weight: "700",
  variable: "--font-rajdhani",
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

import { StarryBackground } from "@/components/layout/StarryBackground";
import { BackgroundOrbs } from "@/components/glass/BackgroundOrbs";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { InitialLoader } from "@/components/layout/InitialLoader";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={
        {
          baseTheme: dark,
          layout: {
            socialButtonsVariant: "iconButton",
            socialButtonsPlacement: "top",
          },
          variables: {
            fontFamily: "var(--font-inter), sans-serif",
            fontFamilyButtons: "var(--font-rajdhani), sans-serif",
          },
          elements: {
            card: "!bg-white/60 backdrop-blur-md",
            input: "!bg-white/30 !text-gray-200 !backdrop-blur-xl !border-none",
            anchorButton: "!bg-[#685ACA] hover:!bg-[#5849b9] !text-white !backdrop-blur-xl !border-none",
            formButtonPrimary: "!bg-[#685ACA] hover:!bg-[#5849b9] !text-white !backdrop-blur-xl !border-none",
            formButtonSecondary: "!bg-[#685ACA] hover:!bg-[#5849b9] !text-white !backdrop-blur-xl !border-none",
            formButtonReset: "!bg-[#685ACA] hover:!bg-[#5849b9] !text-white !backdrop-blur-xl !border-none",
          }
        } as any
      }
    >
      <html
        lang="en"
        className={clsx(rajdhani.variable, inter.variable, "antialiased cursor-none")}
        suppressHydrationWarning
      >
        <body suppressHydrationWarning className="min-h-screen flex flex-col font-sans relative text-[15px] sm:text-[16px] leading-[1.6]">
          <InitialLoader />
          <div className="bg-noise pointer-events-none opacity-50 z-[-1]"></div>
          <BackgroundOrbs />
          <StarryBackground />
          <CustomCursor />
          <ThemeToggle />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}