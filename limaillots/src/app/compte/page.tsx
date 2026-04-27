import type { Metadata } from "next";
import { ClientAccountPage } from "@/components/client/client-account-page";

export const metadata: Metadata = {
  title: "Mon Compte",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <ClientAccountPage />;
}
