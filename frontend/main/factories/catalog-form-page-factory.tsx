import type { CatalogResourceDefinition } from "@/presentation/catalog/catalog-resources";
import { CatalogForm } from "@/presentation/components/organisms/catalog-form";

export function CatalogFormPageFactory({
  definition,
  entityId,
}: {
  definition: CatalogResourceDefinition;
  entityId?: number;
}) {
  return <CatalogForm definition={definition} entityId={entityId} />;
}
