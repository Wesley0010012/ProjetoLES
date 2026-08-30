"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SelfProfile } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";
import { AccountPageHeader } from "@/presentation/components/molecules/account-page-header";
import { Loading } from "./customer-account";
export function CustomerPersonalData() {
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    gateway.profile().then(setProfile);
  }, [gateway]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      await gateway.updateProfile({
        name: text(form, "name"),
        email: text(form, "email"),
        birthDate: text(form, "birthDate"),
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
  if (!profile?.customer) return <Loading />;
  const customer = profile.customer;
  return (
    <div className="p-4">
      <AccountPageHeader
        eyebrow="Perfil"
        title="Dados pessoais"
        description="Atualize somente suas informações pessoais e de contato."
      />
      {message && <Feedback message={message} />}
      <form
        onSubmit={submit}
        className="liquid-glass grid gap-4 rounded-3xl p-5 sm:grid-cols-2 sm:p-7"
      >
        <Field name="name" label="Nome completo" defaultValue={customer.name} />
        <Field name="email" label="E-mail" type="email" defaultValue={customer.email} />
        <Field
          name="birthDate"
          label="Data de nascimento"
          type="date"
          defaultValue={customer.birthDate}
        />
        <div className="grid grid-cols-[90px_1fr] gap-3">
          <Field name="ddd" label="DDD" defaultValue={customer.phone.ddd} />
          <Field name="phone" label="Telefone" defaultValue={customer.phone.number} />
        </div>
        <Button disabled={saving} className="h-11 sm:col-span-2">
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
  required = true,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <Label>{label}</Label>
      <Input name={name} type={type} defaultValue={defaultValue} required={required} />
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
