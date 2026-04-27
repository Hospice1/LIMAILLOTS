import type { Metadata } from "next";
import { ClientAuthPage } from "@/components/client/client-auth-page";

export const metadata: Metadata = {
  title: "Connexion Client",
  robots: { index: false, follow: false },
};

export default function ClientLoginPage() {
  return <ClientAuthPage />;
}
