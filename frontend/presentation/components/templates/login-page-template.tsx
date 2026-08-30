import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AccessType } from "@/domain/models/access-type";
import type { MakeLogin } from "@/domain/usecases/make-login";
import { BrandMark } from "@/presentation/components/atoms/brand-mark";
import { LoginForm } from "@/presentation/components/organisms/login-form";

type LoginPageTemplateProps = {
  accessType: AccessType;
  makeLogin: MakeLogin;
  eyebrow: string;
  title: string;
  description: string;
  demoEmail: string;
  demoPassword: string;
  operator?: boolean;
};

export function LoginPageTemplate({
  accessType,
  makeLogin,
  eyebrow,
  title,
  description,
  demoEmail,
  demoPassword,
  operator = false,
}: LoginPageTemplateProps) {
  return (
    <main className={`auth-shell ${operator ? "auth-shell--operator" : ""}`}>
      <section className="auth-story" aria-label="Apresentação">
        <div className="relative z-10 flex h-full flex-col justify-between">
          <BrandMark inverse />

          <div className="max-w-lg">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
              {operator ? <ShieldCheck /> : <Sparkles />}
              {operator ? "Ambiente controlado" : "Sua próxima história começa aqui"}
            </span>
            <h1 className="font-heading text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl">
              {operator
                ? "Gestão simples para quem mantém tudo em movimento."
                : "Livros que encontram pessoas. Pessoas que encontram histórias."}
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/65">
              {operator
                ? "Acesse as ferramentas internas da operação com suas credenciais de trabalho."
                : "Entre para acompanhar pedidos, revisitar favoritos e descobrir sua próxima leitura."}
            </p>
          </div>

          <p className="text-xs text-white/45">
            © 2026 Libra · Histórias no seu equilíbrio
          </p>
        </div>
        <div className="book-shape book-shape--one" />
        <div className="book-shape book-shape--two" />
        <div className="book-shape book-shape--three" />
      </section>

      <section className="auth-form-panel">
        <div className="mb-10 lg:hidden">
          <BrandMark />
        </div>

        <Card className="w-full max-w-md border-0 bg-transparent p-0 shadow-none ring-0">
          <CardHeader className="px-0 pb-7">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <LockKeyhole className="size-3.5" />
              {eyebrow}
            </div>
            <CardTitle className="font-heading text-3xl tracking-[-0.04em]">
              {title}
            </CardTitle>
            <CardDescription className="max-w-sm text-sm leading-6">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <LoginForm
              accessType={accessType}
              makeLogin={makeLogin}
              demoEmail={demoEmail}
              demoPassword={demoPassword}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
