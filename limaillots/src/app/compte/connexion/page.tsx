import type { Metadata } from "next";
import { ClientAuthPage } from "@/components/client/client-auth-page";

export const metadata: Metadata = {
  title: "Connexion Client",
  robots: { index: false, follow: false },
};

export default function ClientLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const raw = searchParams?.next ?? "/";
  const nextPath = raw.startsWith("/") ? raw : "/";

  return <ClientAuthPage nextPath={nextPath} />;
}
