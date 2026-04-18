import type { Metadata } from "next";
import { Cinzel, Poiret_One, EB_Garamond } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const poiret = Poiret_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-poiret",
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
  title: "Den Store Rejse · MMXXVI",
  description: "København · Prag · Wien · Salzburg",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${cinzel.variable} ${poiret.variable} ${garamond.variable}`}
    >
      <body className="antialiased bg-[#0b1828] text-[#ecd9b0]">
        {children}
      </body>
    </html>
  );
}
