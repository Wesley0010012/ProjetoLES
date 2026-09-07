"use client";

import { PasswordStrengthRule } from "@/domain/rules/password-strength-rule";
import { validatePassword } from "@/domain/rules/validate-password";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Check, KeyRound, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { makeUsersGateway } from "@/main/factories/make-users-gateway";
import { BrandMark } from "@/presentation/components/atoms/brand-mark";

export function ChangePassword({
  recovery,
  returnTo,
}: {
  recovery: boolean;
  returnTo?: string;
}) {
  const router = useRouter();
  const gateway = useMemo(() => makeUsersGateway(), []);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const backPath = safeReturnPath(returnTo);
  const rules = new PasswordStrengthRule().requirements(password);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const confirmation = String(form.get("passwordConfirmation") ?? "");
    setLoading(true);
    setFeedback(null);
    try {
      validatePassword(password, confirmation);
      await gateway.changePassword(password, confirmation);
      router.replace(backPath);
    } catch (cause) {
      setFeedback({
        type: "error",
        message:
          cause instanceof Error ? cause.message : "Não foi possível atualizar a senha.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-svh place-items-center overflow-hidden p-5 sm:p-8">
      <div className="pointer-events-none fixed -left-32 -top-32 size-96 rounded-full bg-[#d47b2e]/15 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-36 -right-24 size-96 rounded-full bg-[#8f2d2c]/15 blur-3xl" />
      <section className="liquid-glass relative z-10 w-full max-w-lg rounded-[2rem] p-6 shadow-2xl sm:p-9">
        <div className="flex items-center justify-between">
          <BrandMark />
          <Link
            href={backPath}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        </div>
        <div className="mt-9 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eb0907] to-[#59201f] text-white shadow-lg shadow-[#59201f]/20">
          <KeyRound />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          {recovery ? "Recuperação de acesso" : "Segurança da conta"}
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.04em]">
          {recovery ? "Crie uma nova senha" : "Atualizar senha"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {recovery
            ? "Defina uma nova senha para recuperar o acesso à sua conta."
            : "Escolha uma nova senha e confirme abaixo."}
        </p>
        <form onSubmit={submit} className="mt-7 grid gap-5">
          <label className="grid gap-2 text-sm">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-xl border bg-white/50 p-3">
            {rules.map(({ label, valid }) => (
              <span
                key={label}
                className={`flex items-center gap-1.5 text-[11px] ${valid ? "font-medium text-[#18794e]" : "text-muted-foreground"}`}
              >
                <span
                  className={`grid size-4 place-items-center rounded-full ${valid ? "bg-[#18794e] text-white" : "border bg-white"}`}
                >
                  <Check className="size-2.5" />
                </span>
                {label}
              </span>
            ))}
            <span className="col-span-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="grid size-4 place-items-center rounded-full border border-primary/25 bg-primary/5 text-primary">
                <Check className="size-2.5" />
              </span>
              A nova senha não pode repetir nenhuma das três últimas senhas.
            </span>
          </div>
          <PasswordField
            name="passwordConfirmation"
            label="Confirmar nova senha"
            autoComplete="new-password"
          />
          {feedback && (
            <p
              role="status"
              className={`rounded-xl border p-3 text-sm ${feedback.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
            >
              {feedback.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="h-12 rounded-xl bg-gradient-to-r from-[#59201f] to-[#8f2d2c] shadow-lg shadow-[#59201f]/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}Atualizar
            senha
          </Button>
        </form>
      </section>
    </main>
  );
}

function PasswordField({
  name,
  label,
  autoComplete,
}: {
  name: string;
  label: string;
  autoComplete: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type="password" autoComplete={autoComplete} required />
    </label>
  );
}
function safeReturnPath(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}
