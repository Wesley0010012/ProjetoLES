"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  MapPin,
  Pencil,
  ReceiptText,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type {
  Customer,
  CustomerAddress,
  CustomerCard,
  CustomerPayload,
} from "@/domain/models/customer";
import type { Sale } from "@/domain/models/sales";
import { makeCustomerGateway } from "@/main/factories/make-customer-gateway";
import { makeSalesGateway } from "@/main/factories/make-sales-gateway";

export function CustomerProfile({ customerId }: { customerId: number }) {
  const customers = useMemo(() => makeCustomerGateway(), []);
  const salesGateway = useMemo(() => makeSalesGateway(), []);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cards, setCards] = useState<CustomerCard[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [tab, setTab] = useState<"ADDRESSES" | "CARDS" | "TRANSACTIONS">("ADDRESSES");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [editingCustomer, setEditingCustomer] = useState(false);

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingAddress) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      ...editingAddress,
      name: String(form.get("name")),
      street: String(form.get("street")),
      number: String(form.get("number")),
      district: String(form.get("district")),
      zipCode: String(form.get("zipCode")),
      city: String(form.get("city")),
      state: String(form.get("state")),
    };
    await customers.updateAddress(customerId, editingAddress.id, payload);
    setAddresses(await customers.listAddresses(customerId));
    setEditingAddress(null);
  }
  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer) return;
    const form = new FormData(event.currentTarget);
    const payload: CustomerPayload = {
      name: String(form.get("name")),
      gender: String(form.get("gender")),
      birthDate: String(form.get("birthDate")),
      document: String(form.get("document")),
      phoneType: customer.phone.type,
      phoneDdd: String(form.get("phoneDdd")),
      phoneNumber: String(form.get("phoneNumber")),
      email: String(form.get("email")),
    };
    setCustomer(await customers.update(customerId, payload));
    setEditingCustomer(false);
  }

  useEffect(() => {
    async function initialize() {
      try {
        const [customerItem, addressItems, cardItems, saleItems] = await Promise.all([
          customers.findById(customerId),
          customers.listAddresses(customerId),
          customers.listCards(customerId),
          salesGateway.listByCustomer(customerId),
        ]);
        setCustomer(customerItem);
        setAddresses(addressItems);
        setCards(cardItems);
        setSales(saleItems);
      } catch (cause) {
        setError(messageFrom(cause));
      } finally {
        setLoading(false);
      }
    }
    void initialize();
  }, [customerId, customers, salesGateway]);

  return (
    <div>
      <Link
        href="/admin/customers"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para clientes
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eb0907]">
            Visão completa
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold">
            {customer?.name ?? "Perfil do cliente"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {customer?.email} · {customer?.code}
          </p>
        </div>
      </header>
      {customer && (
        <section className="mt-6 grid gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-4">
          <Info label="CPF" value={customer.document} />
          <Info
            label="Nascimento"
            value={new Date(customer.birthDate).toLocaleDateString("pt-BR")}
          />
          <Info
            label="Telefone"
            value={`(${customer.phone.ddd}) ${customer.phone.number}`}
          />
          <Info label="Status" value={customer.active ? "Ativo" : "Inativo"} />
        </section>
      )}
      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ProfileArea
          icon={UserRound}
          title="Dados pessoais"
          description="Nome, contato e identificação."
          onClick={() => setEditingCustomer(true)}
        />
        <ProfileArea
          icon={MapPin}
          title="Endereços"
          description={`${addresses.length} endereços cadastrados.`}
          active={tab === "ADDRESSES"}
          onClick={() => setTab("ADDRESSES")}
        />
        <ProfileArea
          icon={CreditCard}
          title="Cartões"
          description={`${cards.length} cartões cadastrados.`}
          active={tab === "CARDS"}
          onClick={() => setTab("CARDS")}
        />
        <ProfileArea
          icon={ReceiptText}
          title="Transações"
          description={`${sales.length} pedidos encontrados.`}
          active={tab === "TRANSACTIONS"}
          onClick={() => setTab("TRANSACTIONS")}
        />
      </section>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : tab === "ADDRESSES" ? (
        <div className="mt-6 grid gap-3">
          {addresses.map((address) => (
            <article key={address.id} className="rounded border bg-white p-5">
              <div className="flex items-center justify-between">
                <strong>{address.name}</strong>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingAddress(address)}
                >
                  <Pencil />
                  Editar endereço
                </Button>
              </div>
              <p className="mt-2 text-sm">
                {address.streetType} {address.street}, {address.number} ·{" "}
                {address.district}
              </p>
              <p className="text-sm text-muted-foreground">
                {address.city}/{address.state} · {address.zipCode}
              </p>
              <p className="mt-2 text-xs">
                {address.billing && "Cobrança"}{" "}
                {address.billing && address.delivery && "·"}{" "}
                {address.delivery && "Entrega"}
              </p>
            </article>
          ))}
        </div>
      ) : tab === "CARDS" ? (
        <div className="mt-6 grid gap-3">
          {cards.map((card) => (
            <article key={card.id} className="rounded border bg-white p-5">
              <strong>
                {card.brand} ·•••• {card.lastFourDigits}
              </strong>
              <p className="mt-2 text-sm">{card.printedName}</p>
              {card.preferred && (
                <span className="mt-2 inline-block text-xs font-bold text-[#59201f]">
                  Preferencial
                </span>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {sales.map((sale) => (
            <article key={sale.id} className="rounded border bg-white p-5">
              <div className="flex justify-between">
                <strong>{sale.code}</strong>
                <span className="text-xs font-bold">{sale.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(sale.saleDate).toLocaleDateString("pt-BR")} ·{" "}
                {money(sale.total)}
              </p>
            </article>
          ))}
          {sales.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma transação encontrada.</p>
          )}
        </div>
      )}
      {editingAddress && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <form
            onSubmit={saveAddress}
            className="grid w-full max-w-xl gap-4 rounded-2xl bg-white p-6 sm:grid-cols-2"
          >
            <h2 className="text-xl font-bold sm:col-span-2">Editar endereço</h2>
            {[
              ["name", "Identificação"],
              ["street", "Logradouro"],
              ["number", "Número"],
              ["district", "Bairro"],
              ["zipCode", "CEP"],
              ["city", "Cidade"],
              ["state", "Estado"],
            ].map(([name, label]) => (
              <label key={name} className="grid gap-2 text-sm">
                <Label>{label}</Label>
                <Input
                  name={name}
                  defaultValue={String(
                    editingAddress[name as keyof CustomerAddress] ?? "",
                  )}
                  required
                />
              </label>
            ))}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingAddress(null)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar endereço</Button>
            </div>
          </form>
        </div>
      )}
      {editingCustomer && customer && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <form
            onSubmit={saveCustomer}
            className="grid w-full max-w-xl gap-4 rounded-2xl bg-white p-6 sm:grid-cols-2"
          >
            <h2 className="text-xl font-bold sm:col-span-2">Editar dados básicos</h2>
            <EditField name="name" label="Nome completo" value={customer.name} />
            <EditField name="email" label="E-mail" value={customer.email} type="email" />
            <EditField name="document" label="CPF" value={customer.document} />
            <EditField
              name="birthDate"
              label="Data de nascimento"
              value={customer.birthDate.slice(0, 10)}
              type="date"
            />
            <EditField name="phoneDdd" label="DDD" value={customer.phone.ddd} />
            <EditField
              name="phoneNumber"
              label="Telefone"
              value={customer.phone.number}
            />
            <label className="grid gap-2 text-sm">
              <Label>Gênero</Label>
              <select
                name="gender"
                defaultValue={customer.gender}
                className="h-9 rounded border px-3"
              >
                <option value="MAN">Homem</option>
                <option value="WOMAN">Mulher</option>
                <option value="NON_BINARY">Não binário</option>
                <option value="NOT_INFORMED">Prefiro não informar</option>
              </select>
            </label>
            <div className="flex items-end justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCustomer(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar dados</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ProfileArea({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-32 gap-4 rounded-2xl border bg-white/70 p-5 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md ${active ? "border-primary ring-2 ring-primary/10" : ""}`}
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl transition ${active ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"}`}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block">{title}</strong>
        <span className="mt-1 block text-sm leading-5 text-muted-foreground">
          {description}
        </span>
        <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
          Acessar área <ChevronRight className="size-3.5" />
        </span>
      </span>
    </button>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <small className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </small>
      <strong className="mt-1 block text-sm">{value}</strong>
    </div>
  );
}
function EditField({
  name,
  label,
  value,
  type = "text",
}: {
  name: string;
  label: string;
  value: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <Label>{label}</Label>
      <Input name={name} type={type} defaultValue={value} required />
    </label>
  );
}
function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
}
function messageFrom(cause: unknown) {
  return cause instanceof Error ? cause.message : "Não foi possível concluir a operação.";
}
