import Link from "next/link";
import { BookOpen, ShieldCheck, ShoppingBag, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <main className="auth-shell">
      <section className="auth-story">
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center gap-3 text-xl font-bold text-white">
            <BookOpen /> LIBRA
          </div>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="w-full max-w-md">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Escolha uma área
          </p>
          <h2 className="mt-3 font-heading text-4xl font-semibold">
            Iniciar demonstração
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Acesse diretamente os fluxos que serão apresentados.
          </p>
          <div className="mt-8 grid gap-3">
            <Link
              href="/sign-up"
              className="flex items-center gap-4 rounded-2xl border border-[#d47b2e]/40 bg-[#fffaf4] p-5 shadow-sm hover:border-[#d47b2e]"
            >
              <UserPlus className="text-[#d47b2e]" />
              <span>
                <strong className="block">Cliente com Criação</strong>
                <small className="text-muted-foreground">
                  Cadastre o acesso e complete o perfil
                </small>
              </span>
            </Link>
            <Link
              href="/customer"
              className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm hover:border-primary"
            >
              <ShoppingBag className="text-primary" />
              <span>
                <strong className="block">Cliente</strong>
                <small className="text-muted-foreground">
                  Compras, conta, pedidos, trocas e cupons
                </small>
              </span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-4 rounded-2xl bg-[#59201f] p-5 text-white shadow-sm hover:bg-[#8f2d2c]"
            >
              <ShieldCheck />
              <span>
                <strong className="block">Administrador</strong>
                <small className="text-white/65">
                  Clientes, pedidos, status e análise
                </small>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
