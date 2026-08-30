"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Search, ShoppingCart, UserRound } from "lucide-react";

import { BrandMark } from "@/presentation/components/atoms/brand-mark";
import { AiAssistant } from "@/presentation/components/organisms/ai-assistant";

export function StorefrontShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function search(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    router.push(
      value
        ? `/customer/catalog?query=${encodeURIComponent(value)}`
        : "/customer/catalog",
    );
  }

  return (
    <div className="min-h-svh text-foreground">
      <header className="sticky top-0 z-40 px-3 pt-3">
        <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[1.75rem] border border-white/20 bg-[linear-gradient(135deg,rgba(15,0,0,.96),rgba(89,32,31,.92))] text-white shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto flex items-center gap-2.5 px-4 py-2.5 sm:gap-3">
            <Link
              href="/customer"
              className="shrink-0 rounded-xl p-1 transition hover:bg-white/10"
            >
              <BrandMark inverse />
            </Link>
            <form
              onSubmit={search}
              className="flex min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-lg transition focus-within:ring-4 focus-within:ring-[#d47b2e]/30"
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 min-w-0 flex-1 bg-transparent px-4 text-sm text-[#18212f] outline-none sm:h-11"
                placeholder="Buscar por título, autor, ISBN ou categoria"
                aria-label="Buscar livros"
              />
              <button
                className="m-1 flex w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#8f2d2c] to-[#59201f] text-white transition hover:brightness-110"
                aria-label="Buscar"
              >
                <Search className="size-5" />
              </button>
            </form>
            <Link
              href="/customer/account"
              className="hidden rounded-xl px-2 py-1 text-xs leading-tight transition hover:bg-white/10 sm:block"
            >
              Olá, leitor
              <br />
              <strong>Conta e perfil</strong>
            </Link>
            <Link
              href="/customer/orders"
              className="hidden rounded-xl px-2 py-1 text-xs leading-tight transition hover:bg-white/10 lg:block"
            >
              Devoluções
              <br />
              <strong>e Pedidos</strong>
            </Link>
            <Link
              href="/customer/coupons"
              className="hidden rounded-xl px-2 py-1 text-xs leading-tight transition hover:bg-white/10 lg:block"
            >
              Meus
              <br />
              <strong>Cupons</strong>
            </Link>
            <Link
              href="/customer/cart"
              className="flex items-end gap-1 rounded-xl p-2 transition hover:bg-white/10"
            >
              <ShoppingCart className="size-7 text-[#eb0907]" />
              <strong className="hidden text-xs sm:block">Carrinho</strong>
            </Link>
          </div>
        </div>
        <nav className="mx-auto max-w-[1500px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#3b1717] text-white shadow-lg">
          <div className="flex min-h-10 items-center gap-1 overflow-x-auto px-3 py-1.5 text-xs sm:px-4 sm:text-sm">
            <Link
              href="/customer/catalog"
              className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 font-medium transition hover:bg-white/25 sm:px-4"
            >
              Todos os livros
            </Link>
            {topCategoryLinks.map((category) => (
              <Link
                key={category}
                href={`/customer/catalog?category=${encodeURIComponent(category)}`}
                className="shrink-0 rounded-full px-3 py-1.5 text-white/80 transition hover:bg-white/10 hover:text-white sm:px-4"
              >
                {category}
              </Link>
            ))}
            <Link
              href="/customer/account"
              className="ml-auto flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 hover:bg-white/10 sm:hidden"
            >
              <UserRound className="size-4" />
              Conta
            </Link>
            <Link
              href="/"
              className="shrink-0 rounded-full px-3 py-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Sair
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto min-h-[calc(100svh-180px)] max-w-[1500px]">
        {children}
      </main>
      <footer className="mx-3 mb-3 mt-12 rounded-[1.75rem] border border-white/15 bg-[linear-gradient(135deg,rgba(15,0,0,.96),rgba(89,32,31,.92))] px-6 py-10 text-center text-xs text-white/60 shadow-xl">
        © 2026 Libra · Histórias no seu equilíbrio
      </footer>
      <AiAssistant />
    </div>
  );
}

const topCategoryLinks = [
  "Arquitetura de software",
  "Xadrez",
  "Xadrez Posicional",
  "Terror",
  "Romance",
  "Física Nuclear",
  "Química Orgânica",
  "Matemática Aplicada",
];
