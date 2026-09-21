import type { CustomerCart, StoreProduct } from "@/domain/models/storefront";
import { StoreProductCard } from "./store-product-card";

export function RecommendationStrip({
  title,
  products,
  onCartUpdated,
}: {
  title: string;
  products: StoreProduct[];
  onCartUpdated?: (cart: CustomerCart) => void;
}) {
  if (products.length === 0) return null;
  return (
    <section className="bg-white p-5">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {products.map((product) => (
          <StoreProductCard
            key={product.id}
            product={product}
            onCartUpdated={onCartUpdated}
          />
        ))}
      </div>
    </section>
  );
}
