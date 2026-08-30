"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";

import type { StoreProduct } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";
import { StoreProductCard } from "@/presentation/components/molecules/store-product-card";

export function StoreCatalog() {
  const params = useSearchParams();
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const query = params.get("query") ?? undefined;
  const category = params.get("category") ?? undefined;
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [loadedItems, categoryItems] = await Promise.all([
          gateway.products(query, category),
          gateway.categories(),
        ]);
        const items = loadedItems;
        if (!active) return;
        setProducts(items);
        setCategories(categoryItems);
      } catch (cause) {
        if (!active) return;
        setProducts([]);
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível carregar o catálogo.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [category, gateway, query, reloadKey]);

  return (
    <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[230px_1fr]">
      <aside className="liquid-glass h-fit rounded-3xl p-5">
        <h2 className="text-sm font-bold">Categorias</h2>
        <div className="mt-3 grid gap-1">
          <Link
            href="/customer/catalog"
            className={`rounded-xl px-3 py-2 text-sm transition hover:bg-white/70 ${!category ? "bg-white/70 font-semibold text-[#59201f]" : "text-[#59201f]"}`}
          >
            Todas
          </Link>
          {categories.map((item) => (
            <Link
              key={item}
              href={`/customer/catalog?category=${encodeURIComponent(item)}`}
              className={`rounded-xl px-3 py-2 text-sm transition hover:bg-white/70 ${category === item ? "bg-white/70 font-semibold text-[#59201f]" : "text-[#59201f]"}`}
            >
              {item}
            </Link>
          ))}
        </div>
      </aside>
      <section className="liquid-glass rounded-3xl p-5 sm:p-7">
        <h1 className="text-3xl font-semibold tracking-[-0.035em]">
          {query ? `Resultados para “${query}”` : (category ?? "Todos os livros")}
        </h1>
        <p className="mt-2 border-b border-white/70 pb-5 text-sm text-muted-foreground">
          {loading
            ? "Carregando resultados…"
            : `${products.length} resultado${products.length === 1 ? "" : "s"}`}
        </p>
        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <AlertCircle className="size-8 text-destructive" />
            <h2 className="mt-3 font-semibold">Não foi possível carregar os livros</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-semibold"
            >
              <RotateCcw className="size-4" />
              Tentar novamente
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
            Nenhum livro encontrado para este filtro.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <StoreProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
