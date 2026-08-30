"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  Book,
  CatalogEntity,
  CatalogResource,
  NamedEntity,
  PrecificationGroup,
} from "@/domain/models/catalog";
import { makeCatalogGateway } from "@/main/factories/make-catalog-gateway";
import type { CatalogResourceDefinition } from "@/presentation/catalog/catalog-resources";
import { catalogCreatePath, catalogEditPath } from "@/presentation/catalog/catalog-paths";

type CatalogListProps = {
  definition: CatalogResourceDefinition;
};

export function CatalogList({ definition }: CatalogListProps) {
  const gateway = useMemo(() => makeCatalogGateway(), []);
  const [entities, setEntities] = useState<CatalogEntity[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        setEntities(await gateway.list(definition.resource));
      } catch (cause) {
        setError(messageFrom(cause));
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [definition.resource, gateway]);

  async function remove(entity: CatalogEntity) {
    const label = displayName(entity, definition.resource);
    if (!window.confirm(`Excluir “${label}”?`)) return;
    setDeletingId(entity.id);
    setError(null);
    try {
      await gateway.delete(definition.resource, entity.id);
      setEntities((current) => current.filter((item) => item.id !== entity.id));
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = entities.filter((entity) =>
    displayName(entity, definition.resource)
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );

  return (
    <div>
      <header className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Catálogo
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.045em]">
            {definition.plural}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {definition.description}
          </p>
        </div>
        <Link
          href={catalogCreatePath(definition.resource)}
          className={buttonVariants({ className: "h-11 rounded-xl" })}
        >
          <Plus />
          Novo {definition.singular.toLocaleLowerCase("pt-BR")}
        </Link>
      </header>

      <div className="mt-7 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 bg-white pl-9"
            placeholder={`Buscar ${definition.plural.toLowerCase()}...`}
          />
        </div>
        <span className="hidden text-xs text-muted-foreground sm:block">
          {filtered.length} {filtered.length === 1 ? "registro" : "registros"}
        </span>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-5">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section className="mt-5 overflow-hidden rounded border bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Carregando registros...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-2xl bg-secondary p-4 text-primary">
              <BookOpen className="size-6" />
            </div>
            <h2 className="mt-4 font-heading text-xl font-semibold">
              Nenhum registro encontrado
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie o primeiro registro ou ajuste sua busca.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="border-b bg-[#faf8f3] text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">{definition.singular}</th>
                  <th className="px-5 py-4">Detalhe</th>
                  <th className="px-5 py-4">Atualizado</th>
                  <th className="px-5 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((entity) => (
                  <tr key={entity.id} className="transition hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <span className="font-medium">
                        {displayName(entity, definition.resource)}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        ID {entity.id}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {detail(entity, definition.resource)}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {new Date(entity.updatedAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {definition.resource === "books" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBook(entity as Book)}
                          >
                            <Eye />
                            Ver detalhes
                          </Button>
                        )}
                        <Link
                          href={catalogEditPath(definition.resource, entity.id)}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          <Pencil />
                          Editar
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deletingId === entity.id}
                          onClick={() => void remove(entity)}
                          className="text-destructive hover:text-destructive"
                        >
                          {deletingId === entity.id ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Trash2 />
                          )}
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4"
          role="presentation"
          onMouseDown={() => setSelectedBook(null)}
        >
          <section
            className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-details-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {selectedBook.code}
                </p>
                <h2
                  id="book-details-title"
                  className="mt-1 font-heading text-3xl font-semibold"
                >
                  {selectedBook.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedBook.authors.map((author) => author.name).join(", ")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedBook(null)}
              >
                Fechar
              </Button>
            </header>
            <p className="mt-5 text-sm leading-6">{selectedBook.synopsis}</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <BookDetail
                label="Categorias"
                value={selectedBook.categories
                  .map((category) => category.name)
                  .join(", ")}
              />
              <BookDetail
                label="Editora"
                value={selectedBook.editors.map((editor) => editor.name).join(", ")}
              />
              <BookDetail label="Ano" value={String(selectedBook.year)} />
              <BookDetail label="Edição" value={selectedBook.edition} />
              <BookDetail label="ISBN" value={selectedBook.isbn} />
              <BookDetail label="Código de barras" value={selectedBook.barcode} />
              <BookDetail
                label="Número de páginas"
                value={String(selectedBook.numberOfPages)}
              />
              <BookDetail
                label="Grupo de precificação"
                value={`${selectedBook.precificationGroup.name} · ${selectedBook.precificationGroup.profitMarginPercentage}%`}
              />
              <BookDetail
                label="Dimensões"
                value={`${selectedBook.dimensions.height} × ${selectedBook.dimensions.width} × ${selectedBook.dimensions.depth} cm · ${selectedBook.dimensions.weight} kg`}
              />
              <BookDetail
                label="Situação"
                value={selectedBook.active ? "Ativo" : "Inativo"}
              />
              <BookDetail
                label="Criado em"
                value={new Date(selectedBook.createdAt).toLocaleDateString("pt-BR")}
              />
              <BookDetail
                label="Atualizado em"
                value={new Date(selectedBook.updatedAt).toLocaleDateString("pt-BR")}
              />
            </dl>
          </section>
        </div>
      )}
    </div>
  );
}

function BookDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-[#faf8f3] p-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function displayName(entity: CatalogEntity, resource: CatalogResource): string {
  return resource === "books" ? (entity as Book).title : (entity as NamedEntity).name;
}

function detail(entity: CatalogEntity, resource: CatalogResource): string {
  if (resource === "books") {
    const book = entity as Book;
    return `${book.code} · ISBN ${book.isbn}`;
  }
  if (resource === "precification-groups") {
    return `${(entity as PrecificationGroup).profitMarginPercentage}% de margem`;
  }
  return "Cadastro ativo";
}

function messageFrom(cause: unknown): string {
  return cause instanceof Error
    ? cause.message
    : "Não foi possível carregar os registros.";
}
