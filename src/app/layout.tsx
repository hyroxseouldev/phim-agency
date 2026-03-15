import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PHIM Agency | 디자인 에이전시 랜딩 페이지",
  description:
    "브랜드 전략, 랜딩 페이지, 캠페인 비주얼을 연결해 전환까지 설계하는 디자인 에이전시 PHIM의 홈페이지입니다.",
  applicationName: "PHIM Agency",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("font-sans", geist.variable)}>
      <body className={`${manrope.variable} ${playfairDisplay.variable} antialiased`}> <TooltipProvider> {children} </TooltipProvider><Toaster /></body>
    </html>
  );
}
