import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { connection } from "next/server";
import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { preferencesScript } from "@/components/preferences-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ticklog.net",
  ),
  // Every page is just "TickLog" in the browser tab.
  title: "TickLog",
  description: "Track your lifetime Minecraft stats.",
};

// Keeps everything inside out of the prerendered shell; otherwise Next.js
// prerenders the static parts of the sidebar and fills in the login later.
async function RequestTime({ children }: { children: React.ReactNode }) {
  await connection();
  return children;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-sidebar="expanded"
      // The preferences script changes these attributes before React hydrates.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
      </head>
      <body className="flex min-h-full">
        {/* The sidebar depends on the login, so the page streams in once it's
            known, complete, instead of showing parts of the sidebar later. */}
        <Suspense>
          <RequestTime>
            <Sidebar />
            {children}
          </RequestTime>
        </Suspense>
      </body>
    </html>
  );
}
