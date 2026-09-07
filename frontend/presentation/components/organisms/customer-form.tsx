"use client";

import { validatePassword } from "@/domain/rules/validate-password";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Customer, CustomerPayload } from "@/domain/models/customer";
import { makeCustomerGateway } from "@/main/factories/make-customer-gateway";
import { FormField } from "@/presentation/components/molecules/form-field";

export function CustomerForm({ customerId }: { customerId?: number }) {
  const router = useRouter();
  const gateway = useMemo(() => makeCustomerGateway(), []);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(customerId));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!customerId) return;
      try {
        setCustomer(await gateway.findById(customerId));
      } catch (cause) {
        setError(messageFrom(cause));
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [customerId, gateway]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const payload: CustomerPayload = {
      name: String(form.get("name") ?? ""),
      gender: String(form.get("gender") ?? ""),
      birthDate: String(form.get("birthDate") ?? ""),
      document: String(form.get("document") ?? ""),
      phoneType: String(form.get("phoneType") ?? ""),
      phoneDdd: String(form.get("phoneDdd") ?? ""),
      phoneNumber: String(form.get("phoneNumber") ?? ""),
      email: String(form.get("email") ?? ""),
      ...(password
        ? {
            password,
            passwordConfirmation: String(form.get("passwordConfirmation") ?? ""),
          }
        : {}),
    };

    try {
      const confirmation = String(form.get("passwordConfirmation") ?? "");
      if (!customerId || password || confirmation)
        validatePassword(password, confirmation);
      if (customerId) {
        await gateway.update(customerId, payload);
      } else {
        await gateway.create(payload);
      }
      router.push("/admin/customers");
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/customers"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para clientes
      </Link>
      <header className="border-b pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {customerId ? "Edição" : "Novo cadastro"}
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.045em]">
          {customerId ? "Editar cliente" : "Novo cliente"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {customerId
            ? "Alterações de e-mail e senha também atualizam o usuário associado."
            : "Cadastre somente o usuário. O cliente poderá completar endereços e demais dados em sua conta."}
        </p>
      </header>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="mt-6 flex min-h-64 items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="liquid-glass mt-6 grid gap-8 rounded-3xl p-5 shadow-xl shadow-black/5 sm:p-8"
        >
          <Section title="Dados pessoais">
            <FormField
              name="name"
              label="Nome completo"
              defaultValue={customer?.name}
              required
            />
            <Select
              name="gender"
              label="Gênero"
              defaultValue={customer?.gender}
              options={genderOptions}
            />
            <FormField
              name="birthDate"
              label="Data de nascimento"
              type="date"
              defaultValue={customer?.birthDate.slice(0, 10)}
              required
            />
            <FormField
              name="document"
              label="CPF"
              defaultValue={customer?.document}
              maxLength={14}
              required
            />
          </Section>

          <Section title="Contato">
            <Select
              name="phoneType"
              label="Tipo de telefone"
              defaultValue={customer?.phone.type}
              options={phoneOptions}
            />
            <FormField
              name="phoneDdd"
              label="DDD"
              defaultValue={customer?.phone.ddd}
              maxLength={2}
              required
            />
            <FormField
              name="phoneNumber"
              label="Número"
              defaultValue={customer?.phone.number}
              maxLength={11}
              required
            />
            <FormField
              name="email"
              label="E-mail de acesso"
              type="email"
              defaultValue={customer?.email}
              required
            />
          </Section>

          <Section title={customerId ? "Alterar senha (opcional)" : "Senha de acesso"}>
            <FormField
              name="password"
              label="Senha"
              type="password"
              minLength={8}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}"
              title="Use ao menos 8 caracteres, com letra maiúscula, minúscula e caractere especial."
              required={!customerId}
            />
            <FormField
              name="passwordConfirmation"
              label="Confirmação da senha"
              type="password"
              minLength={8}
              required={!customerId}
            />
          </Section>

          <div className="flex justify-end gap-3 border-t pt-6">
            <Link
              href="/admin/customers"
              className={buttonVariants({ variant: "outline" })}
            >
              Cancelar
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
              {isSaving ? "Salvando..." : "Salvar cliente"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-4 font-heading text-xl font-semibold">{title}</legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} defaultValue={defaultValue} required>
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const genderOptions = [
  { value: "MAN", label: "Homem" },
  { value: "WOMAN", label: "Mulher" },
  { value: "NON_BINARY", label: "Não binário" },
  { value: "SELF_DESCRIBED", label: "Autodescrito" },
  { value: "NOT_INFORMED", label: "Prefiro não informar" },
];

const phoneOptions = [
  { value: "MOBILE", label: "Celular" },
  { value: "HOME", label: "Residencial" },
  { value: "WORK", label: "Trabalho" },
  { value: "COMMERCIAL", label: "Comercial" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "OTHER", label: "Outro" },
];

function messageFrom(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Não foi possível concluir a operação.";
}
