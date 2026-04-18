import type { Metadata } from "next";
import { Cinzel, UnifrakturMaguntia, EB_Garamond } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const blackletter = UnifrakturMaguntia({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-blackletter",
  display: "swap",
});

const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grand Tour of Europa · MMXXVI",
  description:
    "Copenhagen → Prague → Vienna → Salzburg · 2026 Anno Domini",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${cinzel.variable} ${blackletter.variable} ${garamond.variable}`}
    >
      <body className="antialiased text-[#3a2416]">{children}</body>
    </html>
  );
}
