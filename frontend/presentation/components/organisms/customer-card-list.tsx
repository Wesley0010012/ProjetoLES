"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { SelfProfile } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";
import { AccountPageHeader } from "@/presentation/components/molecules/account-page-header";
import { Loading } from "./customer-account";
import { errorMessage, Feedback } from "./customer-personal-data";

export function CustomerCardList() {
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [message, setMessage] = useState("");
  async function reload() {
    setProfile(await gateway.profile());
  }
  useEffect(() => {
    gateway.profile().then(setProfile);
  }, [gateway]);
  async function remove(id: number) {
    if (!window.confirm("Deseja excluir este cartão?")) return;
    try {
      await gateway.deleteCard(id);
      await reload();
      setMessage(
        "Cartão excluído. Se ele era o preferencial, outro cartão foi definido automaticamente.",
      );
    } catch (cause) {
      setMessage(errorMessage(cause));
    }
  }
  if (!profile) return <Loading />;
  return (
    <div className="p-4">
      <AccountPageHeader
        eyebrow="Minha conta"
        title="Meus cartões"
        description="Consulte e exclua cartões cadastrados. Criação e edição são realizadas em páginas próprias."
      />
      {message && <Feedback message={message} />}
      <section className="liquid-glass rounded-3xl p-5 sm:p-7">
        <div className="flex flex-col gap-4 border-b border-white/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Cartões cadastrados</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.cards?.length ?? 0} registros
            </p>
          </div>
          <Link
            href="/customer/account/cards/new"
            className={buttonVariants({ className: "h-11 rounded-xl" })}
          >
            <Plus />
            Criar cartão
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {profile.cards?.map((card) => (
            <article
              key={card.id}
              className={`rounded-2xl border bg-white/75 p-5 shadow-sm ${card.preferred ? "border-primary/30 ring-2 ring-primary/5" : "border-white"}`}
            >
              <div className="flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="size-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>
                      {card.brand} •••• {card.lastFourDigits}
                    </strong>
                    {card.preferred && (
                      <small className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                        <Star className="size-3" />
                        Preferencial
                      </small>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{card.printedName}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {card.description || "Sem descrição"}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex gap-2 border-t pt-4">
                <Link
                  href={`/customer/account/cards/${card.id}/edit`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <Pencil />
                  Editar
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void remove(card.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 />
                  Excluir
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
