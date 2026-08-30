import { notFound } from "next/navigation";

import { CatalogListPageFactory } from "@/main/factories/catalog-list-page-factory";
import { findCatalogResource } from "@/presentation/catalog/catalog-resources";

export default async function CatalogResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const definition = findCatalogResource(resource);

  if (!definition) notFound();

  return <CatalogListPageFactory definition={definition} />;
}
