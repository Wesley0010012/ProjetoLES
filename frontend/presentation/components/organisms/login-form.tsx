"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { AccessType } from "@/domain/models/access-type";
import type { MakeLogin } from "@/domain/usecases/make-login";
import { FormField } from "@/presentation/components/molecules/form-field";
import { setAuthenticationCookie } from "@/data/auth/authentication-cookie";

type LoginFormProps = {
  accessType: AccessType;
  makeLogin: MakeLogin;
  demoEmail: string;
  demoPassword: string;
};

type Feedback = { type: "error"; message: string } | null;

export function LoginForm({
  accessType,
  makeLogin,
  demoEmail,
  demoPassword,
}: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      const authentication = await makeLogin.execute({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        type: accessType,
      });

      const remember = form.get("remember") === "on";
      const storage = remember ? localStorage : sessionStorage;
      const otherStorage = remember ? sessionStorage : localStorage;

      otherStorage.removeItem("libra.authentication");
      storage.setItem(
        "libra.authentication",
        JSON.stringify({
          token: authentication.token,
          userId: authentication.userId,
          email: String(form.get("email") ?? "")
            .trim()
            .toLowerCase(),
          expiresAt: authentication.expiresAt.toISOString(),
          type: accessType,
        }),
      );
      sessionStorage.setItem(
        `libra.authentication.${accessType}`,
        storage.getItem("libra.authentication")!,
      );
      setAuthenticationCookie(authentication, accessType, remember);

      router.replace(accessType === "USER" ? "/customer/account" : "/admin");
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível entrar. Tente novamente.",
      });
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
        placeholder="Digite sua senha"
        autoComplete="current-password"
        minLength={8}
        required
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" name="remember" />
          <Label
            htmlFor="remember"
            className="cursor-pointer text-sm font-normal text-muted-foreground"
          >
            Lembrar de mim
          </Label>
        </div>
        <button
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          type="button"
        >
          Esqueci a senha
        </button>
      </div>

      {feedback && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription className="text-current">{feedback.message}</AlertDescription>
        </Alert>
      )}

      <Button
        className="h-11 w-full rounded-xl text-sm"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            Entrar
            <ArrowRight />
          </>
        )}
      </Button>

      {accessType === "USER" && (
        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem uma conta?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      )}

      <div className="rounded-xl border border-dashed bg-muted/50 px-4 py-3 text-xs leading-5 text-muted-foreground">
        <span className="font-semibold text-foreground">Acesso de teste</span>
        <br />
        {demoEmail} · {demoPassword}
      </div>
    </form>
  );
}
