"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { BarChart3, ShoppingCart, UsersRound } from "lucide-react";

import { BrandMark } from "@/presentation/components/atoms/brand-mark";

export function OperationShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="border-b border-white/15 bg-[linear-gradient(160deg,rgba(15,0,0,.96),rgba(89,32,31,.92))] px-4 py-4 text-white shadow-2xl backdrop-blur-2xl lg:sticky lg:top-0 lg:m-3 lg:h-[calc(100svh-24px)] lg:rounded-[2rem] lg:border lg:px-5 lg:py-6">
        <div className="flex items-center justify-between lg:block">
          <BrandMark inverse />
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 backdrop-blur-xl lg:mt-6 lg:inline-flex">
            Console administrativo
          </span>
        </div>

        <nav className="mt-5 flex gap-1.5 overflow-x-auto border-t border-white/10 pt-4 lg:mt-8 lg:grid lg:overflow-visible">
          <Link
            href="/admin/customers"
            className="flex shrink-0 items-center gap-3 rounded-2xl px-3.5 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <UsersRound className="size-4 text-[#eb0907]" />
            Clientes
          </Link>
          <Link
            href="/admin/sales"
            className="flex shrink-0 items-center gap-3 rounded-2xl px-3.5 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <ShoppingCart className="size-4 text-[#eb0907]" />
            Vendas e trocas
          </Link>
          <Link
            href="/admin/analysis"
            className="flex shrink-0 items-center gap-3 rounded-2xl px-3.5 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <BarChart3 className="size-4 text-[#eb0907]" />
            Análise
          </Link>
        </nav>

        <div className="mt-6 border-t border-white/10 pt-5 lg:absolute lg:bottom-6 lg:left-5 lg:right-5">
          <Link
            href="/"
            className="block rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            Sair
          </Link>
        </div>
      </aside>

      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
        {children}
      </main>
    </div>
  );
}
