import Link from "next/link";
import { LayoutGrid } from "lucide-react";

import { catalogListPath } from "@/presentation/catalog/catalog-paths";
import { catalogResources } from "@/presentation/catalog/catalog-resources";

export function BooksModuleNavigation() {
  return (
    <nav
      aria-label="Áreas do módulo de livros"
      className="mb-8 flex gap-2 overflow-x-auto border-b pb-3"
    >
      <Link
        href="/admin/books"
        className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <LayoutGrid className="size-4" />
        Visão geral
      </Link>
      {catalogResources.map((item) => (
        <Link
          key={item.resource}
          href={catalogListPath(item.resource)}
          className="inline-flex shrink-0 items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {item.plural}
        </Link>
      ))}
    </nav>
  );
}
