import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CouponManagement } from "@/presentation/components/organisms/coupon-management";

export default function CouponsPage() {
  return (
    <div>
      <Link
        href="/admin/sales"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para vendas e trocas
      </Link>
      <header className="border-b pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#eb0907]">
          Operação comercial
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.045em]">
          Cupons
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Crie benefícios e mantenha os cupons disponíveis para os clientes.
        </p>
      </header>
      <CouponManagement />
    </div>
  );
}
