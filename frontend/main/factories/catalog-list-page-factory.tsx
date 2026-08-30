import type { CatalogResourceDefinition } from "@/presentation/catalog/catalog-resources";
import { CatalogList } from "@/presentation/components/organisms/catalog-list";

export function CatalogListPageFactory({
  definition,
}: {
  definition: CatalogResourceDefinition;
}) {
  return <CatalogList definition={definition} />;
}
