"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MakeSignOut } from "@/domain/usecases/make-sign-out";
import { clearAuthentication } from "@/data/auth/clear-authentication";

type StoredAuthentication = {
  token?: string;
};

type SignOutButtonProps = {
  makeSignOut: MakeSignOut;
  redirectTo?: string;
};

export function SignOutButton({
  makeSignOut,
  redirectTo = "/login",
}: SignOutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsLoading(true);
    setError(null);

    const serializedAuthentication =
      sessionStorage.getItem("libra.authentication") ??
      localStorage.getItem("libra.authentication");
    const authentication = serializedAuthentication
      ? (JSON.parse(serializedAuthentication) as StoredAuthentication)
      : null;

    try {
      if (authentication?.token) {
        await makeSignOut.execute(authentication.token);
      }

      clearAuthentication();
      router.replace(redirectTo);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Não foi possível encerrar a sessão.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={handleSignOut} disabled={isLoading}>
        <LogOut />
        {isLoading ? "Saindo..." : "Sair"}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
