import type { Metadata } from "next";
<<<<<<< HEAD
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
=======
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

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
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html
      lang="fr"
      className={`${bodyFont.variable} ${heroFont.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}

=======
    <html lang="fr" className="antialiased" suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
