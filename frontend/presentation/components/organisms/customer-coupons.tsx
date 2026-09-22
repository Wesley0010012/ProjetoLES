"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, Loader2, TicketPercent } from "lucide-react";
import type { CustomerCoupon } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";

export function CustomerCoupons() {
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [coupons, setCoupons] = useState<CustomerCoupon[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    gateway
      .coupons()
      .then(setCoupons)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Não foi possível carregar os cupons."))
      .finally(() => setLoading(false));
  }, [gateway]);
  return (
    <div className="p-4">
      <section className="bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#eb0907]">
          Benefícios
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Meus cupons</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Consulte cupons promocionais e créditos recebidos por trocas.
        </p>
        {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
        {!loading && !error && coupons.length === 0 && <p className="mt-4">Nenhum cupom disponível.</p>}
        {loading ? (
          <div className="grid min-h-52 place-items-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {coupons.map((coupon) => (
              <article key={coupon.code} className="rounded-2xl border bg-[#faf8f5] p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#59201f] text-white">
                    {coupon.type === "EXCHANGE" ? <Gift /> : <TicketPercent />}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {coupon.type === "EXCHANGE" ? "Troca" : "Promocional"}
                    </span>
                    <h2 className="text-lg font-bold">{coupon.code}</h2>
                  </div>
                  <strong className="ml-auto text-xl text-[#59201f]">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.value}%`
                      : coupon.value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                  </strong>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{coupon.description}</p>
                <span className="mt-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                  Disponível
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
