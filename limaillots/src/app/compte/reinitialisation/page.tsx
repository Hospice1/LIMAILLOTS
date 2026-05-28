import type { Metadata } from "next";
import { ClientResetPasswordPage } from "@/components/client/client-reset-password-page";

export const metadata: Metadata = {
  title: "Reinitialisation Client",
  robots: { index: false, follow: false },
};

export default function ClientResetPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  return <ClientResetPasswordPage token={searchParams?.token ?? ""} />;
}