import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Swim Unminced",
  description:
    "Night-chart swim planning with drift uncertainty and ship-risk overlays.",
};

const themeInitScript = `
(() => {
  try {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const next =
      stored === "night" || stored === "day" || stored === "system"
        ? stored
        : "night";
    root.dataset.theme = next;
  } catch {
    // noop
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="night" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
