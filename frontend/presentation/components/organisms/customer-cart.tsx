"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingCart, Trash2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { CustomerCart as Cart, StoreProduct } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";
import { RecommendationStrip } from "@/presentation/components/molecules/recommendation-strip";

export function CustomerCart() {
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [cart, setCart] = useState<Cart | null>(null);
  const [recommendations, setRecommendations] = useState<StoreProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const profile = await gateway.profile();
        if (!profile.complete) {
          window.location.replace("/customer/complete-profile");
          return;
        }
        const [value, suggested] = await Promise.all([
          gateway.cart(),
          gateway.recommendations("CART"),
        ]);
        setCart(value);
        setRecommendations(suggested);
      } catch (cause) {
        setError(messageFrom(cause));
      }
    }
    void load();
  }, [gateway]);

  async function update(bookId: number, quantity: number) {
    try {
      setCart(await gateway.updateCart(bookId, quantity));
    } catch (cause) {
      setError(messageFrom(cause));
    }
  }
  async function remove(bookId: number) {
    if (!window.confirm("Deseja remover este livro do carrinho?")) return;
    try {
      setCart(await gateway.removeFromCart(bookId));
    } catch (cause) {
      setError(messageFrom(cause));
    }
  }

  if (!cart)
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  return (
    <div className="p-4">
      {error && <p className="mb-4 bg-white p-4 text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="bg-white p-6">
          <h1 className="border-b pb-4 text-3xl font-medium">Carrinho de compras</h1>
          {cart.items.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center">
              <ShoppingCart className="size-10 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-bold">Seu carrinho está vazio</h2>
              <Link href="/customer/catalog" className="mt-2 text-sm text-[#007185]">
                Conheça nossos livros
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {cart.items.map((item) => (
                <article
                  key={item.bookId}
                  className="grid gap-4 py-5 sm:grid-cols-[100px_1fr]"
                >
                  <div className="flex h-32 items-center justify-center bg-[#eb0907] p-2 text-center text-xs font-bold text-white">
                    {item.title}
                  </div>
                  <div>
                    <Link
                      href={`/customer/products/${item.bookId}`}
                      className="text-lg text-[#007185] hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.authors.join(", ")}
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#007600]">
                      Reservado em estoque
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <select
                        value={item.quantity}
                        onChange={(event) =>
                          void update(item.bookId, Number(event.target.value))
                        }
                        className="h-8 rounded border bg-[#f0f2f2] px-2 text-xs"
                      >
                        {Array.from({ length: 10 }, (_, index) => (
                          <option key={index + 1}>{index + 1}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => void remove(item.bookId)}
                        className="flex items-center gap-1 text-xs text-[#007185] hover:underline"
                      >
                        <Trash2 className="size-3" />
                        Excluir
                      </button>
                      <strong className="ml-auto">{money(item.total)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          <p className="border-t pt-4 text-right text-lg">
            Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} itens):{" "}
            <strong>{money(cart.subtotal)}</strong>
          </p>
        </section>
        <aside className="h-fit bg-white p-5">
          <p className="text-lg">
            Subtotal: <strong>{money(cart.subtotal)}</strong>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Frete estimado: {money(cart.estimatedFreight)}
          </p>
          {cart.expiresAt && (
            <p className="mt-3 text-xs text-[#b12704]">
              A reserva expira em{" "}
              {new Date(cart.expiresAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              .
            </p>
          )}
          <Link
            href="/customer/checkout"
            aria-disabled={cart.items.length === 0}
            className={buttonVariants({
              className: `mt-5 w-full rounded-full bg-[#59201f] text-white hover:bg-[#eb0907] ${cart.items.length === 0 ? "pointer-events-none opacity-50" : ""}`,
            })}
          >
            Fechar pedido
          </Link>
        </aside>
      </div>
      <div className="mt-4">
        <RecommendationStrip
          title="Clientes que compraram itens no seu carrinho também compraram"
          products={recommendations}
        />
      </div>
    </div>
  );
}
function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
}
function messageFrom(cause: unknown) {
  return cause instanceof Error
    ? cause.message
    : "Não foi possível atualizar o carrinho.";
}
