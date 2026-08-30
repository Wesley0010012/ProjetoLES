"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SelfProfile } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";
import { AccountPageHeader } from "@/presentation/components/molecules/account-page-header";
import { Field, text } from "./customer-personal-data";

export function CustomerAddressForm({
  addressId,
  returnTo = "/customer/account/addresses",
}: {
  addressId?: number;
  returnTo?: string;
}) {
  const router = useRouter();
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (addressId) gateway.profile().then(setProfile);
  }, [addressId, gateway]);
  const address = profile?.addresses?.find((item) => item.id === addressId);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: text(form, "name"),
      residenceType: text(form, "residenceType"),
      streetType: text(form, "streetType"),
      street: text(form, "street"),
      number: text(form, "number"),
      district: text(form, "district"),
      zipCode: text(form, "zipCode"),
      city: text(form, "city"),
      state: text(form, "state"),
      country: text(form, "country"),
      observations: text(form, "observations"),
      billing: form.get("billing") === "on",
      delivery: form.get("delivery") === "on",
    };
    try {
      if (addressId) await gateway.updateAddress(addressId, payload);
      else await gateway.addAddress(payload);
      router.replace(returnTo);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Não foi possível salvar o endereço.",
      );
      setSaving(false);
    }
  }
  if (addressId && profile && !address)
    return <div className="p-8 text-center">Endereço não encontrado.</div>;
  return (
    <div className="p-4">
      <AccountPageHeader
        eyebrow={
          returnTo === "/customer/checkout" ? "Finalização do pedido" : "Endereços"
        }
        title={addressId ? "Editar endereço" : "Criar endereço"}
        description={
          addressId
            ? "Revise e salve somente os dados deste endereço."
            : "Cadastre um novo endereço de cobrança, entrega ou uso adicional."
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
        <Field name="name" label="Identificação" defaultValue={address?.name} />
        <Field name="residenceType" label="Tipo de residência" defaultValue="Casa" />
        <Field name="streetType" label="Tipo de logradouro" defaultValue="Rua" />
        <Field name="street" label="Logradouro" defaultValue={address?.street} />
        <Field name="number" label="Número" defaultValue={address?.number} />
        <Field name="district" label="Bairro" />
        <Field name="zipCode" label="CEP" />
        <Field name="city" label="Cidade" defaultValue={address?.city} />
        <Field name="state" label="Estado" defaultValue={address?.state} />
        <Field name="country" label="País" defaultValue="Brasil" />
        <Field name="observations" label="Observações" />
        <div className="flex flex-wrap gap-5 rounded-xl border bg-white/50 p-4 sm:col-span-2">
          <label className="text-sm">
            <input
              type="checkbox"
              name="billing"
              defaultChecked={address?.billing}
              disabled={address?.primary}
            />{" "}
            Cobrança
          </label>
          <label className="text-sm">
            <input
              type="checkbox"
              name="delivery"
              defaultChecked={address?.delivery}
              disabled={address?.primary}
            />{" "}
            Entrega
          </label>
          {address?.primary && (
            <span className="text-xs text-muted-foreground">
              O endereço principal permanece exclusivamente residencial.
            </span>
          )}
        </div>
        <Button disabled={saving} className="h-11 sm:col-span-2">
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {addressId ? "Salvar alterações" : "Criar endereço"}
        </Button>
      </form>
    </div>
  );
}
