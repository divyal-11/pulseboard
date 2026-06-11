import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

import { Providers } from "./providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export const metadata: Metadata = {
  title: "PulseBoard — Real-time Infrastructure Dashboard",
  description: "Monitor your infrastructure in real-time with PulseBoard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground overflow-hidden transition-colors duration-300">
        <Providers>
          <div className="flex h-screen w-full">
            <Sidebar />
            <div className="flex flex-1 flex-col pl-[240px]">
              <TopBar />
              <main className="flex-1 overflow-y-auto custom-scrollbar">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
