"use client";
import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2, PackageCheck, Repeat2, Send, Truck, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { CustomerOrder, StoreProduct } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";
import { RecommendationStrip } from "@/presentation/components/molecules/recommendation-strip";

export function CustomerOrders() {
  const params = useSearchParams();
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [recommendations, setRecommendations] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(
    params.get("completed")
      ? `Pedido ${params.get("completed")} realizado com sucesso.`
      : null,
  );
  const [exchangeOrder, setExchangeOrder] = useState<CustomerOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<CustomerOrder | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [reason, setReason] = useState("");
  async function reload() {
    setOrders(await gateway.orders());
  }
  useEffect(() => {
    Promise.all([gateway.orders(), gateway.recommendations("ORDERS")])
      .then(([items, suggested]) => {
        setOrders(items);
        setRecommendations(suggested);
      })
      .finally(() => setLoading(false));
  }, [gateway]);
  async function act(action: () => Promise<void>, success: string) {
    await action();
    await reload();
    setMessage(success);
  }
  function openExchange(order: CustomerOrder) {
    setExchangeOrder(order);
    setQuantities({});
    setReason("");
  }
  async function exchange() {
    if (!exchangeOrder) return;
    const items = exchangeOrder.items
      .map((item) => ({ bookId: item.bookId, quantity: quantities[item.bookId] ?? 0 }))
      .filter((item) => item.quantity > 0);
    if (!items.length) {
      setMessage("Informe a quantidade de ao menos um item para troca.");
      return;
    }
    if (reason.trim().length < 10) {
      setMessage("Descreva o motivo da troca com pelo menos 10 caracteres.");
      return;
    }
    const result = await gateway.requestExchange(exchangeOrder.id, items, reason.trim());
    setExchangeOrder(null);
    setQuantities({});
    setReason("");
    await reload();
    setMessage(`Solicitação ${result.code} enviada.`);
  }
  if (loading)
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  return (
    <div className="p-4">
      <section className="rounded-2xl bg-white p-6">
        <h1 className="text-3xl font-semibold">Seus pedidos</h1>
        {message && (
          <p className="mt-4 border border-[#007600] bg-[#f0fff0] p-3 text-sm text-[#007600]">
            {message}
          </p>
        )}
        <div className="mt-5 grid gap-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="overflow-hidden rounded-xl border border-[#d5d9d9]"
            >
              <header className="grid gap-2 bg-[#f0f2f2] px-5 py-3 text-xs sm:grid-cols-4">
                <span>
                  PEDIDO REALIZADO
                  <br />
                  <strong>{date(order.saleDate)}</strong>
                </span>
                <span>
                  TOTAL
                  <br />
                  <strong>{money(order.total)}</strong>
                </span>
                <span>
                  STATUS
                  <br />
                  <strong>{statusLabel(order.status)}</strong>
                </span>
                <span className="text-right">PEDIDO Nº {order.code}</span>
              </header>
              <div className="p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  {statusIcon(order.status)}
                  {statusLabel(order.status)}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {order.items
                    .map((item) => `${item.quantity}× ${item.title}`)
                    .join(" · ")}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setDetailOrder(order)}>
                    <Eye />
                    Ver resumo
                  </Button>
                  {["EM_ABERTO", "EM_PROCESSAMENTO", "PAGAMENTO_REALIZADO"].includes(
                    order.status,
                  ) && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        void act(
                          () => gateway.cancelOrder(order.id),
                          "Pedido cancelado com sucesso.",
                        )
                      }
                    >
                      <XCircle />
                      Cancelar pedido
                    </Button>
                  )}
                  {["EM_TRANSPORTE"].includes(order.status) && (
                    <Button
                      onClick={() =>
                        void act(
                          () => gateway.confirmReceipt(order.id),
                          "Recebimento confirmado.",
                        )
                      }
                    >
                      <PackageCheck />
                      Confirmar recebimento
                    </Button>
                  )}
                  {order.status === "ENTREGUE" && (
                    <Button variant="outline" onClick={() => openExchange(order)}>
                      <Repeat2 />
                      Solicitar troca
                    </Button>
                  )}
                  {order.exchanges?.some(
                    (exchange) => exchange.status === "TROCA_AUTORIZADA",
                  ) && (
                    <Button
                      onClick={() =>
                        void act(
                          () => gateway.dispatchExchange(order.id),
                          "Despacho do item informado.",
                        )
                      }
                    >
                      <Send />
                      Informar despacho
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="mt-4">
        <RecommendationStrip title="Continue explorando" products={recommendations} />
      </div>
      {exchangeOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4">
          <section className="my-6 w-full max-w-xl rounded-2xl bg-white p-6">
            <h2 className="text-xl font-bold">Selecionar quantidades para troca</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pedido {exchangeOrder.code}. Você pode devolver apenas parte das unidades
              compradas.
            </p>
            <div className="my-5 grid gap-3">
              {exchangeOrder.items.map((item) => {
                const exchanged = (exchangeOrder.exchanges ?? [])
                  .flatMap((request) => request.items)
                  .filter((requested) => requested.bookId === item.bookId)
                  .reduce((sum, requested) => sum + requested.quantity, 0);
                const available = Math.max(0, item.quantity - exchanged);
                return (
                  <label
                    key={item.bookId}
                    className="grid grid-cols-[1fr_100px] items-center gap-3 rounded-xl border p-4"
                  >
                    <span>
                      <strong>{item.title}</strong>
                      <small className="block text-muted-foreground">
                        Compradas: {item.quantity} · Disponíveis para troca: {available}
                      </small>
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={available}
                      value={quantities[item.bookId] ?? 0}
                      onChange={(event) =>
                        setQuantities((current) => ({
                          ...current,
                          [item.bookId]: Math.min(
                            available,
                            Math.max(0, Number(event.target.value)),
                          ),
                        }))
                      }
                      className="h-10 rounded border px-3"
                      aria-label={`Quantidade de ${item.title}`}
                    />
                  </label>
                );
              })}
            </div>
            <label className="grid gap-2 text-sm">
              <Label>Motivo da troca</Label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                minLength={10}
                maxLength={500}
                rows={4}
                placeholder="Descreva o problema encontrado, o estado do item e o que motivou a solicitação."
                required
              />
              <span className="text-xs text-muted-foreground">
                {reason.length}/500 caracteres
              </span>
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setExchangeOrder(null)}>
                Voltar
              </Button>
              <Button onClick={() => void exchange()}>Solicitar troca</Button>
            </div>
          </section>
        </div>
      )}
      {detailOrder && (
        <OrderSummary
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onCancel={() => {
            void act(
              () => gateway.cancelOrder(detailOrder.id),
              "Solicitação de cancelamento enviada com sucesso.",
            );
            setDetailOrder(null);
          }}
          onExchange={() => {
            openExchange(detailOrder);
            setDetailOrder(null);
          }}
        />
      )}
    </div>
  );
}

