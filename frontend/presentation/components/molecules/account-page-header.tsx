import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export function AccountPageHeader({
  eyebrow,
  title,
  description,
  backHref = "/customer/account",
  backLabel = "Voltar para sua conta",
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="mb-5 rounded-2xl bg-white p-6 shadow-sm">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-3.5" />
        {backLabel}
      </Link>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-primary">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-heading text-4xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </header>
  );
}
