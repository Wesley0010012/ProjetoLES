"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { StoreProduct } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";
import { RecommendationStrip } from "@/presentation/components/molecules/recommendation-strip";

export function StoreProductDetail({ productId }: { productId: number }) {
  const router = useRouter();
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [recommendations, setRecommendations] = useState<StoreProduct[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function load() {
      const [item, suggested] = await Promise.all([
        gateway.product(productId),
        gateway.publicRecommendations("PRODUCT"),
      ]);
      setProduct(item);
      setRecommendations(suggested.filter((candidate) => candidate.id !== productId));
    }
    void load();
  }, [gateway, productId]);

  if (!product)
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  async function add() {
    try {
      await gateway.addToCart(product!.id, quantity);
      router.push("/customer/cart");
    } catch {
      router.push("/customer/catalog");
    }
  }

  return (
    <div className="p-4">
      <section className="grid gap-8 bg-white p-6 lg:grid-cols-[340px_1fr_300px]">
        <div className="flex min-h-96 items-center justify-center bg-[#f7f7f7]">
          <Image
            src={product.coverImage}
            alt={`Capa do livro ${product.title}`}
            width={192}
            height={288}
            unoptimized
            priority
            className="h-72 w-48 rounded-r object-cover shadow-xl"
          />
        </div>
        <div>
          <p className="text-xs text-[#007185]">{product.categories.join(" › ")}</p>
          <h1 className="mt-2 text-3xl font-medium">{product.title}</h1>
          <p className="mt-2 text-sm">
            por <span className="text-[#007185]">{product.authors.join(", ")}</span>
          </p>
          <div className="my-5 border-t" />
          <p className="text-2xl">
            <span className="text-sm">R$</span>
            {product.price.toFixed(2).replace(".", ",")}
          </p>
          <p className="mt-5 leading-7">{product.synopsis}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Detail label="Código" value={product.code} />
            <Detail label="Autores" value={product.authors.join(", ")} />
            <Detail label="Categorias" value={product.categories.join(", ")} />
            <Detail label="Editora" value={product.editors.join(", ")} />
            <Detail label="Ano" value={String(product.year)} />
            <Detail label="Edição" value={product.edition} />
            <Detail label="Páginas" value={String(product.numberOfPages)} />
            <Detail label="ISBN" value={product.isbn} />
            <Detail label="Código de barras" value={product.barcode} />
            <Detail
              label="Grupo de precificação"
              value={`${product.precificationGroup.name} · ${product.precificationGroup.profitMarginPercentage}%`}
            />
            <Detail
              label="Dimensões"
              value={`${formatDimension(product.dimensions.height)} × ${formatDimension(product.dimensions.width)} × ${formatDimension(product.dimensions.depth)} cm`}
            />
            <Detail
              label="Peso"
              value={`${formatDimension(product.dimensions.weight)} kg`}
            />
          </dl>
        </div>
        <aside className="h-fit rounded-lg border border-[#d5d9d9] p-5 shadow-sm">
          <p className="text-xl font-medium">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </p>
          <p className="mt-3 text-sm text-[#007600]">
            {product.available ? "Em estoque" : "Indisponível"}
          </p>
          <label className="mt-5 grid gap-1 text-xs">
            Quantidade
            <select
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="h-9 rounded border bg-[#f0f2f2] px-2"
            >
              {Array.from(
                { length: Math.min(10, product.availableQuantity) },
                (_, index) => (
                  <option key={index + 1}>{index + 1}</option>
                ),
              )}
            </select>
          </label>
          <Button
            onClick={add}
            disabled={!product.available}
            className="mt-4 w-full rounded-full bg-[#59201f] text-white hover:bg-[#eb0907]"
          >
            <ShoppingCart />
            Adicionar ao carrinho
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Vendido e entregue por Libra.
          </p>
        </aside>
      </section>
      <div className="mt-5">
        <RecommendationStrip
          title="Quem viu este livro também se interessou por"
          products={recommendations.slice(0, 6)}
        />
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-bold">{label}</dt>
      <dd className="text-muted-foreground">{value}</dd>
    </div>
  );
}
function formatDimension(value: number) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}
