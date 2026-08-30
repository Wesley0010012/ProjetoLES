import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FolderTree,
  PenLine,
  Tags,
  UsersRound,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { catalogListPath } from "@/presentation/catalog/catalog-paths";
import { catalogResources } from "@/presentation/catalog/catalog-resources";

const icons = {
  books: BookOpen,
  authors: UsersRound,
  categories: Tags,
  editors: PenLine,
  "precification-groups": FolderTree,
};

export function BooksModuleDashboard() {
  return (
    <div>
      <header className="border-b pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eb0907]">
          Catálogo
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Livros
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Gerencie o catálogo e os domínios editoriais associados aos livros
          comercializados pela Libra.
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {catalogResources.map((item) => {
          const Icon = icons[item.resource];

          return (
            <Link
              key={item.resource}
              href={catalogListPath(item.resource)}
              className="group"
            >
              <Card className="h-full bg-white shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-[#d47b2e] group-hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-7 p-6">
                  <span className="flex size-11 items-center justify-center rounded bg-[#0f0000] text-[#eb0907]">
                    <Icon className="size-5" />
                  </span>
                  <div className="flex-1">
                    <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em]">
                      {item.plural}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Acessar área
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
