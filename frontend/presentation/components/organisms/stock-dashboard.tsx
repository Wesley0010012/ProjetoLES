"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StockBook, StockItem, StockSupplier } from "@/domain/models/stock";
import { makeStockGateway } from "@/main/factories/make-stock-gateway";

type Operation = "ENTRY" | "WITHDRAWAL" | "REENTRY";

export function StockDashboard() {
  const gateway = useMemo(() => makeStockGateway(), []);
  const [items, setItems] = useState<StockItem[]>([]);
  const [books, setBooks] = useState<StockBook[]>([]);
  const [suppliers, setSuppliers] = useState<StockSupplier[]>([]);
  const [operation, setOperation] = useState<Operation>("ENTRY");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [stock, bookOptions, supplierOptions] = await Promise.all([
      gateway.list(),
      gateway.listBooks(),
      gateway.listSuppliers(),
    ]);
    setItems(stock);
    setBooks(bookOptions);
    setSuppliers(supplierOptions);
  }

  useEffect(() => {
    async function initialize() {
      try {
        const [stock, bookOptions, supplierOptions] = await Promise.all([
          gateway.list(),
          gateway.listBooks(),
          gateway.listSuppliers(),
        ]);
        setItems(stock);
        setBooks(bookOptions);
        setSuppliers(supplierOptions);
      } catch (cause) {
        setError(messageFrom(cause));
      } finally {
        setIsLoading(false);
      }
    }
    void initialize();
  }, [gateway]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setIsSaving(true);
    setError(null);
    const form = new FormData(formElement);
    const common = {
      bookId: Number(form.get("bookId")),
      quantity: Number(form.get("quantity")),
    };

    try {
      if (operation === "ENTRY") {
        await gateway.enter({
          ...common,
          unitCost: Number(form.get("unitCost")),
          supplierId: Number(form.get("supplierId")),
          entryDate: String(form.get("date")),
        });
      } else {
        const payload = {
          ...common,
          occurredAt: String(form.get("date")),
        };
        if (operation === "WITHDRAWAL") {
          await gateway.withdraw(payload);
        } else {
          await gateway.reenter(payload);
        }
      }
      await load();
      formElement.reset();
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setIsSaving(false);
    }
  }

  async function addSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await gateway.addSupplier(
        String(form.get("supplierName") ?? ""),
        String(form.get("supplierDocument") ?? ""),
      );
      await load();
      formElement.reset();
    } catch (cause) {
      setError(messageFrom(cause));
    }
  }

  return (
    <div>
      <header className="border-b pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eb0907]">
          Operação física
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.045em]">
          Estoque
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Controle entradas, baixas e reentradas. O preço de venda usa o maior custo
          registrado e a margem do grupo de precificação do livro.
        </p>
      </header>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded border bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <Boxes className="size-4 text-[#eb0907]" />
            <h2 className="text-sm font-bold">Posição atual</h2>
          </div>
          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b bg-muted/60 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Livro</th>
                    <th className="px-5 py-3">Disponível</th>
                    <th className="px-5 py-3">Maior custo</th>
                    <th className="px-5 py-3">Margem</th>
                    <th className="px-5 py-3">Venda</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.bookId}>
                      <td className="px-5 py-4">
                        <strong className="block">{item.title}</strong>
                        <span className="text-xs text-muted-foreground">{item.code}</span>
                      </td>
                      <td className="px-5 py-4 font-bold">{item.availableQuantity}</td>
                      <td className="px-5 py-4">{money(item.costBasis)}</td>
                      <td className="px-5 py-4">{item.profitMarginPercentage}%</td>
                      <td className="px-5 py-4 font-bold text-[#59201f]">
                        {money(item.salePrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form
          onSubmit={submit}
          className="liquid-glass h-fit rounded-3xl p-5 shadow-xl shadow-black/5 sm:p-6"
        >
          <h2 className="font-heading text-xl font-semibold">Movimentar</h2>
          <div className="mt-5 grid grid-cols-3 gap-1 rounded bg-muted p-1">
            <OperationButton
              active={operation === "ENTRY"}
              onClick={() => setOperation("ENTRY")}
              icon={ArrowDownToLine}
            >
              Entrada
            </OperationButton>
            <OperationButton
              active={operation === "WITHDRAWAL"}
              onClick={() => setOperation("WITHDRAWAL")}
              icon={ArrowUpFromLine}
            >
              Baixa
            </OperationButton>
            <OperationButton
              active={operation === "REENTRY"}
              onClick={() => setOperation("REENTRY")}
              icon={RotateCcw}
            >
              Retorno
            </OperationButton>
          </div>

          <div className="mt-5 grid gap-4">
            <Field label="Livro">
              <select
                name="bookId"
                required
                className="h-9 rounded border bg-white px-3 text-sm"
              >
                <option value="">Selecione</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.code} · {book.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Quantidade">
              <Input name="quantity" type="number" min="1" step="1" required />
            </Field>
            {operation === "ENTRY" && (
              <>
                <Field label="Custo unitário">
                  <Input name="unitCost" type="number" min="0.01" step="0.01" required />
                </Field>
                <Field label="Fornecedor">
                  <select
                    name="supplierId"
                    required
                    className="h-9 rounded border bg-white px-3 text-sm"
                  >
                    <option value="">Selecione</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            )}
            <Field label="Data da movimentação">
              <Input name="date" type="date" defaultValue={today()} required />
            </Field>
          </div>
          <Button type="submit" className="mt-5 h-10 w-full" disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin" />}
            Confirmar movimentação
          </Button>
        </form>
      </section>
      <section className="mt-7 rounded border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold">Fornecedores</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-2">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="flex items-center justify-between rounded border p-3 text-sm"
              >
                <span>
                  <strong>{supplier.name}</strong>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {supplier.document}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    gateway
                      .deleteSupplier(supplier.id)
                      .then(load)
                      .catch((cause) => setError(messageFrom(cause)))
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
          <form onSubmit={addSupplier} className="grid gap-3">
            <Field label="Nome">
              <Input name="supplierName" required />
            </Field>
            <Field label="CNPJ">
              <Input name="supplierDocument" minLength={14} required />
            </Field>
            <Button type="submit">
              <Plus />
              Adicionar fornecedor
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function OperationButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Boxes;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1 rounded px-2 py-2 text-xs font-semibold ${active ? "bg-[#0f0000] text-white" : "text-muted-foreground hover:text-foreground"}`}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  );
}

function money(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function messageFrom(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Não foi possível concluir a operação.";
}
