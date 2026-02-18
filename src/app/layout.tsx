import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SINTAS - Administrasi Surat",
  description: "Sistem Integrasi Administrasi Surat V31 .",
  keywords: ["Sintas", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://",
  },
  openGraph: {
    title: "Sintas",
    description: "Sistem Integrasi Administrasi Surat V31",
    url: "https://sintas31.verce.app",
    siteName: "Sintas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sintas",
    description: "Adm surat V31",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
