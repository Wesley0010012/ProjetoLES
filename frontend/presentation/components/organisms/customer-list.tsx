"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Search, Trash2, UserRound } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Customer } from "@/domain/models/customer";
import { makeCustomerGateway } from "@/main/factories/make-customer-gateway";

export function CustomerList() {
  const gateway = useMemo(() => makeCustomerGateway(), []);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setCustomers(await gateway.list());
      } catch (cause) {
        setError(messageFrom(cause));
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [gateway]);

  async function exclude(customer: Customer) {
    if (!window.confirm(`Deseja excluir o cliente “${customer.name}”?`)) return;
    setError(null);
    try {
      await gateway.delete(customer.id);
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
    } catch (cause) {
      setError(messageFrom(cause));
    }
  }

  const normalizedQuery = query.toLocaleLowerCase("pt-BR");
  const filtered = customers.filter((customer) =>
    [customer.name, customer.email, customer.code, customer.document].some((value) =>
      value.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
    ),
  );

  return (
    <div>
      <header className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eb0907]">
            Cadastros
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.045em]">
            Clientes
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastros pessoais e respectivos acessos de usuário.
          </p>
        </div>
      </header>

      <div className="relative mt-7 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="bg-white pl-9"
          placeholder="Buscar por nome, e-mail, CPF ou código..."
        />
      </div>

      {error && (
        <Alert variant="destructive" className="mt-5">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Carregando clientes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <UserRound className="size-7 text-primary" />
            <h2 className="mt-3 font-heading text-xl font-semibold">
              Nenhum cliente encontrado
            </h2>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="border-b bg-[#faf8f3] text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Contato</th>
                  <th className="px-5 py-4">CPF</th>
                  <th className="px-5 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <span className="font-medium">{customer.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {customer.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {customer.email}
                      <span className="block text-xs text-muted-foreground">
                        ({customer.phone.ddd}) {customer.phone.number}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {customer.document}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/customers/${customer.id}/profile`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          <UserRound />
                          Perfil
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => void exclude(customer)}
                        >
                          <Trash2 />
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function messageFrom(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Não foi possível concluir a operação.";
}
