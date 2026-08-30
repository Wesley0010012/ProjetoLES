"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, Check, Eye, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Sale } from "@/domain/models/sales";
import { useSalesConnector } from "@/main/connectors/use-sales-connector";

export function SalesDashboard({ section }: { section: "SALES" | "EXCHANGES" }) {
  const {
    sales,
    exchanges,
    loading,
    error,
    updating,
    selectedSale,
    setSelectedSale,
    review,
    setReview,
    reviewObservation,
    setReviewObservation,
    advanceSale,
    advanceExchange,
    finishExchange,
    openReview,
    submitReview,
  } = useSalesConnector();

  return (
    <div>
      <Link
        href="/admin/sales"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para vendas e trocas
      </Link>
      <header className="border-b pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eb0907]">
          Operação comercial
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.045em]">
          {section === "SALES" ? "Pedidos e vendas" : "Trocas"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {section === "SALES"
            ? "Acompanhe pagamento, expedição e entrega de cada pedido."
            : "Analise solicitações e acompanhe o ciclo administrativo das trocas."}
        </p>
      </header>

      {error && (
        <Alert variant="destructive" className="mt-5">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading ? (
        <div className="flex min-h-72 items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : section === "SALES" ? (
        <section className="mt-5 grid gap-3">
          {sales.map((sale) => (
            <article
              key={sale.id}
              className="grid gap-5 rounded border bg-white p-5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <strong>{sale.code}</strong>
                  <Status value={sale.status} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(sale.saleDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  {sale.customer.name} · {sale.customer.code}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {sale.items
                    .map((item) => `${item.quantity}× ${item.title}`)
                    .join(" · ")}
                </p>
                <p className="mt-3 font-bold text-[#59201f]">{money(sale.total)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setSelectedSale(sale)}>
                  <Eye />
                  Ver resumo
                </Button>
                {nextSaleStatus[normalizeStatus(sale.status)] && (
                  <Button
                    disabled={updating === `sale-${sale.id}`}
                    onClick={() =>
                      advanceSale(sale.id, nextSaleStatus[normalizeStatus(sale.status)])
                    }
                  >
                    <Check />
                    Alterar para{" "}
                    {statusLabel(nextSaleStatus[normalizeStatus(sale.status)])}
                  </Button>
                )}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-5 grid gap-3">
          {exchanges.map((exchange) => (
            <article
              key={exchange.id}
              className="grid gap-5 rounded border bg-white p-5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <strong>{exchange.code}</strong>
                  <Status value={exchange.status} />
                </div>
                <p className="mt-2 text-sm">
                  {exchange.customer} · {exchange.saleCode}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {exchange.items
                    .map((item) => `${item.quantity}× ${item.title}`)
                    .join(" · ")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Motivo: {exchange.reason ?? "Não informado"}
                </p>
                {exchange.reviewObservation && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Observação do operador: {exchange.reviewObservation}
                  </p>
                )}
                <p className="mt-3 font-bold text-[#59201f]">{money(exchange.total)}</p>
                {exchange.coupon && (
                  <p className="mt-2 text-xs font-semibold text-[#59201f]">
                    Cupom {exchange.coupon.code} · {money(exchange.coupon.value)}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {isStatus(exchange.status, "TROCA SOLICITADA", "EM TROCA") && (
                  <>
                    <Button
                      onClick={() => {
                        openReview(exchange, "ACCEPT");
                      }}
                    >
                      <Check />
                      Aceitar troca
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        openReview(exchange, "REJECT");
                      }}
                    >
                      Negar troca
                    </Button>
                  </>
                )}
                {isStatus(exchange.status, "ITEM ENVIADO") && (
                  <Button onClick={() => advanceExchange(exchange.id, "ITEM RECEBIDO")}>
                    Marcar item recebido
                  </Button>
                )}
                {isStatus(exchange.status, "ITEM RECEBIDO") && (
                  <Button
                    disabled={updating === `exchange-${exchange.id}`}
                    onClick={() => void finishExchange(exchange.id)}
                  >
                    {updating === `exchange-${exchange.id}` && (
                      <Loader2 className="animate-spin" />
                    )}
                    Finalizar e gerar cupom
                  </Button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
      {selectedSale && (
        <AdminOrderSummary sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}
      {review && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl bg-white p-6"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Análise da troca {review.exchange.code}
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              {review.decision === "ACCEPT" ? "Aceitar troca" : "Negar troca"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Motivo do cliente: {review.exchange.reason ?? "Não informado"}
            </p>
            <label className="mt-5 grid gap-2 text-sm">
              <span className="font-medium">Observação do operador</span>
              <textarea
                value={reviewObservation}
                onChange={(event) => setReviewObservation(event.target.value)}
                minLength={5}
                maxLength={500}
                rows={4}
                placeholder="Descreva a justificativa para esta decisão."
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReview(null)}>
                Cancelar
              </Button>
              <Button onClick={() => void submitReview()}>Confirmar decisão</Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function AdminOrderSummary({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Resumo administrativo do pedido ${sale.code}`}
        onMouseDown={(event) => event.stopPropagation()}
        className="my-6 w-full max-w-3xl rounded-2xl bg-white p-6"
      >
        <header className="flex justify-between gap-4 border-b pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Resumo administrativo
            </p>
            <h2 className="mt-1 text-2xl font-bold">{sale.code}</h2>
            <p className="text-sm text-muted-foreground">
              {sale.customer.name} · {sale.customer.code}
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </header>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AdminBlock title="Pedido">
            <p>Data: {new Date(sale.saleDate).toLocaleDateString("pt-BR")}</p>
            <p>Status: {statusLabel(sale.status)}</p>
            <p>Entrega: {sale.deliveryAddress ?? "Endereço de entrega cadastrado"}</p>
          </AdminBlock>
          <AdminBlock title="Itens">
            {sale.items.map((item) => (
              <p key={item.bookId} className="flex justify-between gap-3">
                <span>
                  {item.quantity}× {item.title}
                </span>
                <strong>{money(item.total)}</strong>
              </p>
            ))}
          </AdminBlock>
          <AdminBlock title="Formas de pagamento">
            {sale.payments?.map((payment) => (
              <p key={payment.label} className="flex justify-between">
                <span>{payment.label}</span>
                <strong>{money(payment.amount)}</strong>
              </p>
            )) ?? <p>VISA •••• 4242 · {money(sale.total)}</p>}
            {sale.coupons?.length ? (
              <p>Cupons: {sale.coupons.join(", ")}</p>
            ) : (
              <p>Nenhum cupom aplicado</p>
            )}
          </AdminBlock>
          <AdminBlock title="Totais">
            <p className="flex justify-between">
              <span>Itens</span>
              <span>{money(sale.items.reduce((sum, item) => sum + item.total, 0))}</span>
            </p>
            <p className="flex justify-between">
              <span>Frete</span>
              <span>{money(sale.freight)}</span>
            </p>
            <p className="mt-2 flex justify-between border-t pt-2 text-base font-bold">
              <span>Total</span>
              <span>{money(sale.total)}</span>
            </p>
          </AdminBlock>
        </div>
      </section>
    </div>
  );
}
function AdminBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-2 rounded-xl border bg-[#faf8f3] p-4 text-sm">
      <h3 className="mb-1 font-bold uppercase tracking-wide">{title}</h3>
      {children}
    </section>
  );
}

function Status({ value }: { value: string }) {
  return (
    <span className="rounded bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]">
      {statusLabel(value)}
    </span>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
}
const nextSaleStatus: Record<string, string> = {
  "EM ABERTO": "EM PROCESSAMENTO",
  "EM PROCESSAMENTO": "PAGAMENTO REALIZADO",
  "PAGAMENTO REALIZADO": "EM TRÂNSITO",
  "EM TRÂNSITO": "ENTREGUE",
  "EM TRANSPORTE": "ENTREGUE",
};

function normalizeStatus(value: string) {
  return value.trim().toLocaleUpperCase("pt-BR").replaceAll("_", " ");
}
function statusLabel(value: string) {
  return normalizeStatus(value);
}
function isStatus(value: string, ...expected: string[]) {
  return expected.some((item) => normalizeStatus(value) === normalizeStatus(item));
}
