"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  CircleDollarSign,
  Loader2,
  PackageCheck,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { SalesSeries } from "@/domain/models/sales";
import { makeSalesGateway } from "@/main/factories/make-sales-gateway";

export function SalesAnalysis() {
  const gateway = useMemo(() => makeSalesGateway(), []);
  const [series, setSeries] = useState<SalesSeries[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<"PRODUCT" | "CATEGORY">("PRODUCT");
  const [startDate, setStartDate] = useState("2026-02-01");
  const [endDate, setEndDate] = useState("2026-08-31");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [retry, setRetry] = useState(0);
  const [chartMode, setChartMode] = useState<"TOTAL" | "COMPARE" | "SELECTED">("TOTAL");
  const [chartType, setChartType] = useState<"BAR" | "LINE">("BAR");
  const validDates = Boolean(startDate && endDate && startDate <= endDate);

  useEffect(() => {
    if (!validDates) return;
    let current = true;
    gateway
      .analyze(startDate, endDate, groupBy)
      .then((result) => {
        if (!current) return;
        setSeries(result);
        setSelectedNames(result.map((item) => item.name));
      })
      .catch(
        () =>
          current && setError("Não foi possível carregar a análise. Tente novamente."),
      )
      .finally(() => current && setLoading(false));
    return () => {
      current = false;
    };
  }, [endDate, gateway, groupBy, startDate, retry, validDates]);

  function beginUpdate() {
    setLoading(true);
    setError(null);
  }
  const filteredSeries = series.filter((item) => selectedNames.includes(item.name));
  const points = filteredSeries.flatMap((item) => item.points);
  const totalProfit = points.reduce((sum, point) => sum + (point.profit ?? 0), 0);
  const totalQuantity = points.reduce((sum, point) => sum + point.quantity, 0);
  const ranked = [...filteredSeries].sort(
    (a, b) =>
      b.points.reduce((sum, point) => sum + point.quantity, 0) -
      a.points.reduce((sum, point) => sum + point.quantity, 0),
  );
  const leader = ranked[0];
  const totals = new Map<string, { date: string; quantity: number; profit: number }>();
  for (const point of points) {
    const total = totals.get(point.date) ?? { date: point.date, quantity: 0, profit: 0 };
    total.quantity += point.quantity;
    total.profit += point.profit ?? 0;
    totals.set(point.date, total);
  }
  const chartSeries: SalesSeries[] =
    chartMode === "TOTAL"
      ? [
          {
            name: "Total da seleção",
            points: [...totals.values()].sort((a, b) => a.date.localeCompare(b.date)),
          },
        ]
      : chartMode === "COMPARE"
        ? ranked.slice(0, 5)
        : filteredSeries;
  const unavailable = loading || Boolean(error) || !validDates;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <p className="text-xs font-medium text-muted-foreground">Relatórios / Vendas</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Análise de vendas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acompanhe os resultados e compare o desempenho do seu catálogo.
        </p>
      </header>

      <section
        aria-label="Filtros da análise"
        className="rounded-2xl border border-slate-200 bg-white p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr]">
          <label className="grid gap-2 text-xs font-medium text-slate-600">
            Data inicial
            <Input
              type="date"
              value={startDate}
              max={endDate}
              className="h-10 bg-white"
              onChange={(event) => {
                beginUpdate();
                setStartDate(event.target.value);
              }}
            />
          </label>
          <label className="grid gap-2 text-xs font-medium text-slate-600">
            Data final
            <Input
              type="date"
              value={endDate}
              min={startDate}
              className="h-10 bg-white"
              onChange={(event) => {
                beginUpdate();
                setEndDate(event.target.value);
              }}
            />
          </label>
          <fieldset className="min-w-0 sm:col-span-2 xl:col-span-1">
            <legend className="mb-2 text-xs font-medium text-slate-600">
              Agrupar por
            </legend>
            <div className="flex rounded-lg bg-slate-100 p-1">
              {(["PRODUCT", "CATEGORY"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={groupBy === value}
                  onClick={() => {
                    if (value === groupBy) return;
                    beginUpdate();
                    setSearch("");
                    setGroupBy(value);
                  }}
                  className={`flex-1 rounded-md px-4 py-2 text-xs font-medium transition ${groupBy === value ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {value === "PRODUCT" ? "Produtos" : "Categorias"}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        {!validDates && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            Informe um período válido, com a data final após a inicial.
          </p>
        )}
        {series.length > 0 && !unavailable && (
          <details className="group mt-5 border-t border-slate-100 pt-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
              <SlidersHorizontal className="size-4 text-slate-500" />
              Personalizar seleção
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {selectedNames.length} de {series.length}
              </span>
              <ChevronDown className="size-4 text-slate-400 transition group-open:rotate-180" />
            </summary>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-3 size-4 text-slate-400" />
                <Input
                  aria-label="Buscar na seleção"
                  placeholder="Buscar produto ou categoria"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-10 pl-9"
                />
              </div>
              <button
                type="button"
                onClick={() => setSelectedNames(series.map((item) => item.name))}
                className="text-xs font-medium text-primary hover:underline"
              >
                Selecionar todos
              </button>
              <button
                type="button"
                onClick={() => setSelectedNames([])}
                className="text-xs text-slate-500 hover:underline"
              >
                Limpar
              </button>
            </div>
            <div className="mt-3 grid max-h-56 gap-1 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
              {series
                .filter((item) =>
                  item.name
                    .toLocaleLowerCase("pt-BR")
                    .includes(search.toLocaleLowerCase("pt-BR")),
                )
                .map((item) => (
                  <label
                    key={item.name}
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2.5 text-sm hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedNames.includes(item.name)}
                      onChange={() =>
                        setSelectedNames((current) =>
                          current.includes(item.name)
                            ? current.filter((name) => name !== item.name)
                            : [...current, item.name],
                        )
                      }
                      className="size-4 shrink-0 accent-[#59201f]"
                    />
                    <span className="truncate" title={item.name}>
                      {item.name}
                    </span>
                  </label>
                ))}
            </div>
          </details>
        )}
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              beginUpdate();
              setRetry((value) => value + 1);
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}
      <section aria-label="Indicadores da seleção" className="grid gap-4 md:grid-cols-3">
        <Metric
          icon={CircleDollarSign}
          label="Lucro no período"
          value={unavailable ? "—" : money(totalProfit)}
          detail="Acumulado da seleção"
        />
        <Metric
          icon={PackageCheck}
          label="Unidades vendidas"
          value={unavailable ? "—" : totalQuantity.toLocaleString("pt-BR")}
          detail="Volume no período selecionado"
        />
        <Metric
          icon={TrendingUp}
          label="Maior desempenho"
          value={unavailable ? "—" : (leader?.name ?? "Sem dados")}
          detail="Maior volume de unidades vendidas"
          compact
        />
      </section>

      <section aria-label="Evolução das vendas" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Evolução no período</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {chartMode === "TOTAL"
                ? `${chartType === "BAR" ? "Totais mensais" : "Evolução diária"} dos itens selecionados.`
                : chartMode === "COMPARE"
                  ? `${chartType === "BAR" ? "Totais mensais" : "Evolução diária"} dos 5 itens selecionados com maior volume de vendas.`
                  : `Comparando ${filteredSeries.length} itens. Use Personalizar seleção para escolher quantos desejar.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div
              role="group"
              aria-label="Tipo de gráfico"
              className="flex rounded-lg border border-slate-200 bg-white p-1"
            >
              {(["BAR", "LINE"] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  aria-pressed={chartType === type}
                  onClick={() => setChartType(type)}
                  className={`rounded-md px-3 py-2 text-xs font-medium ${chartType === type ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
                >
                  {type === "BAR" ? "Barras mensais" : "Linhas diárias"}
                </button>
              ))}
            </div>
            <div
              role="group"
              aria-label="Modo de comparação"
              className="flex flex-wrap rounded-lg border border-slate-200 bg-white p-1"
            >
              {(["TOTAL", "COMPARE", "SELECTED"] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  aria-pressed={chartMode === mode}
                  onClick={() => setChartMode(mode)}
                  className={`rounded-md px-3 py-2 text-xs font-medium ${chartMode === mode ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
                >
                  {mode === "TOTAL"
                    ? "Visão geral"
                    : mode === "COMPARE"
                      ? "Comparar top 5"
                      : "Comparar seleção"}
                </button>
              ))}
            </div>
          </div>
        </div>
        {loading && validDates ? (
          <div
            role="status"
            className="flex min-h-72 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm text-muted-foreground"
          >
            <Loader2 className="size-4 animate-spin" />
            Carregando análise…
          </div>
        ) : !unavailable && (series.length === 0 || points.length === 0) ? (
          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-muted-foreground">
            {series.length === 0
              ? "Nenhuma venda encontrada. Experimente outro período."
              : "Selecione pelo menos um item para visualizar os resultados."}
          </div>
        ) : (
          !unavailable && (
            <div className="grid gap-4 xl:grid-cols-2">
              <SalesChart
                title="Unidades vendidas"
                ariaLabel="Evolução das unidades vendidas"
                series={chartSeries}
                chartType={chartType}
                value={(point) => point.quantity}
                formatValue={(value) => Math.round(value).toLocaleString("pt-BR")}
              />
              <SalesChart
                title="Lucro"
                ariaLabel="Evolução do lucro"
                series={chartSeries}
                chartType={chartType}
                value={(point) => point.profit ?? 0}
                formatValue={compactMoney}
              />
            </div>
          )
        )}
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
  compact = false,
}: {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
  detail: string;
  compact?: boolean;
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium text-slate-500">{label}</h2>
        <Icon className="size-4 text-slate-400" />
      </div>
      <p
        className={`mt-4 truncate font-semibold tracking-tight text-slate-900 ${compact ? "text-xl" : "text-3xl tabular-nums"}`}
        title={value}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </article>
  );
}

function SalesChart({
  title,
  ariaLabel,
  series,
  value,
  formatValue,
  chartType,
}: {
  chartType: "BAR" | "LINE";
  title: string;
  ariaLabel: string;
  series: SalesSeries[];
  value: (point: SalesSeries["points"][number]) => number;
  formatValue: (value: number) => string;
}) {
  const periodKey = (date: string) => (chartType === "BAR" ? date.slice(0, 7) : date);
  const months = [
    ...new Set(
      series.flatMap((item) => item.points.map((point) => periodKey(point.date))),
    ),
  ].sort();
  const grouped = series.map((item) => {
    const totals = new Map<string, number>();
    for (const point of item.points) {
      const month = periodKey(point.date);
      totals.set(month, (totals.get(month) ?? 0) + value(point));
    }
    return { name: item.name, totals };
  });
  const values = grouped.flatMap((item) => [...item.totals.values()]);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(1, ...values) * 1.15;
  const chartWidth =
    chartType === "BAR" ? Math.max(736, months.length * series.length * 12 + 92) : 736;
  const left = 66,
    right = chartWidth - 26,
    top = 24,
    bottom = 258;
  const y = (amount: number) =>
    bottom - ((amount - minimum) / (maximum - minimum)) * (bottom - top);
  const slot = (right - left) / Math.max(1, months.length);
  const barWidth = Math.min(48, (slot * 0.66) / Math.max(1, series.length));
  const formatMonth = (month: string) =>
    new Date(`${month}${chartType === "BAR" ? "-01" : ""}T12:00:00`).toLocaleDateString(
      "pt-BR",
      {
        month: "short",
        ...(chartType === "BAR"
          ? { year: "2-digit" as const }
          : { day: "2-digit" as const }),
      },
    );
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 motion-safe:animate-none">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-slate-400">
          {chartType === "BAR" ? "Total mensal" : "Evolução diária"}
        </span>
      </div>
      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} 304`}
          style={chartWidth > 736 ? { minWidth: chartWidth, height: 304 } : undefined}
          className="w-full min-w-[420px]"
          role="img"
          aria-label={`${ariaLabel}, ${chartType === "BAR" ? "barras mensais" : "linhas diárias"}`}
        >
          <title>
            {title} {chartType === "BAR" ? "por mês" : "por dia"}
          </title>
          {[0, 0.5, 1].map((ratio) => {
            const amount = minimum + (maximum - minimum) * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={left}
                  x2={right}
                  y1={y(amount)}
                  y2={y(amount)}
                  stroke="#edf0f3"
                  strokeDasharray="3 5"
                />
                <text
                  x={left - 12}
                  y={y(amount) + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="11"
                >
                  {formatValue(amount)}
                </text>
              </g>
            );
          })}
          <line x1={left} x2={right} y1={y(0)} y2={y(0)} stroke="#e2e8f0" />
          {chartType === "LINE" &&
            grouped.map((item) => (
              <polyline
                key={item.name}
                points={months
                  .map(
                    (date, i) =>
                      `${left + slot * (i + 0.5)},${y(item.totals.get(date) ?? 0)}`,
                  )
                  .join(" ")}
                fill="none"
                stroke={seriesColor(item.name)}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
          {months.map((month, monthIndex) => {
            const center = left + slot * (monthIndex + 0.5);
            return (
              <g key={month}>
                {(chartType === "BAR" ||
                  monthIndex % Math.max(1, Math.ceil(months.length / 6)) === 0) && (
                  <text
                    x={center}
                    y={bottom + 30}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="11"
                  >
                    {formatMonth(month)}
                  </text>
                )}
                {grouped.map((item, index) => {
                  const amount = item.totals.get(month) ?? 0;
                  const barX =
                    center - (grouped.length * barWidth) / 2 + index * barWidth;
                  return (
                    <g key={item.name}>
                      {chartType === "LINE" ? (
                        <circle
                          cx={center}
                          cy={y(amount)}
                          r={months.length === 1 ? 4 : 3}
                          fill={seriesColor(item.name)}
                          className={
                            months.length > 1 ? "opacity-0 hover:opacity-100" : undefined
                          }
                        >
                          <title>{`${item.name} · ${formatMonth(month)}: ${formatValue(amount)}`}</title>
                        </circle>
                      ) : (
                        <rect
                          x={barX + 2}
                          y={Math.min(y(amount), y(0))}
                          width={Math.max(1, barWidth - 4)}
                          height={Math.abs(y(amount) - y(0))}
                          rx="3"
                          fill={seriesColor(item.name)}
                          className="transition-opacity hover:opacity-75"
                        >
                          <title>{`${item.name} · ${formatMonth(month)}: ${formatValue(amount)}`}</title>
                        </rect>
                      )}
                      {chartType === "BAR" &&
                        grouped.length === 1 &&
                        months.length <= 8 && (
                          <text
                            x={center}
                            y={amount >= 0 ? y(amount) - 9 : y(amount) + 16}
                            textAnchor="middle"
                            fill="#475569"
                            fontSize="11"
                            fontWeight="500"
                          >
                            {formatValue(amount)}
                          </text>
                        )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      {series.length > 1 && (
        <div className="mt-4 flex max-h-40 flex-wrap gap-x-4 gap-y-2 overflow-y-auto border-t border-slate-100 pt-4">
          {series.map((item) => (
            <div
              key={item.name}
              className="flex min-w-0 items-center gap-2 text-xs text-slate-500"
            >
              <span
                className="size-2 shrink-0 rounded-sm"
                style={{ backgroundColor: seriesColor(item.name) }}
              />
              <span className="max-w-48 truncate" title={item.name}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
function seriesColor(name: string) {
  let hash = 0;
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return `hsl(${hash % 360} ${45 + (hash % 20)}% ${35 + (hash % 12)}%)`;
}
function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function compactMoney(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}
