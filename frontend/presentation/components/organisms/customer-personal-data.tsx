"use client";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ChangeEventHandler,
} from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SelfProfile } from "@/domain/models/storefront";
import { makeCustomerSelfGateway } from "@/main/factories/make-customer-self-gateway";
import { useCustomerOptions } from "@/main/connectors/use-customer-options";
import { AccountPageHeader } from "@/presentation/components/molecules/account-page-header";
import { Loading } from "./customer-account";
export function CustomerPersonalData() {
  const options = useCustomerOptions();
  const gateway = useMemo(() => makeCustomerSelfGateway(), []);
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    gateway
      .profile()
      .then(setProfile)
      .catch((cause) => setMessage(errorMessage(cause)));
  }, [gateway]);
  function updateField(
    name:
      | "name"
      | "email"
      | "birthDate"
      | "document"
      | "gender"
      | "phoneType"
      | "ddd"
      | "phone",
    value: string,
  ) {
    setProfile((current) => {
      if (!current?.customer) return current;
      const customer = current.customer;
      return {
        ...current,
        customer:
          name === "ddd" || name === "phone" || name === "phoneType"
            ? {
                ...customer,
                phone: {
                  ...customer.phone,
                  [name === "ddd" ? "ddd" : name === "phoneType" ? "type" : "number"]:
                    value,
                },
              }
            : { ...customer, [name]: value },
      };
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || options.loading || options.error) return;
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await gateway.updateProfile({
        name: text(form, "name"),
        email: text(form, "email"),
        birthDate: text(form, "birthDate"),
        document: text(form, "document"),
        gender: text(form, "gender"),
        phoneType: text(form, "phoneType"),
        ddd: text(form, "ddd"),
        phone: text(form, "phone"),
      });
      setProfile(await gateway.profile());
      setMessage("Dados pessoais alterados com sucesso.");
    } catch (cause) {
      setMessage(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }
  if (!profile?.customer) return message ? <Feedback message={message} /> : <Loading />;
  const customer = profile.customer;
  return (
    <div className="p-4">
      <AccountPageHeader
        eyebrow="Perfil"
        title="Dados pessoais"
        description="Atualize seu nome, CPF, nascimento, gênero e informações de contato."
      />
      {message && <Feedback message={message} />}
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
        <Field
          name="name"
          label="Nome completo"
          value={customer.name}
          onChange={(event) => updateField("name", event.target.value)}
        />
        <Field
          name="email"
          label="E-mail"
          type="email"
          value={customer.email}
          onChange={(event) => updateField("email", event.target.value)}
        />
        <Field
          name="birthDate"
          label="Data de nascimento"
          type="date"
          value={customer.birthDate.slice(0, 10)}
          onChange={(event) => updateField("birthDate", event.target.value)}
        />
        <Field
          name="document"
          label="CPF"
          value={customer.document}
          onChange={(event) => updateField("document", event.target.value)}
        />
        <label className="grid gap-2 text-sm">
          Gênero
          <select
            name="gender"
            value={customer.gender}
            onChange={(event) => updateField("gender", event.target.value)}
            required
            disabled={options.loading || Boolean(options.error)}
            className="h-10 rounded border bg-white px-3"
          >
            {options.loading && (
              <option value={customer.gender}>Carregando opções…</option>
            )}
            {options.genders.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Tipo de telefone
          <select
            name="phoneType"
            value={customer.phone.type}
            onChange={(event) => updateField("phoneType", event.target.value)}
            required
            disabled={options.loading || Boolean(options.error)}
            className="h-10 rounded border bg-white px-3"
          >
            {options.loading && (
              <option value={customer.phone.type}>Carregando opções…</option>
            )}
            {options.phoneTypes.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-[90px_1fr] gap-3">
          <Field
            name="ddd"
            label="DDD"
            value={customer.phone.ddd}
            onChange={(event) => updateField("ddd", event.target.value)}
          />
          <Field
            name="phone"
            label="Telefone"
            value={customer.phone.number}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </div>
        <Button
          type="submit"
          disabled={saving || options.loading || Boolean(options.error)}
          className="h-11 sm:col-span-2"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save />}Salvar dados pessoais
        </Button>
      </form>
    </div>
  );
}
export function Field({
  name,
  label,
  type = "text",
  defaultValue,
  value,
  onChange,
  required = true,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <Label>{label}</Label>
      <Input
        name={name}
        type={type}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        required={required}
      />
    </label>
  );
}
export function Feedback({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="mb-4 rounded-xl border border-primary/15 bg-white p-4 text-sm text-primary"
    >
      {message}
    </p>
  );
}
export function text(form: FormData, name: string) {
  return String(form.get(name) ?? "");
}
export function errorMessage(cause: unknown) {
  return cause instanceof Error
    ? cause.message
    : "Não foi possível salvar as alterações.";
}
