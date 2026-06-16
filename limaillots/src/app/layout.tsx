import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";

const bodyFont = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const headingFont = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["800"],
});

const heroFont = Montserrat({
  variable: "--font-hero",
  subsets: ["latin"],
  weight: ["800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://limaillots.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LIMAILLOTS | Boutique football premium",
    template: "%s | LIMAILLOTS",
  },
  description:
    "LIMAILLOTS - boutique moderne de maillots, crampons, chaussettes et accessoires pour etudiants et fans de football.",
  keywords: [
    "maillots football",
    "crampons",
    "chaussettes sport",
    "accessoires football",
    "boutique foot etudiant",
    "LIMAILLOTS",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "LIMAILLOTS",
    title: "LIMAILLOTS | Boutique football premium",
    description:
      "Decouvre les maillots, crampons et accessoires premium penses pour les etudiants et fans de football.",
    images: [
      {
        url: "/og-limaillots.svg",
        width: 1200,
        height: 630,
        alt: "LIMAILLOTS boutique football premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LIMAILLOTS | Boutique football premium",
    description:
      "Maillots, crampons et accessoires premium pour etudiants et fans de football.",
    images: ["/og-limaillots.svg"],
  },
  category: "shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bodyFont.variable} ${headingFont.variable} ${heroFont.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
