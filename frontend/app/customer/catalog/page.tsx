import { Suspense } from "react";
import { StoreCatalog } from "@/presentation/components/organisms/store-catalog";

export default function CatalogPage() {
  return (
    <Suspense>
      <StoreCatalog />
    </Suspense>
  );
}
