import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
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
  title: "Scale Drop | Máxima Precisão e Controle",
  description:
    "A infraestrutura definitiva para escalar a operação do seu e-commerce com lucro real e rastreio de UTMs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className="dark scroll-smooth scroll-pt-24"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#FAFAFA] dark:bg-[#050505] text-zinc-900 dark:text-zinc-50 antialiased`}
      >
        <NextTopLoader
          color="#2563eb"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
        {children}
      </body>
    </html>
  );
}
