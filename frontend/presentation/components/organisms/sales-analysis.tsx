"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Loader2, PackageCheck, TrendingUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  useEffect(() => {
    let current = true;
    gateway
      .analyze(startDate, endDate, groupBy)
      .then((result) => {
        if (!current) return;
        setSeries(result);
        setSelectedNames(result.map((item) => item.name));
      })
      .catch(() => current && setError("Não foi possível carregar a análise."))
      .finally(() => current && setLoading(false));
    return () => {
      current = false;
    };
  }, [endDate, gateway, groupBy, startDate]);

  const filteredSeries = series.filter((item) => selectedNames.includes(item.name));
  const totalProfit = filteredSeries
    .flatMap((item) => item.points)
    .reduce((sum, point) => sum + (point.profit ?? 0), 0);
  const totalQuantity = filteredSeries
    .flatMap((item) => item.points)
    .reduce((sum, point) => sum + point.quantity, 0);
  const leader = [...filteredSeries].sort(
    (a, b) =>
      b.points.reduce((sum, point) => sum + point.quantity, 0) -
      a.points.reduce((sum, point) => sum + point.quantity, 0),
  )[0];

  function toggleSeries(name: string) {
    setSelectedNames((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  }

  return (
    <div>
      <header className="border-b pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eb0907]">
          Inteligência comercial
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.045em]">
          Análise de vendas
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Compare o histórico por produto ou categoria dentro de um período.
        </p>
      </header>
      <section
        aria-label="Filtros da análise"
        className="liquid-glass mt-6 grid gap-4 rounded-3xl p-5 shadow-xl shadow-black/5 sm:grid-cols-3 sm:items-end sm:p-6"
      >
        <Field label="Data inicial">
          <Input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => {
              setLoading(true);
              setError(null);
              setStartDate(event.target.value);
            }}
          />
        </Field>
        <Field label="Data final">
          <Input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(event) => {
              setLoading(true);
              setError(null);
              setEndDate(event.target.value);
            }}
          />
        </Field>
        <Field label="Comparar por">
          <select
            value={groupBy}
            onChange={(event) => {
              setLoading(true);
              setError(null);
              setGroupBy(event.target.value as "PRODUCT" | "CATEGORY");
            }}
            className="h-9 rounded border bg-white px-3 text-sm"
          >
            <option value="PRODUCT">Produto</option>
            <option value="CATEGORY">Categoria</option>
          </select>
        </Field>
        <p className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-3">
          {loading && <Loader2 className="size-3.5 animate-spin" />}
          {loading
            ? "Atualizando indicadores..."
            : "Indicadores atualizados automaticamente."}
        </p>
      </section>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {series.length > 0 && (
        <section className="mt-6 rounded border bg-white p-5 shadow-sm">
          <div>
            <div>
              <h2 className="font-bold">
                Filtrar {groupBy === "PRODUCT" ? "produtos" : "categorias"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Selecione um ou mais itens para comparar nos indicadores e gráficos.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {series.map((item) => {
              const selected = selectedNames.includes(item.name);
              return (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleSeries(item.name)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${selected ? "border-[#59201f] bg-[#59201f] text-white" : "border-border bg-white text-muted-foreground hover:border-[#59201f]/50"}`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 text-xs font-semibold">
            <button
              type="button"
              className="text-[#59201f] hover:underline"
              onClick={() => setSelectedNames(series.map((item) => item.name))}
            >
              Selecionar todos
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:underline"
              onClick={() => setSelectedNames([])}
            >
              Limpar seleção
            </button>
          </div>
        </section>
      )}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric
          icon={CircleDollarSign}
          label="Lucro no período"
          value={money(totalProfit)}
        />
        <Metric
          icon={PackageCheck}
          label="Unidades vendidas"
          value={String(totalQuantity)}
        />
        <Metric
          icon={TrendingUp}
          label="Maior desempenho"
          value={leader?.name ?? "Sem dados"}
        />
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        {series.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
            Carregando dados da análise...
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="col-span-full flex min-h-64 items-center justify-center rounded border bg-white text-sm text-muted-foreground">
            Selecione pelo menos um {groupBy === "PRODUCT" ? "produto" : "categoria"} para
            exibir os gráficos.
          </div>
        ) : (
          <>
            <LineChart
              title="Quantidades vendidas"
              ariaLabel="Gráfico de linhas das quantidades vendidas"
              series={filteredSeries}
              value={(point) => point.quantity}
              formatValue={(value) => String(Math.round(value))}
            />
            <LineChart
              title="Lucro por período"
              ariaLabel="Gráfico de linhas dos lucros"
              series={filteredSeries}
              value={(point) => point.profit ?? 0}
              formatValue={compactMoney}
            />
          </>
        )}
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
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
}) {
  return (
    <article className="liquid-glass flex min-h-32 items-center gap-4 rounded-2xl p-5">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <small className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </small>
        <strong className="mt-1 block truncate text-2xl text-primary" title={value}>
          {value}
        </strong>
      </span>
    </article>
  );
}
function LineChart({
  title,
  ariaLabel,
  series,
  value,
  formatValue,
}: {
  title: string;
  ariaLabel: string;
  series: SalesSeries[];
  value: (point: SalesSeries["points"][number]) => number;
  formatValue: (value: number) => string;
}) {
  const dates = series[0]?.points.map((point) => point.date) ?? [];
  const maximum = Math.max(1, ...series.flatMap((item) => item.points.map(value)));
  return (
    <article className="min-w-0 rounded border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {series.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 text-xs font-semibold">
            <span
              className="size-2.5 rounded-full"
              style={{ background: colors[index % colors.length] }}
            />
            {item.name}
          </div>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox="0 0 760 330"
          className="min-w-[620px]"
          role="img"
          aria-label={ariaLabel}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartBottom - ratio * chartHeight;
            return (
              <g key={ratio}>
                <line
                  x1={chartLeft}
                  x2={chartRight}
                  y1={y}
                  y2={y}
                  stroke="#e4e0db"
                  strokeWidth="1"
                />
                <text
                  x={chartLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[11px]"
                >
                  {formatValue(maximum * ratio)}
                </text>
              </g>
            );
          })}
          {dates.map((date, index) => {
            const x = pointX(index, dates.length);
            return (
              <g key={date}>
                <line
                  x1={x}
                  x2={x}
                  y1={chartTop}
                  y2={chartBottom}
                  stroke="#f1eeea"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={chartBottom + 24}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
                    month: "short",
                    year: "2-digit",
                  })}
                </text>
              </g>
            );
          })}
          {series.map((item, seriesIndex) => {
            const color = colors[seriesIndex % colors.length];
            const points = item.points
              .map(
                (point, index) =>
                  `${pointX(index, item.points.length)},${pointY(value(point), maximum)}`,
              )
              .join(" ");
            return (
              <g key={item.name}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {item.points.map((point, index) => {
                  const pointValue = value(point);
                  return (
                    <g key={point.date}>
                      <circle
                        cx={pointX(index, item.points.length)}
                        cy={pointY(pointValue, maximum)}
                        r="5"
                        fill="white"
                        stroke={color}
                        strokeWidth="3"
                      >
                        <title>{`${item.name} — ${point.date}: ${formatValue(pointValue)}`}</title>
                      </circle>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </article>
  );
}
const colors = ["#eb0907", "#8f2d2c", "#59201f", "#d47b2e", "#38322b"];
const chartLeft = 52;
const chartRight = 735;
const chartTop = 20;
const chartBottom = 285;
const chartHeight = chartBottom - chartTop;
function pointX(index: number, total: number) {
  return total <= 1
    ? (chartLeft + chartRight) / 2
    : chartLeft + (index * (chartRight - chartLeft)) / (total - 1);
}
function pointY(value: number, maximum: number) {
  return chartBottom - (value / maximum) * chartHeight;
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
