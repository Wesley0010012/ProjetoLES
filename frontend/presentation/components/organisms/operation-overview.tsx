"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  LoaderCircle,
  RefreshCw,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import type { Book } from "@/domain/models/catalog";
import type { Customer } from "@/domain/models/customer";
import type { Exchange, Sale } from "@/domain/models/sales";
import type { StockItem } from "@/domain/models/stock";
import { makeCatalogGateway } from "@/main/factories/make-catalog-gateway";
import { makeCustomerGateway } from "@/main/factories/make-customer-gateway";
import { makeSalesGateway } from "@/main/factories/make-sales-gateway";
import { makeStockGateway } from "@/main/factories/make-stock-gateway";

type DashboardData = {
  sales: Sale[];
  exchanges: Exchange[];
  stock: StockItem[];
  customers: Customer[];
  books: Book[];
};

const emptyData: DashboardData = {
  sales: [],
  exchanges: [],
  stock: [],
  customers: [],
  books: [],
};

export function OperationOverview() {
  const gateways = useMemo(
    () => ({
      sales: makeSalesGateway(),
      stock: makeStockGateway(),
      customers: makeCustomerGateway(),
      catalog: makeCatalogGateway(),
    }),
    [],
  );
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [sales, exchanges, stock, customers, books] = await Promise.all([
          gateways.sales.list(),
          gateways.sales.exchanges(),
          gateways.stock.list(),
          gateways.customers.list(),
          gateways.catalog.list("books"),
        ]);
        setData({ sales, exchanges, stock, customers, books: books as Book[] });
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível carregar a visão geral.",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [gateways, reload]);

  const validSales = data.sales.filter(
    (sale) => !["REJECTED", "REJEITADA", "CANCELLED", "CANCELADA"].includes(sale.status),
  );
  const revenue = validSales.reduce((total, sale) => total + sale.total, 0);
  const averageTicket = validSales.length > 0 ? revenue / validSales.length : 0;
  const totalUnits = validSales
    .flatMap((sale) => sale.items)
    .reduce((total, item) => total + item.quantity, 0);
  const lowStock = [...data.stock]
    .filter((item) => item.availableQuantity <= 5)
    .sort((first, second) => first.availableQuantity - second.availableQuantity);
  const blockedUnits = data.stock.reduce(
    (total, item) => total + (item.blockedQuantity ?? 0),
    0,
  );
  const monthly = monthlyRevenue(validSales);
  const status = statusDistribution(data.sales);
  const topBooks = bestSellers(validSales);
  const maximumMonthlyRevenue = Math.max(1, ...monthly.map((item) => item.revenue));
  const maximumStatus = Math.max(1, ...status.map((item) => item.quantity));
  const maximumBookQuantity = Math.max(1, ...topBooks.map((item) => item.quantity));

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eb0907]">
            Central de controle
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.045em] text-[#0f0000]">
            Visão geral
          </h1>
          <p className="mt-2 text-sm text-black/55">
            Indicadores consolidados de vendas, clientes, catálogo e estoque.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReload((value) => value + 1)}
          disabled={loading}
          className="flex h-9 items-center gap-2 rounded border border-black/15 bg-white px-3 text-sm font-medium shadow-sm hover:border-[#d47b2e] disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </header>

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="size-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid min-h-96 place-items-center text-sm text-black/50">
          <span className="flex items-center gap-2">
            <LoaderCircle className="size-5 animate-spin text-[#eb0907]" />
            Consolidando os dados operacionais...
          </span>
        </div>
      ) : (
        <>
          <section
            className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Indicadores gerais"
          >
            <MetricCard
              label="Faturamento registrado"
              value={money(revenue)}
              detail={`${validSales.length} pedidos considerados`}
              icon={<CircleDollarSign />}
              accent="#eb0907"
            />
            <MetricCard
              label="Ticket médio"
              value={money(averageTicket)}
              detail={`${totalUnits} unidades vendidas`}
              icon={<TrendingUp />}
              accent="#8f2d2c"
            />
            <MetricCard
              label="Clientes ativos"
              value={String(data.customers.length)}
              detail={`${data.books.length} livros no catálogo`}
              icon={<UsersRound />}
              accent="#59201f"
            />
            <MetricCard
              label="Estoque disponível"
              value={String(
                data.stock.reduce((total, item) => total + item.availableQuantity, 0),
              )}
              detail={`${blockedUnits} unidades reservadas`}
              icon={<Boxes />}
              accent="#d47b2e"
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            <DashboardPanel
              title="Evolução do faturamento"
              description="Valor mensal dos pedidos não rejeitados."
            >
              {monthly.length === 0 ? (
                <EmptyState text="Ainda não há vendas para compor o gráfico." />
              ) : (
                <div className="mt-7 flex h-64 items-end gap-2 border-b border-l border-black/15 px-3 pt-4">
                  {monthly.map((item) => (
                    <div
                      key={item.key}
                      className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                    >
                      <span className="mb-2 hidden text-[10px] font-semibold text-[#59201f] sm:block">
                        {compactMoney(item.revenue)}
                      </span>
                      <div
                        className="w-full max-w-16 rounded-t bg-gradient-to-t from-[#59201f] to-[#eb0907] transition group-hover:brightness-110"
                        style={{
                          height: `${Math.max(3, (item.revenue / maximumMonthlyRevenue) * 86)}%`,
                        }}
                        title={`${item.label}: ${money(item.revenue)}`}
                      />
                      <span className="mt-2 w-full truncate text-center text-[10px] text-black/50">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </DashboardPanel>

            <DashboardPanel
              title="Situação dos pedidos"
              description="Distribuição atual por etapa de atendimento."
            >
              {status.length === 0 ? (
                <EmptyState text="Nenhum pedido registrado." />
              ) : (
                <div className="mt-6 space-y-4">
                  {status.map((item, index) => (
                    <div key={item.name}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="font-medium">{readableStatus(item.name)}</span>
                        <strong>{item.quantity}</strong>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-black/5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(item.quantity / maximumStatus) * 100}%`,
                            background: chartColors[index % chartColors.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardPanel>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <DashboardPanel
              title="Livros mais vendidos"
              description="Ranking por quantidade de unidades."
            >
              {topBooks.length === 0 ? (
                <EmptyState text="Sem itens vendidos no período disponível." />
              ) : (
                <div className="mt-5 space-y-4">
                  {topBooks.map((item, index) => (
                    <div
                      key={item.bookId}
                      className="grid grid-cols-[24px_1fr_auto] items-center gap-3"
                    >
                      <span className="text-center text-xs font-bold text-[#eb0907]">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex justify-between gap-3 text-xs">
                          <span className="truncate font-medium">{item.title}</span>
                          <span>{item.quantity} un.</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/5">
                          <div
                            className="h-full bg-[#8f2d2c]"
                            style={{
                              width: `${(item.quantity / maximumBookQuantity) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#59201f]">
                        {money(item.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <PanelLink href="/admin/analysis" text="Abrir análise detalhada" />
            </DashboardPanel>

            <DashboardPanel
              title="Atenção operacional"
              description="Itens que exigem acompanhamento da equipe."
            >
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Attention
                  label="Estoque crítico"
                  value={lowStock.length}
                  tone={lowStock.length > 0 ? "danger" : "normal"}
                />
                <Attention
                  label="Trocas abertas"
                  value={
                    data.exchanges.filter(
                      (item) =>
                        !["EXCHANGED", "TROCADO", "REJECTED", "REJEITADA"].includes(
                          item.status,
                        ),
                    ).length
                  }
                  tone="warning"
                />
                <Attention label="Reservas" value={blockedUnits} tone="normal" />
              </div>
              <div className="mt-5 divide-y border-y border-black/10">
                {lowStock.length === 0 ? (
                  <p className="py-5 text-sm text-black/50">
                    Nenhum livro abaixo do nível de atenção.
                  </p>
                ) : (
                  lowStock.slice(0, 4).map((item) => (
                    <div
                      key={item.bookId}
                      className="flex items-center justify-between gap-3 py-3 text-sm"
                    >
                      <span className="min-w-0 truncate">{item.title}</span>
                      <strong className="shrink-0 text-[#eb0907]">
                        {item.availableQuantity} disponíveis
                      </strong>
                    </div>
                  ))
                )}
              </div>
              <PanelLink href="/admin/stock" text="Gerenciar estoque" />
            </DashboardPanel>
          </section>

          <section className="mt-6">
            <DashboardPanel
              title="Pedidos recentes"
              description="Últimas movimentações comerciais registradas."
            >
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-y bg-[#f4f3f1] text-xs uppercase tracking-wide text-black/50">
                    <tr>
                      <th className="px-3 py-3">Pedido</th>
                      <th className="px-3 py-3">Cliente</th>
                      <th className="px-3 py-3">Data</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[...data.sales]
                      .sort(
                        (first, second) =>
                          new Date(second.saleDate).getTime() -
                          new Date(first.saleDate).getTime(),
                      )
                      .slice(0, 6)
                      .map((sale) => (
                        <tr key={sale.id} className="hover:bg-[#59201f]/5">
                          <td className="px-3 py-3 font-semibold">{sale.code}</td>
                          <td className="px-3 py-3">{sale.customer.name}</td>
                          <td className="px-3 py-3 text-black/55">
                            {date(sale.saleDate)}
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={sale.status} />
                          </td>
                          <td className="px-3 py-3 text-right font-semibold">
                            {money(sale.total)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {data.sales.length === 0 && (
                  <EmptyState text="Nenhum pedido registrado." />
                )}
              </div>
              <PanelLink href="/admin/sales" text="Ver todos os pedidos" />
            </DashboardPanel>
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <article className="relative overflow-hidden rounded border border-black/10 bg-white p-5 shadow-sm">
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-black/50">{label}</p>
          <strong className="mt-2 block text-2xl tracking-tight text-[#0f0000]">
            {value}
          </strong>
          <p className="mt-2 text-xs text-black/45">{detail}</p>
        </div>
        <span
          className="grid size-10 place-items-center rounded-lg text-white [&>svg]:size-5"
          style={{ background: accent }}
        >
          {icon}
        </span>
      </div>
    </article>
  );
}

function DashboardPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-[#0f0000]">{title}</h2>
      <p className="mt-1 text-xs text-black/50">{description}</p>
      {children}
    </article>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid min-h-40 place-items-center text-sm text-black/45">{text}</div>
  );
}

function PanelLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      className="mt-5 flex items-center justify-end gap-1 border-t border-black/10 pt-4 text-xs font-semibold text-[#59201f] hover:text-[#eb0907]"
    >
      {text}
      <ArrowRight className="size-3.5" />
    </Link>
  );
}

function Attention({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "danger" | "warning" | "normal";
}) {
  const color =
    tone === "danger"
      ? "text-[#eb0907]"
      : tone === "warning"
        ? "text-[#d47b2e]"
        : "text-[#38322b]";
  return (
    <div className="rounded bg-[#f4f3f1] p-3">
      <strong className={`block text-2xl ${color}`}>{value}</strong>
      <span className="text-[11px] text-black/50">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#38322b]/10 px-2.5 py-1 text-[10px] font-semibold text-[#38322b]">
      {readableStatus(status)}
    </span>
  );
}

function monthlyRevenue(sales: Sale[]) {
  const values = new Map<string, number>();
  sales.forEach((sale) => {
    const saleDate = new Date(sale.saleDate);
    const key = `${saleDate.getUTCFullYear()}-${String(saleDate.getUTCMonth() + 1).padStart(2, "0")}`;
    values.set(key, (values.get(key) ?? 0) + sale.total);
  });
  return [...values.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .slice(-8)
    .map(([key, revenue]) => {
      const [year, month] = key.split("-").map(Number);
      return {
        key,
        revenue,
        label: new Intl.DateTimeFormat("pt-BR", {
          month: "short",
          year: "2-digit",
          timeZone: "UTC",
        }).format(new Date(Date.UTC(year, month - 1, 1))),
      };
    });
}

function statusDistribution(sales: Sale[]) {
  const values = new Map<string, number>();
  sales.forEach((sale) => values.set(sale.status, (values.get(sale.status) ?? 0) + 1));
  return [...values.entries()]
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((first, second) => second.quantity - first.quantity);
}

function bestSellers(sales: Sale[]) {
  const values = new Map<
    number,
    { bookId: number; title: string; quantity: number; revenue: number }
  >();
  sales
    .flatMap((sale) => sale.items)
    .forEach((item) => {
      const current = values.get(item.bookId) ?? {
        bookId: item.bookId,
        title: item.title,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += item.quantity;
      current.revenue += item.total;
      values.set(item.bookId, current);
    });
  return [...values.values()]
    .sort((first, second) => second.quantity - first.quantity)
    .slice(0, 5);
}

function readableStatus(status: string) {
  const labels: Record<string, string> = {
    APPROVED: "Aprovada",
    APROVADA: "Aprovada",
    IN_TRANSIT: "Em transporte",
    EM_TRANSPORTE: "Em transporte",
    DELIVERED: "Entregue",
    ENTREGUE: "Entregue",
    REJECTED: "Rejeitada",
    REJEITADA: "Rejeitada",
    EXCHANGE_REQUESTED: "Em troca",
    EM_TROCA: "Em troca",
  };
  return (
    labels[status] ??
    status
      .replaceAll("_", " ")
      .toLocaleLowerCase("pt-BR")
      .replace(/^./, (letter) => letter.toLocaleUpperCase("pt-BR"))
  );
}

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function compactMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function date(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" }).format(
    new Date(value),
  );
}

const chartColors = ["#eb0907", "#8f2d2c", "#59201f", "#d47b2e", "#38322b"];