function OrderSummary({
  order,
  onClose,
  onCancel,
  onExchange,
}: {
  order: CustomerOrder;
  onClose: () => void;
  onCancel: () => void;
  onExchange: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Resumo do pedido ${order.code}`}
        onMouseDown={(event) => event.stopPropagation()}
        className="my-6 w-full max-w-3xl rounded-2xl bg-white p-6"
      >
        <header className="flex justify-between gap-4 border-b pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Resumo do pedido
            </p>
            <h2 className="mt-1 text-2xl font-bold">{order.code}</h2>
            <p className="text-sm text-muted-foreground">
              {date(order.saleDate)} · {statusLabel(order.status)}
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </header>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SummaryBlock title="Itens">
            {order.items.map((item) => (
              <p key={item.bookId} className="flex justify-between gap-3 text-sm">
                <span>
                  {item.quantity}× {item.title}
                </span>
                <strong>{money(item.total)}</strong>
              </p>
            ))}
          </SummaryBlock>
          <SummaryBlock title="Entrega">
            <p className="text-sm">
              {order.deliveryAddress
                ? `${order.deliveryAddress.name} — ${order.deliveryAddress.street}, ${order.deliveryAddress.number} · ${order.deliveryAddress.city}/${order.deliveryAddress.state}`
                : "Endereço não registrado no pedido legado."}
            </p>
          </SummaryBlock>
          <SummaryBlock title="Pagamento">
            {order.payments?.map((payment) => (
              <p key={payment.cardId} className="flex justify-between text-sm">
                <span>
                  {payment.brand} •••• {payment.lastFourDigits}
                </span>
                <strong>{money(payment.amount)}</strong>
              </p>
            ))}
            {order.coupons?.length ? (
              <p className="mt-2 text-xs text-primary">
                Cupons: {order.coupons.join(", ")}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhum cupom aplicado.</p>
            )}
          </SummaryBlock>
          <SummaryBlock title="Totais">
            <p className="flex justify-between text-sm">
              <span>Itens</span>
              <span>
                {money(
                  order.subtotal ??
                    order.items.reduce((sum, item) => sum + item.total, 0),
                )}
              </span>
            </p>
            <p className="flex justify-between text-sm">
              <span>Frete</span>
              <span>{money(order.freight)}</span>
            </p>
            {Boolean(order.discount) && (
              <p className="flex justify-between text-sm text-green-700">
                <span>Desconto</span>
                <span>− {money(order.discount ?? 0)}</span>
              </p>
            )}
            <p className="mt-2 flex justify-between border-t pt-2 font-bold">
              <span>Total</span>
              <span>{money(order.total)}</span>
            </p>
          </SummaryBlock>
        </div>
        {Boolean(order.exchanges?.length) && (
          <SummaryBlock title="Trocas solicitadas">
            {order.exchanges?.map((exchange) => (
              <div key={exchange.code} className="mb-2 rounded border p-3 text-sm">
                <strong>
                  {exchange.code} · {statusLabel(exchange.status)}
                </strong>
                <p className="mt-1">
                  {exchange.items
                    .map((item) => `${item.quantity}× ${item.title}`)
                    .join(" · ")}
                </p>
                <p className="mt-1 text-muted-foreground">Motivo: {exchange.reason}</p>
              </div>
            ))}
          </SummaryBlock>
        )}
        <footer className="mt-5 flex flex-wrap justify-end gap-2 border-t pt-5">
          {["EM_ABERTO", "EM_PROCESSAMENTO", "PAGAMENTO_REALIZADO"].includes(
            order.status,
          ) && (
            <Button variant="outline" onClick={onCancel}>
              <XCircle /> Solicitar cancelamento
            </Button>
          )}
          {order.status === "ENTREGUE" && (
            <Button onClick={onExchange}>
              <Repeat2 /> Iniciar processo de troca
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
}
function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-[#faf8f3] p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}
function statusLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLocaleLowerCase("pt-BR")
    .replace(/^./, (letter) => letter.toUpperCase());
}
function statusIcon(value: string) {
  return value === "ENTREGUE" ? (
    <PackageCheck className="text-[#007600]" />
  ) : value.includes("TRANSITO") || value.includes("TRÂNSITO") ? (
    <Truck className="text-[#d47b2e]" />
  ) : null;
}
function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
}
function date(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}
