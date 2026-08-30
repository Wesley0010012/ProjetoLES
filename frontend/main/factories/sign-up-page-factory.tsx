"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookHeart,
  PackageCheck,
  Sparkles,
  UserRoundPlus,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandMark } from "@/presentation/components/atoms/brand-mark";
import { SignUpForm } from "@/presentation/components/organisms/sign-up-form";
import { makeSignUp } from "./make-auth-usecases";

export function SignUpPageFactory() {
  const signUp = useMemo(() => makeSignUp(), []);

  return (
    <main className="auth-shell">
      <section className="auth-story" aria-label="Apresentação">
        <span className="book-shape book-shape--one" aria-hidden="true" />
        <span className="book-shape book-shape--two" aria-hidden="true" />
        <span className="book-shape book-shape--three" aria-hidden="true" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <BrandMark inverse />
          <div className="max-w-lg">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-xl">
              <Sparkles className="size-3.5 text-[#d47b2e]" />
              Sua próxima história começa aqui
            </span>
            <p className="font-heading text-5xl font-semibold leading-tight tracking-[-0.045em] text-white">
              Toda grande leitura começa com uma primeira página.
            </p>
            <p className="mt-5 max-w-md leading-7 text-white/65">
              Crie sua conta para guardar favoritos, acompanhar pedidos e receber
              recomendações.
            </p>
            <div className="mt-9 grid gap-3">
              <Benefit
                icon={BookHeart}
                text="Recomendações de livros para o seu perfil"
              />
              <Benefit
                icon={PackageCheck}
                text="Pedidos e trocas acompanhados em um só lugar"
              />
            </div>
          </div>
          <p className="text-xs text-white/45">
            © 2026 Libra · Histórias no seu equilíbrio
          </p>
        </div>
      </section>

      <section className="auth-form-panel relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#d47b2e]/10 blur-3xl" />
        <div className="relative z-10 w-full max-w-lg">
          <div className="mb-7 flex items-center justify-between lg:hidden">
            <BrandMark />
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="size-3.5" />
              Voltar
            </Link>
          </div>
          <Link
            href="/"
            className="mb-7 hidden w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition hover:-translate-x-0.5 hover:text-primary lg:inline-flex"
          >
            <ArrowLeft className="size-4" />
            Voltar ao início
          </Link>
          <div className="mb-6 grid grid-cols-2 gap-2" aria-label="Etapas do cadastro">
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Etapa 1
              </span>
              <p className="text-xs font-semibold">Criar acesso</p>
            </div>
            <div className="rounded-xl border border-dashed bg-white/35 px-3 py-2 text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Etapa 2
              </span>
              <p className="text-xs font-semibold">Completar perfil</p>
            </div>
          </div>
          <Card className="liquid-glass w-full bg-white/65 p-0 shadow-[0_24px_70px_rgba(89,32,31,0.12)] ring-1 ring-white/80">
            <CardHeader className="px-6 pb-6 pt-7 sm:px-8">
              <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eb0907] to-[#59201f] text-white shadow-lg shadow-[#59201f]/20">
                <UserRoundPlus className="size-5" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Nova conta
              </div>
              <CardTitle className="font-heading text-3xl tracking-[-0.04em] sm:text-4xl">
                Comece pela Libra
              </CardTitle>
              <CardDescription className="leading-6">
                Crie seus dados de acesso. Endereços e cartões poderão ser adicionados na
                próxima etapa.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-7 sm:px-8">
              <SignUpForm makeSignUp={signUp} />
            </CardContent>
          </Card>
          <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
            Ao continuar, você confirma que os dados informados são seus e serão usados
            apenas nesta experiência.
          </p>
        </div>
      </section>
    </main>
  );
}

function Benefit({ icon: Icon, text }: { icon: typeof BookHeart; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/75">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10">
        <Icon className="size-4 text-[#d47b2e]" />
      </span>
      {text}
    </div>
  );
}
