"use client";

import { PasswordStrengthRule } from "@/domain/rules/password-strength-rule";
import { validatePassword } from "@/domain/rules/validate-password";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Check, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AccessType } from "@/domain/models/access-type";
import type { MakeSignUp } from "@/domain/usecases/make-sign-up";
import { FormField } from "@/presentation/components/molecules/form-field";
import { setAuthenticationCookie } from "@/data/auth/authentication-cookie";

type SignUpFormProps = {
  makeSignUp: MakeSignUp;
};

export function SignUpForm({ makeSignUp }: SignUpFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const passwordRules = new PasswordStrengthRule().requirements(password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      validatePassword(
        String(form.get("password") ?? ""),
        String(form.get("passwordConfirmation") ?? ""),
      );
      const authentication = await makeSignUp.execute({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        passwordConfirmation: String(form.get("passwordConfirmation") ?? ""),
      });

      sessionStorage.setItem(
        "libra.authentication",
        JSON.stringify({
          token: authentication.token,
          userId: authentication.userId,
          email: String(form.get("email") ?? "")
            .trim()
            .toLowerCase(),
          expiresAt: authentication.expiresAt.toISOString(),
          type: AccessType.USER,
        }),
      );
      sessionStorage.setItem(
        "libra.authentication.USER",
        sessionStorage.getItem("libra.authentication")!,
      );
      setAuthenticationCookie(authentication, AccessType.USER, false);

      router.replace("/customer/complete-profile");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Não foi possível criar sua conta.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <FormField
        id="email"
        name="email"
        type="email"
        label="E-mail"
        placeholder="voce@exemplo.com"
        autoComplete="email"
        required
      />
      <FormField
        id="password"
        name="password"
        type="password"
        label="Senha"
        placeholder="Mínimo de 8 caracteres"
        autoComplete="new-password"
        minLength={8}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <div
        className="-mt-2 grid grid-cols-2 gap-2 rounded-xl border border-white/80 bg-white/45 p-3"
        aria-label="Requisitos da senha"
      >
        {passwordRules.map((rule) => (
          <span
            key={rule.label}
            className={`flex items-center gap-1.5 text-[11px] transition ${rule.valid ? "font-medium text-[#18794e]" : "text-muted-foreground"}`}
          >
            <span
              className={`grid size-4 place-items-center rounded-full ${rule.valid ? "bg-[#18794e] text-white" : "border bg-white/60"}`}
            >
              <Check className="size-2.5" />
            </span>
            {rule.label}
          </span>
        ))}
      </div>
      <FormField
        id="passwordConfirmation"
        name="passwordConfirmation"
        type="password"
        label="Confirme sua senha"
        placeholder="Digite novamente"
        autoComplete="new-password"
        minLength={8}
        required
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        className="h-12 w-full rounded-xl bg-gradient-to-r from-[#59201f] to-[#8f2d2c] text-sm shadow-lg shadow-[#59201f]/20 transition hover:-translate-y-0.5 hover:from-[#8f2d2c] hover:to-[#eb0907]"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Criando conta...
          </>
        ) : (
          <>
            Criar minha conta
            <ArrowRight />
          </>
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já possui uma conta?{" "}
        <Link
          href="/"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Voltar para acessar
        </Link>
      </p>
    </form>
  );
}
