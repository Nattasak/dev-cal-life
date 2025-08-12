import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Life & Happiness Calculator",
  description:
    "Transparent heuristics for past, present, and future well-being with actionable next steps and a life calendar.",
  openGraph: {
    title: "Life & Happiness Calculator",
    description:
      "Estimate time left, see your well-being scores, and get simple next steps.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Life & Happiness Calculator",
    description:
      "Estimate time left, see your well-being scores, and get simple next steps.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Inline theme script to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (t === 'dark' || (!t && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch {}
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
