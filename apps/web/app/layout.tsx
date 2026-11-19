import type { Metadata } from "next";
import localFont from "next/font/local";
/* @ts-ignore */
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  weight: "100 900",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  weight: "100 900",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Formcraft",
  description: "Build, publish and manage forms in Formcraft Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
