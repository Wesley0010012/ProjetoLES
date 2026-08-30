"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  KeyRound,
  Loader2,
  MapPin,
  Package,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import type { SelfProfile, StoreProduct } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";
import { RecommendationStrip } from "@/presentation/components/molecules/recommendation-strip";

export function CustomerAccount() {
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [recommendations, setRecommendations] = useState<StoreProduct[]>([]);
  useEffect(() => {
    Promise.all([gateway.profile(), gateway.recommendations("ACCOUNT")]).then(
      ([value, suggested]) => {
        setProfile(value);
        setRecommendations(suggested);
      },
    );
  }, [gateway]);
  if (!profile?.complete || !profile.customer) return <Loading />;
  return (
    <div className="p-4">
      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Minha conta
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold">
          Olá, {profile.customer.name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha uma área para consultar ou atualizar. Código {profile.customer.code}
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AccountLink
            href="/customer/account/personal"
            icon={UserRound}
            title="Dados pessoais"
          >
            Nome, contato e data de nascimento.
          </AccountLink>
          <AccountLink href="/customer/account/addresses" icon={MapPin} title="Endereços">
            {profile.addresses?.length ?? 0} endereços cadastrados.
          </AccountLink>
          <AccountLink href="/customer/account/cards" icon={CreditCard} title="Cartões">
            {profile.cards?.length ?? 0} cartões cadastrados.
          </AccountLink>
          <AccountLink
            href="/change-password?returnTo=/customer/account"
            icon={KeyRound}
            title="Senha e segurança"
          >
            Altere sua senha de acesso.
          </AccountLink>
          <AccountLink href="/customer/orders" icon={Package} title="Seus pedidos">
            Acompanhe pedidos e trocas.
          </AccountLink>
          <AccountLink href="/customer/cart" icon={ShoppingCart} title="Seu carrinho">
            Revise os itens da compra.
          </AccountLink>
        </div>
      </section>
      <div className="mt-4">
        <RecommendationStrip title="Recomendados para você" products={recommendations} />
      </div>
    </div>
  );
}
export function AccountLink({
  href,
  icon: Icon,
  title,
  children,
}: {
  href: string;
  icon: typeof UserRound;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-32 gap-4 rounded-2xl border border-[#d5d9d9] p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
        <Icon className="size-5" />
      </span>
      <span>
        <strong className="block">{title}</strong>
        <span className="mt-1 block text-sm leading-5 text-muted-foreground">
          {children}
        </span>
        <span className="mt-3 block text-xs font-semibold text-primary">
          Acessar área →
        </span>
      </span>
    </Link>
  );
}
export function Loading() {
  return (
    <div className="flex min-h-96 items-center justify-center">
      <Loader2 className="animate-spin" />
    </div>
  );
}
