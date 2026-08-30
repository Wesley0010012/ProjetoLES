import type { Metadata } from "next";

import { ChangePassword } from "@/presentation/components/organisms/change-password";

export const metadata: Metadata = {
  title: "Alterar senha | Libra",
  description: "Altere ou recupere sua senha de acesso à Libra.",
};

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; token?: string; returnTo?: string }>;
}) {
  const params = await searchParams;
  return (
    <ChangePassword
      recovery={params.mode === "recovery" || Boolean(params.token)}
      returnTo={params.returnTo}
    />
  );
}
