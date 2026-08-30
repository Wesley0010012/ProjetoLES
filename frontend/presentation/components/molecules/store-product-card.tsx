"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StoreProduct } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";

export function StoreProductCard({ product }: { product: StoreProduct }) {
  const router = useRouter();

  async function add() {
    try {
      await makeStorefrontGateway().addToCart(product.id, 1);
      router.push("/customer/cart");
    } catch {
      router.push("/customer/catalog");
    }
  }

  return (
    <article className="flex h-full flex-col border border-[#d5d9d9] bg-white p-4">
      <Link href={`/customer/products/${product.id}`} className="group">
        <div className="relative flex h-52 items-center justify-center overflow-hidden bg-[#f7f7f7]">
          <Image
            src={product.coverImage}
            alt={`Capa do livro ${product.title}`}
            width={112}
            height={168}
            unoptimized
            className="h-40 w-28 rounded-r object-cover shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"
          />
        </div>
        <h3 className="mt-4 line-clamp-2 text-sm leading-5 text-[#007185] group-hover:text-[#c7511f] group-hover:underline">
          {product.title}
        </h3>
      </Link>
      <p className="mt-1 text-xs text-muted-foreground">{product.authors.join(", ")}</p>
      {product.recommendationReason && (
        <p className="mt-2 text-[11px] font-semibold text-[#59201f]">
          {product.recommendationReason}
        </p>
      )}
      <div className="mt-auto pt-3">
        <p className="text-xl">
          <span className="text-xs">R$</span>
          {product.price.toFixed(2).replace(".", ",")}
        </p>
        <p
          className={`mt-1 text-xs ${product.available ? "text-[#007600]" : "text-destructive"}`}
        >
          {product.available ? "Em estoque" : "Indisponível"}
        </p>
      </div>
      <Button
        onClick={add}
        disabled={!product.available}
        className="mt-3 rounded-full bg-[#59201f] text-white hover:bg-[#eb0907]"
      >
        <ShoppingCart />
        Adicionar ao carrinho
      </Button>
    </article>
  );
}
