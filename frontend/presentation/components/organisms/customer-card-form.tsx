"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { SelfProfile } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";
import { AccountPageHeader } from "@/presentation/components/molecules/account-page-header";
import { Field, text } from "./customer-personal-data";

export function CustomerCardForm({
  cardId,
  returnTo = "/customer/account/cards",
}: {
  cardId?: number;
  returnTo?: string;
}) {
  const router = useRouter();
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (cardId)
      gateway
        .profile()
        .then(setProfile)
        .catch((cause) =>
          setError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível carregar o perfil.",
          ),
        );
  }, [cardId, gateway]);
  const card = profile?.cards?.find((item) => item.id === cardId);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      if (cardId)
        await gateway.updateCard(cardId, {
          description: text(form, "description"),
          preferred: card?.preferred || form.get("preferred") === "on",
        });
      else
        await gateway.addCard({
          number: text(form, "number"),
          printedName: text(form, "printedName"),
          brand: text(form, "brand"),
          securityCode: text(form, "securityCode"),
          description: text(form, "description"),
          preferred: card?.preferred || form.get("preferred") === "on",
        });
      router.replace(returnTo);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Não foi possível salvar o cartão.",
      );
      setSaving(false);
    }
  }
  if (cardId && !profile && !error)
    return <div className="p-8">Carregando cartão...</div>;
  if (cardId && profile && !card)
    return <div className="p-8 text-center">Cartão não encontrado.</div>;
  return (
    <div className="p-4">
      <AccountPageHeader
        eyebrow={returnTo === "/customer/checkout" ? "Finalização do pedido" : "Cartões"}
        title={cardId ? "Editar cartão" : "Criar cartão"}
        description={
          cardId
            ? "Por segurança, número, titular, bandeira e CVV não podem ser alterados. Edite a descrição ou defina o cartão preferencial."
            : "Cadastre um cartão em uma etapa separada da consulta dos cartões existentes."
        }
        backHref={returnTo}
        backLabel={
          returnTo === "/customer/checkout" ? "Voltar para o checkout" : undefined
        }
      />
      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </p>
      )}
      <form
        onSubmit={submit}
        className="liquid-glass grid gap-4 rounded-3xl p-5 sm:grid-cols-2 sm:p-7"
      >
        {cardId ? (
          <div className="flex items-center gap-3 rounded-2xl border bg-white/70 p-5 sm:col-span-2">
            <CreditCard className="text-primary" />
            <div>
              <strong>
                {card?.brand} •••• {card?.lastFourDigits}
              </strong>
              <p className="text-sm text-muted-foreground">{card?.printedName}</p>
            </div>
          </div>
        ) : (
          <>
            <Field name="number" label="Número" />
            <Field name="printedName" label="Nome impresso" />
            <label className="grid gap-2 text-sm">
              <Label>Bandeira</Label>
              <select name="brand" className="h-10 rounded-md border bg-background px-3">
                <option>VISA</option>
                <option>MASTERCARD</option>
                <option>ELO</option>
                <option>AMERICAN_EXPRESS</option>
              </select>
            </label>
            <Field name="securityCode" label="CVV" />
          </>
        )}
        <Field
          name="description"
          label="Descrição (ex.: Compras pessoais)"
          defaultValue={card?.description}
          required={false}
        />
        <label className="flex items-center gap-2 rounded-xl border bg-white/50 p-4 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="preferred"
            defaultChecked={card?.preferred}
            disabled={card?.preferred}
          />
          {card?.preferred
            ? "Este já é o cartão preferencial"
            : "Definir como cartão preferencial"}
        </label>
        <p className="text-xs leading-5 text-muted-foreground sm:col-span-2">
          A conta mantém apenas um cartão preferencial. Ao selecionar esta opção, o
          preferencial anterior será substituído.
        </p>
        <Button type="submit" disabled={saving} className="h-11 sm:col-span-2">
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {cardId ? "Salvar alterações" : "Criar cartão"}
        </Button>
      </form>
    </div>
  );
}
