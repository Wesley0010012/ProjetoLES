"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, Check, Loader2, Save } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type {
  Book,
  BookRelation,
  CatalogEntity,
  CatalogPayload,
  NamedEntity,
  PrecificationGroup,
} from "@/domain/models/catalog";
import { makeCatalogGateway } from "@/main/factories/make-catalog-gateway";
import type { CatalogResourceDefinition } from "@/presentation/catalog/catalog-resources";
import { catalogListPath } from "@/presentation/catalog/catalog-paths";
import { FormField } from "@/presentation/components/molecules/form-field";

type CatalogFormProps = {
  definition: CatalogResourceDefinition;
  entityId?: number;
};

type BookOptions = {
  authors: NamedEntity[];
  categories: NamedEntity[];
  editors: NamedEntity[];
  groups: PrecificationGroup[];
};

const emptyOptions: BookOptions = {
  authors: [],
  categories: [],
  editors: [],
  groups: [],
};

export function CatalogForm({ definition, entityId }: CatalogFormProps) {
  const router = useRouter();
  const gateway = useMemo(() => makeCatalogGateway(), []);
  const [entity, setEntity] = useState<CatalogEntity | null>(null);
  const [options, setOptions] = useState<BookOptions>(emptyOptions);
  const [isLoading, setIsLoading] = useState(
    Boolean(entityId) || definition.resource === "books",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(Boolean(entityId) || definition.resource === "books");
      setError(null);
      try {
        const optionsPromise =
          definition.resource === "books"
            ? Promise.all([
                gateway.list("authors"),
                gateway.list("categories"),
                gateway.list("editors"),
                gateway.list("precification-groups"),
              ]).then(([authors, categories, editors, groups]) => ({
                authors: authors as NamedEntity[],
                categories: categories as NamedEntity[],
                editors: editors as NamedEntity[],
                groups: groups as PrecificationGroup[],
              }))
            : Promise.resolve(emptyOptions);
        const [current, loadedOptions] = await Promise.all([
          entityId
            ? gateway.findById(definition.resource, entityId)
            : Promise.resolve(null),
          optionsPromise,
        ]);
        setEntity(current);
        setOptions(loadedOptions);
      } catch (cause) {
        setError(messageFrom(cause));
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [definition.resource, entityId, gateway]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const payload = payloadFrom(form, definition.resource);
      const saved = entityId
        ? await gateway.update(definition.resource, entityId, payload)
        : await gateway.create(definition.resource, payload);
      if (definition.resource === "books") {
        await synchronizeBookRelations(saved as Book, form);
      }
      router.push(catalogListPath(definition.resource));
      router.refresh();
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setIsSaving(false);
    }
  }

  async function synchronizeBookRelations(book: Book, form: FormData): Promise<void> {
    const relations: BookRelation[] = ["authors", "categories", "editors"];
    for (const relation of relations) {
      const selected = form.getAll(relation).map(Number);
      const current = book[relation].map((item) => item.id);
      await Promise.all([
        ...selected
          .filter((id) => !current.includes(id))
          .map((id) => gateway.addBookRelation(book.id, relation, id)),
        ...current
          .filter((id) => !selected.includes(id))
          .map((id) => gateway.removeBookRelation(book.id, relation, id)),
      ]);
    }
  }

  const book = definition.resource === "books" && entity ? (entity as Book) : null;
  const named =
    entity && definition.resource !== "books" ? (entity as NamedEntity) : null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={catalogListPath(definition.resource)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para {definition.plural.toLowerCase()}
      </Link>

      <header className="border-b pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {entityId ? "Edição" : "Novo cadastro"}
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.045em]">
          {entityId
            ? `Editar ${definition.singular.toLowerCase()}`
            : `Novo ${definition.singular.toLowerCase()}`}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Preencha os campos obrigatórios e salve para concluir.
        </p>
      </header>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="mt-6 flex min-h-64 items-center justify-center gap-2 rounded-2xl border bg-white text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Carregando formulário...
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="liquid-glass mt-6 rounded-3xl p-5 shadow-xl shadow-black/5 sm:p-8"
        >
          {definition.resource === "books" ? (
            <BookFields book={book} options={options} />
          ) : (
            <NamedFields
              entity={named}
              showMargin={definition.resource === "precification-groups"}
            />
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Link
              href={catalogListPath(definition.resource)}
              className={buttonVariants({ variant: "outline" })}
            >
              Cancelar
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="animate-spin" />
              ) : entityId ? (
                <Save />
              ) : (
                <Check />
              )}
              {isSaving ? "Salvando..." : "Salvar cadastro"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function NamedFields({
  entity,
  showMargin,
}: {
  entity: NamedEntity | null;
  showMargin: boolean;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className={showMargin ? "" : "sm:col-span-2"}>
        <FormField
          id="name"
          name="name"
          label="Nome"
          defaultValue={entity?.name}
          required
        />
      </div>
      {showMargin && (
        <FormField
          id="profitMarginPercentage"
          name="profitMarginPercentage"
          label="Margem de lucro (%)"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={(entity as PrecificationGroup | null)?.profitMarginPercentage}
          required
        />
      )}
    </div>
  );
}

function BookFields({ book, options }: { book: Book | null; options: BookOptions }) {
  return (
    <div className="grid gap-8">
      <FormSection title="Identificação">
        <FormField
          id="title"
          name="title"
          label="Título"
          defaultValue={book?.title}
          required
        />
        <FormField
          id="code"
          name="code"
          label="Código"
          defaultValue={book?.code}
          required
        />
        <FormField
          id="isbn"
          name="isbn"
          label="ISBN"
          defaultValue={book?.isbn}
          required
        />
        <FormField
          id="barcode"
          name="barcode"
          label="Código de barras"
          defaultValue={book?.barcode}
          required
        />
        <FormField
          id="year"
          name="year"
          label="Ano"
          type="number"
          min="1"
          defaultValue={book?.year}
          required
        />
        <FormField
          id="edition"
          name="edition"
          label="Edição"
          defaultValue={book?.edition}
          required
        />
        <FormField
          id="numberOfPages"
          name="numberOfPages"
          label="Número de páginas"
          type="number"
          min="1"
          defaultValue={book?.numberOfPages}
          required
        />
        <SelectField
          name="precificationGroupId"
          label="Grupo de precificação"
          defaultValue={book?.precificationGroup.id}
          options={options.groups}
        />
      </FormSection>

      <FormSection title="Dimensões">
        <FormField
          id="height"
          name="height"
          label="Altura (cm)"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={book?.dimensions.height}
          required
        />
        <FormField
          id="width"
          name="width"
          label="Largura (cm)"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={book?.dimensions.width}
          required
        />
        <FormField
          id="depth"
          name="depth"
          label="Profundidade (cm)"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={book?.dimensions.depth}
          required
        />
        <FormField
          id="weight"
          name="weight"
          label="Peso (kg)"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={book?.dimensions.weight}
          required
        />
      </FormSection>

      <div>
        <Label htmlFor="synopsis">Sinopse</Label>
        <textarea
          id="synopsis"
          name="synopsis"
          defaultValue={book?.synopsis}
          required
          rows={5}
          className="mt-2 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <FormSection title="Relacionamentos">
        <RelationField
          name="authors"
          label="Autores"
          options={options.authors}
          selected={book?.authors ?? []}
        />
        <RelationField
          name="categories"
          label="Categorias"
          options={options.categories}
          selected={book?.categories ?? []}
        />
        <RelationField
          name="editors"
          label="Editoras"
          options={options.editors}
          selected={book?.editors ?? []}
        />
      </FormSection>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-4 font-heading text-xl font-semibold">{title}</legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: number;
  options: NamedEntity[];
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        required
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function RelationField({
  name,
  label,
  options,
  selected,
}: {
  name: BookRelation;
  label: string;
  options: NamedEntity[];
  selected: NamedEntity[];
}) {
  return (
    <fieldset className="rounded-xl border bg-muted/20 p-4">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <div className="mt-2 grid gap-2">
        {options.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum cadastro disponível.</p>
        ) : (
          options.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={name}
                value={option.id}
                defaultChecked={selected.some((item) => item.id === option.id)}
                className="size-4 accent-[#eb0907]"
              />
              {option.name}
            </label>
          ))
        )}
      </div>
    </fieldset>
  );
}

function payloadFrom(
  form: FormData,
  resource: CatalogResourceDefinition["resource"],
): CatalogPayload {
  if (resource !== "books") {
    return {
      name: String(form.get("name") ?? ""),
      ...(resource === "precification-groups"
        ? { profitMarginPercentage: Number(form.get("profitMarginPercentage")) }
        : {}),
    };
  }
  return {
    code: String(form.get("code") ?? ""),
    year: Number(form.get("year")),
    title: String(form.get("title") ?? ""),
    edition: String(form.get("edition") ?? ""),
    isbn: String(form.get("isbn") ?? ""),
    numberOfPages: Number(form.get("numberOfPages")),
    synopsis: String(form.get("synopsis") ?? ""),
    dimensions: {
      height: Number(form.get("height")),
      width: Number(form.get("width")),
      weight: Number(form.get("weight")),
      depth: Number(form.get("depth")),
    },
    precificationGroupId: Number(form.get("precificationGroupId")),
    barcode: String(form.get("barcode") ?? ""),
  };
}

function messageFrom(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Não foi possível salvar o cadastro.";
}
