"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2, PackageCheck, Repeat2 } from "lucide-react";

import type { Exchange, Sale } from "@/domain/models/sales";
import { makeSalesGateway } from "@/main/factories/make-sales-gateway";

export function SalesModuleDashboard() {
  const gateway = useMemo(() => makeSalesGateway(), []);
  const [sales, setSales] = useState<Sale[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);

  useEffect(() => {
    Promise.all([gateway.list(), gateway.exchanges()]).then(
      ([saleItems, exchangeItems]) => {
        setSales(saleItems);
        setExchanges(exchangeItems);
      },
    );
  }, [gateway]);

  const openSales = sales.filter((sale) => normalize(sale.status) !== "ENTREGUE").length;
  const openExchanges = exchanges.filter(
    (exchange) =>
      !["TROCA PROCESSADA", "TROCADO", "TROCA NEGADA"].includes(
        normalize(exchange.status),
      ),
  ).length;

  return (
    <div>
      <header className="border-b pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eb0907]">
          Operação comercial
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.045em]">
          Vendas e trocas
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Escolha uma área para acompanhar cada etapa da operação comercial.
        </p>
      </header>

      <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ModuleLink
          href="/admin/sales/orders"
          icon={PackageCheck}
          title="Pedidos e vendas"
          metric={sales.length ? `${openSales} em andamento` : undefined}
        >
          Consulte vendas, pagamentos, expedição e entrega dos pedidos.
        </ModuleLink>
        <ModuleLink
          href="/admin/sales/exchanges"
          icon={Repeat2}
          title="Trocas"
          metric={exchanges.length ? `${openExchanges} aguardando ação` : undefined}
        >
          Autorize solicitações e acompanhe o recebimento dos itens.
        </ModuleLink>
      </section>
    </div>
  );
}

function ModuleLink({
  href,
  icon: Icon,
  title,
  metric,
  children,
}: {
  href: string;
  icon: typeof PackageCheck;
  title: string;
  metric?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="liquid-glass group flex min-h-56 flex-col rounded-3xl p-6 transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-2xl"
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
        <Icon className="size-5" />
      </span>
      <strong className="mt-5 text-xl">{title}</strong>
      <span className="mt-2 text-sm leading-6 text-muted-foreground">{children}</span>
      <span className="mt-auto flex items-end justify-between gap-3 pt-6">
        <span className="text-xs font-semibold text-primary">
          {metric ?? <Loader2 className="size-3.5 animate-spin" />}
        </span>
        <ArrowRight className="size-5 text-primary transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function normalize(value: string) {
  return value.trim().toLocaleUpperCase("pt-BR").replaceAll("_", " ");
}
