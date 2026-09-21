"use client";
import { AddressTypeFields } from "@/presentation/components/molecules/address-type-fields";
import type { CustomerOptions } from "@/data/usecases/get-customer-options";
import { CustomerAddressTypeEnum } from "@/domain/models/customer";
import { useCustomerOptions } from "@/main/connectors/use-customer-options";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, MapPin, Plus, Trash2, UserRoundCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";

export function CompleteCustomerProfile() {
  const router = useRouter();
  const options = useCustomerOptions();
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressCount, setAddressCount] = useState(3);
  const [cardCount, setCardCount] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (options.loading || options.error) return;
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await gateway.completeProfile({
        name: text(form, "name"),
        gender: text(form, "gender"),
        birthDate: text(form, "birthDate"),
        document: text(form, "document"),
        phoneType: text(form, "phoneType"),
        phoneDdd: text(form, "phoneDdd"),
        phoneNumber: text(form, "phoneNumber"),
        addresses: Array.from({ length: addressCount }, (_, index) =>
          addressPayload(form, index),
        ),
        cards: Array.from({ length: cardCount }, (_, index) => cardPayload(form, index)),
      });
      router.replace("/customer/account");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Não foi possível completar o cadastro.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:py-8">
      <section className="bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <UserRoundCheck className="size-8 text-[#eb0907]" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#59201f]">
              Só falta uma etapa
            </p>
            <h1 className="text-3xl font-semibold">Complete seu cadastro</h1>
          </div>
        </div>
        <p className="mt-4 border-b pb-6 text-sm text-muted-foreground">
          Cadastre separadamente o endereço principal, o de cobrança e o de entrega. O
          principal identifica sua residência e não poderá ser excluído.
        </p>
        {error && <p className="mt-5 text-sm text-destructive">{error}</p>}
        {options.error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {options.error}{" "}
            <button type="button" onClick={options.retry} className="underline">
              Tentar novamente
            </button>
          </p>
        )}
        <form onSubmit={submit} className="mt-6 grid gap-7">
          <Section title="Dados pessoais">
            <Field name="name" label="Nome completo" />
            <Select
              name="gender"
              label="Gênero"
              options={options.genders.map(({ value, label }) => [value, label])}
            />
            <Field name="birthDate" label="Data de nascimento" type="date" />
            <Field name="document" label="CPF" />
            <Select
              name="phoneType"
              label="Tipo de telefone"
              options={options.phoneTypes.map(({ value, label }) => [value, label])}
            />
            <Field name="phoneDdd" label="DDD" />
            <Field name="phoneNumber" label="Número" />
          </Section>
          <fieldset>
            <legend className="mb-4 flex items-center gap-2 text-xl font-bold">
              <MapPin className="size-5 text-[#eb0907]" />
              Endereços
            </legend>
            <div className="grid gap-4">
              {Array.from({ length: addressCount }, (_, index) => (
                <AddressFields key={index} index={index} options={options} />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddressCount((value) => value + 1)}
              >
                <Plus />
                Adicionar endereço
              </Button>
              {addressCount > 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setAddressCount((value) => value - 1)}
                >
                  <Trash2 />
                  Remover último
                </Button>
              )}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 flex items-center gap-2 text-xl font-bold">
              <CreditCard className="size-5 text-[#eb0907]" />
              Cartões
            </legend>
            <p className="mb-4 text-sm text-muted-foreground">
              O cadastro de cartão é opcional e pode ser concluído mais tarde.
            </p>
            <div className="grid gap-4">
              {Array.from({ length: cardCount }, (_, index) => (
                <CardFields key={index} index={index} />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCardCount((value) => value + 1)}
              >
                <Plus />
                Adicionar cartão
              </Button>
              {cardCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setCardCount((value) => value - 1)}
                >
                  <Trash2 />
                  Remover último
                </Button>
              )}
            </div>
          </fieldset>
          <Button
            type="submit"
            className="h-11 bg-[#59201f] text-white hover:bg-[#eb0907]"
            disabled={saving || options.loading || Boolean(options.error)}
          >
            {saving && <Loader2 className="animate-spin" />}Salvar e continuar
          </Button>
        </form>
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-4 text-xl font-bold">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
function Field({
  name,
  label,
  type = "text",
  required = true,
  ...props
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <Label>{label}</Label>
      <Input name={name} type={type} required={required} {...props} />
    </label>
  );
}
function Select({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[][];
}) {
  return (
    <label className="grid gap-2 text-sm">
      <Label>{label}</Label>
      <select
        name={name}
        disabled={options.length === 0}
        required
        className="h-9 rounded border bg-white px-3"
      >
        {options.length === 0 && <option value="">Aguardando opções da API…</option>}
        {options.map(([value, textValue]) => (
          <option key={value} value={value}>
            {textValue}
          </option>
        ))}
      </select>
    </label>
  );
}
function text(form: FormData, name: string) {
  return String(form.get(name) ?? "");
}
function AddressFields({ index, options }: { index: number; options: CustomerOptions }) {
  const prefix = `address-${index}`;
  const title =
    index === 0
      ? "Endereço principal · protegido"
      : index === 1
        ? "Endereço de cobrança"
        : index === 2
          ? "Endereço de entrega"
          : `Endereço adicional ${index - 2}`;
  return (
    <section className="rounded-xl border bg-[#faf8f3] p-4">
      <h2 className="mb-4 font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name={`${prefix}-name`} label="Identificação" placeholder="Ex.: Casa" />
        <AddressTypeFields options={options} prefix={`${prefix}-`} />
        <Field name={`${prefix}-street`} label="Logradouro" />
        <Field name={`${prefix}-number`} label="Número" />
        <Field name={`${prefix}-district`} label="Bairro" />
        <Field name={`${prefix}-zipCode`} label="CEP" />
        <Field name={`${prefix}-city`} label="Cidade" />
        <Field name={`${prefix}-state`} label="Estado" />
        <Field name={`${prefix}-country`} label="País" defaultValue="Brasil" />
        <Field name={`${prefix}-observations`} label="Observações" required={false} />
      </div>
    </section>
  );
}
function CardFields({ index }: { index: number }) {
  const prefix = `card-${index}`;
  return (
    <section className="rounded-xl border bg-[#faf8f3] p-4">
      <h2 className="mb-4 font-semibold">
        Cartão {index + 1}
        {index === 0 ? " · preferencial" : ""}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name={`${prefix}-number`} label="Número" />
        <Field name={`${prefix}-printedName`} label="Nome impresso" />
        <Select
          name={`${prefix}-brand`}
          label="Bandeira"
          options={[
            ["VISA", "Visa"],
            ["MASTERCARD", "Mastercard"],
            ["ELO", "Elo"],
            ["AMERICAN_EXPRESS", "American Express"],
          ]}
        />
        <Field name={`${prefix}-securityCode`} label="CVV" />
      </div>
    </section>
  );
}
function addressPayload(form: FormData, index: number) {
  const prefix = `address-${index}`;
  return {
    name: text(form, `${prefix}-name`),
    residenceType: text(form, `${prefix}-residenceType`),
    streetType: text(form, `${prefix}-streetType`),
    street: text(form, `${prefix}-street`),
    number: text(form, `${prefix}-number`),
    district: text(form, `${prefix}-district`),
    zipCode: text(form, `${prefix}-zipCode`),
    city: text(form, `${prefix}-city`),
    state: text(form, `${prefix}-state`),
    country: text(form, `${prefix}-country`),
    observations: text(form, `${prefix}-observations`),
    type:
      [
        CustomerAddressTypeEnum.Primary,
        CustomerAddressTypeEnum.Billing,
        CustomerAddressTypeEnum.Delivery,
      ][index] ?? CustomerAddressTypeEnum.Delivery,
  };
}
function cardPayload(form: FormData, index: number) {
  const prefix = `card-${index}`;
  return {
    number: text(form, `${prefix}-number`),
    printedName: text(form, `${prefix}-printedName`),
    brand: text(form, `${prefix}-brand`),
    securityCode: text(form, `${prefix}-securityCode`),
    preferred: index === 0,
  };
}
