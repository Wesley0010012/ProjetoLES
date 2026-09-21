"use client";
import { AddressTypeFields } from "@/presentation/components/molecules/address-type-fields";
import { useCustomerOptions } from "@/main/connectors/use-customer-options";
import { CustomerAddressTypeEnum } from "@/domain/models/customer";
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
  const options = useCustomerOptions();
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (addressId)
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
  }, [addressId, gateway]);
  const address = profile?.addresses?.find((item) => item.id === addressId);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (options.loading || options.error) return;
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
      type:
        address?.type === CustomerAddressTypeEnum.Primary
          ? CustomerAddressTypeEnum.Primary
          : text(form, "type"),
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
  if (addressId && !profile && !error)
    return <div className="p-8">Carregando endereço...</div>;
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
      {options.error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {options.error}{" "}
          <button type="button" onClick={options.retry} className="underline">
            Tentar novamente
          </button>
        </p>
      )}
      <form
        onSubmit={submit}
        className="liquid-glass grid gap-4 rounded-3xl p-5 sm:grid-cols-2 sm:p-7"
      >
        <Field name="name" label="Identificação" defaultValue={address?.name} />
        <AddressTypeFields
          options={options}
          residenceType={address?.residenceType}
          streetType={address?.streetType}
          disabled={options.loading || Boolean(options.error)}
        />
        <Field name="street" label="Logradouro" defaultValue={address?.street} />
        <Field name="number" label="Número" defaultValue={address?.number} />
        <Field name="district" label="Bairro" defaultValue={address?.district} />
        <Field name="zipCode" label="CEP" defaultValue={address?.zipCode} />
        <Field name="city" label="Cidade" defaultValue={address?.city} />
        <Field name="state" label="Estado" defaultValue={address?.state} />
        <Field name="country" label="País" defaultValue={address?.country ?? "Brasil"} />
        <Field
          name="observations"
          label="Observações"
          defaultValue={address?.observations}
          required={false}
        />
        <label className="grid gap-2 text-sm">
          Tipo de endereço
          <select
            name="type"
            defaultValue={address?.type ?? CustomerAddressTypeEnum.Delivery}
            disabled={address?.type === CustomerAddressTypeEnum.Primary}
          >
            <option value={CustomerAddressTypeEnum.Billing}>Cobrança</option>
            <option value={CustomerAddressTypeEnum.Delivery}>Entrega</option>
            {address?.type === CustomerAddressTypeEnum.Primary && (
              <option value={CustomerAddressTypeEnum.Primary}>Principal</option>
            )}
          </select>
        </label>
        <Button
          type="submit"
          disabled={saving || options.loading || Boolean(options.error)}
          className="h-11 sm:col-span-2"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {addressId ? "Salvar alterações" : "Criar endereço"}
        </Button>
      </form>
    </div>
  );
}
