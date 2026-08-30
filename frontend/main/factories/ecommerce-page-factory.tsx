"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, ShieldCheck, Truck } from "lucide-react";

import type { StoreProduct } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";
import { RecommendationStrip } from "@/presentation/components/molecules/recommendation-strip";

export function EcommercePageFactory() {
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [recommendations, setRecommendations] = useState<StoreProduct[]>([]);

  useEffect(() => {
    async function load() {
      setRecommendations(await gateway.publicRecommendations("HOME"));
    }
    void load();
  }, [gateway]);

  return (
    <div className="p-3 sm:p-5">
      <section className="relative overflow-hidden bg-[#0f0000] px-7 py-14 text-white sm:px-12 lg:py-20">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,#eb090744,transparent_65%)]" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c6c9c9]">
            Ofertas para cada capítulo
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            Livros para descobrir, presentear e guardar.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
            Encontre clássicos, literatura brasileira e novas histórias com entrega
            acompanhada pela Libra.
          </p>
          <Link
            href="/customer/catalog"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#59201f] px-6 py-3 text-sm font-bold text-white hover:bg-[#eb0907]"
          >
            Explorar catálogo
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
      <section className="relative z-10 -mt-4 grid gap-3 md:grid-cols-3">
        <Benefit icon={Truck} title="Entrega acompanhada">
          Acompanhe cada etapa nos seus pedidos.
        </Benefit>
        <Benefit icon={ShieldCheck} title="Pagamento protegido">
          Seus cartões são validados com segurança e exibidos apenas pelos quatro últimos
          dígitos.
        </Benefit>
        <Benefit icon={BookOpen} title="Escolhas para você">
          Recomendações evoluem com seu histórico.
        </Benefit>
      </section>
      <div className="mt-5">
        <RecommendationStrip title="Destaques para você" products={recommendations} />
      </div>
    </div>
  );
}

function Benefit({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Truck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="bg-white p-5 shadow-sm">
      <Icon className="size-5 text-[#eb0907]" />
      <h2 className="mt-3 font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </article>
  );
}
