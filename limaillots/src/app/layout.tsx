import type { Metadata } from "next";
import { Rajdhani, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const heroFont = Rajdhani({
  variable: "--font-hero",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "LIMAILLOTS | Boutique football premium",
  description:
    "LIMAILLOTS - boutique moderne de maillots, crampons, chaussettes et accessoires pour étudiants et fans de football.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bodyFont.variable} ${heroFont.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}

