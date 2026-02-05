import type { ReactNode } from "react";
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin", "greek"],
  variable: "--font-geist-sans",
  display: "swap",
});

const notoMono = Noto_Sans_Mono({
  subsets: ["latin", "greek"],
  variable: "--font-geist-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="el">
      <body
        className={`${notoSans.variable} ${notoMono.variable} min-h-screen bg-background text-foreground font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
