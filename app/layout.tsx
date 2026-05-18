import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./convex-provider";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tulsa Training — Hybrid Athlete",
  description:
    "12-week hybrid athlete program — strength, hypertrophy, conditioning, recovery.",
  icons: {
    icon: "/tulsa-t-mark.png",
    apple: "/tulsa-t-mark.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${display.variable}`}
    >
      <body className="font-sans">
        <ConvexClientProvider>
          <div className="mx-auto max-w-screen-md pb-20">
            {children}
          </div>
          <BottomNav />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
