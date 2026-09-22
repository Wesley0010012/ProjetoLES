"use client";
import { CustomerAddressTypeEnum } from "@/domain/models/customer";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, LockKeyhole, MapPin, Plus } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  CustomerCart,
  CustomerCoupon,
  SelfProfile,
} from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";

export function CustomerCheckout() {
  const router = useRouter();
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [cart, setCart] = useState<CustomerCart | null>(null);
  const [coupons, setCoupons] = useState<CustomerCoupon[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [cardAmounts, setCardAmounts] = useState<Record<number, number>>({});
  // Texto em edição de cada cartão; formatado apenas ao sair do campo para não
  // reposicionar o cursor a cada tecla.
  const [amountDrafts, setAmountDrafts] = useState<Record<number, string>>({});

  function toggleCoupon(coupon: CustomerCoupon, checked: boolean) {
    setSelectedCoupons((current) => {
      if (!checked) return current.filter((code) => code !== coupon.code);
      if (coupon.type === "PROMOTIONAL") {
        const promotionalCodes = new Set(
          coupons.filter((item) => item.type === "PROMOTIONAL").map((item) => item.code),
        );
        return [...current.filter((code) => !promotionalCodes.has(code)), coupon.code];
      }
      return current.includes(coupon.code) ? current : [...current, coupon.code];
    });
  }

  function toggleCard(cardId: number, checked: boolean) {
    if (checked && selectedCards.length > 0) {
      setCardAmounts((current) => ({ ...current, [cardId]: 10 }));
    }
    setSelectedCards((current) =>
      checked
        ? current.includes(cardId)
          ? current
          : [...current, cardId]
        : current.filter((id) => id !== cardId),
    );
    if (!checked) {
      setCardAmounts((current) => {
        const next = { ...current };
        delete next[cardId];
        return next;
      });
    }
    clearAmountDraft(cardId);
    setError(null);
  }

  function clearAmountDraft(cardId: number) {
    setAmountDrafts((current) => {
      if (!(cardId in current)) return current;
      const next = { ...current };
      delete next[cardId];
      return next;
    });
  }

  useEffect(() => {
    async function initialize() {
      try {
        const [profileValue, cartValue, couponItems] = await Promise.all([
          gateway.profile(),
          gateway.cart(),
          gateway.coupons(),
        ]);
        if (!profileValue.complete) {
          router.replace("/customer/complete-profile");
          return;
        }
        if (cartValue.items.length === 0) {
          router.replace("/customer/cart");
          return;
        }
        setProfile(profileValue);
        setCart(cartValue);
        setCoupons(couponItems);
        if (profileValue.cards?.[0]) setSelectedCards([profileValue.cards[0].id]);
      } catch (cause) {
        setError(messageFrom(cause));
      }
    }
    void initialize();
  }, [gateway, router]);

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (error && !cart) return <p role="alert" className="p-6 text-destructive">{error}</p>;
  if (!profile || !cart) return;
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const couponCodes = selectedCoupons;
    const cards = (profile.cards ?? []).filter((card) => selectedCards.includes(card.id));
    if (payableTotal > 0 && cards.length === 0) {
      setError("Selecione ao menos um cartão para pagamento.");
      setSaving(false);
      return;
    }
    const primaryCardId = selectedCards[0];
    const additionalTotal = selectedCards
      .slice(1)
      .reduce((sum, cardId) => sum + Number(cardAmounts[cardId] ?? 0), 0);
    const primaryAmount = Math.round((payableTotal - additionalTotal) * 100) / 100;
    const cardPayments = (payableTotal === 0 ? [] : cards).map((card) => ({
      cardId: card.id,
      amount:
        card.id === primaryCardId ? primaryAmount : Number(cardAmounts[card.id] ?? 0),
    }));
    if (cardPayments.some((item) => item.amount <= 0)) {
      setError("Informe um valor maior que zero em cada cartão selecionado.");
      setSaving(false);
      return;
    }
    const allocated =
      Math.round(cardPayments.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
    if (allocated !== payableTotal) {
      setError(
        `Distribua exatamente ${money(payableTotal)} entre os cartões selecionados.`,
      );
      setSaving(false);
      return;
    }
    const paymentsBelowMinimum = cardPayments.filter((item) => item.amount < 10);
    const residualCouponPayment =
      discount > 0 &&
      paymentsBelowMinimum.length === 1 &&
      paymentsBelowMinimum[0].cardId === primaryCardId;
    if (cards.length > 1 && paymentsBelowMinimum.length > 0 && !residualCouponPayment) {
      setError("Ao utilizar vários cartões, informe ao menos R$ 10,00 em cada um.");
      setSaving(false);
      return;
    }
    try {
      const result = await gateway.checkout({
        addressId: Number(form.get("addressId")),
        couponCodes,
        cardPayments,
      });
      router.replace(`/customer/orders?completed=${String(result.code ?? "")}`);
    } catch (cause) {
      setError(messageFrom(cause));
      setSaving(false);
    }
  }

  if (error && !cart) return <p role="alert" className="p-6 text-destructive">{error}</p>;
  if (!profile || !cart)
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  const total = cart.subtotal + cart.estimatedFreight;
  const discount = couponDiscount(
    total,
    coupons.filter((coupon) => selectedCoupons.includes(coupon.code)),
  );
  const payableTotal = Math.max(0, Math.round((total - discount) * 100) / 100);
  const primaryCardId = selectedCards[0];
  const additionalCardsTotal = selectedCards
    .slice(1)
    .reduce((sum, cardId) => sum + Number(cardAmounts[cardId] ?? 0), 0);
  const primaryCardAmount = Math.max(
    0,
    Math.round((payableTotal - additionalCardsTotal) * 100) / 100,
  );
  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Finalizar pedido</h1>
        <span className="flex items-center gap-1 text-xs text-[#007600]">
          <LockKeyhole className="size-4" />
          Checkout seguro
        </span>
      </div>
      {error && <p className="mb-4 bg-white p-4 text-sm text-destructive">{error}</p>}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <form id="checkout-form" onSubmit={checkout} className="grid gap-4">
          <Section icon={MapPin} title="1. Endereço de entrega">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Selecione onde deseja receber este pedido.
              </p>
              <Link
                href="/customer/checkout/address/new"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Plus /> Novo endereço
              </Link>
            </div>
            {profile.addresses
              ?.filter((address) => address.type === CustomerAddressTypeEnum.Delivery)
              .map((address, index) => (
                <label key={address.id} className="flex gap-3 border-t py-3 text-sm">
                  <input
                    type="radio"
                    name="addressId"
                    value={address.id}
                    defaultChecked={index === 0}
                    required
                  />
                  <span>
                    <strong>{address.name}</strong>
                    <br />
                    {address.street}, {address.number} · {address.city}/{address.state}
                  </span>
                </label>
              ))}
            {(profile.addresses?.filter(
              (address) => address.type === CustomerAddressTypeEnum.Delivery,
            ).length ?? 0) === 0 && (
              <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                Nenhum endereço de entrega cadastrado. Use “Novo endereço” para continuar.
              </p>
            )}
          </Section>
          <Section icon={CreditCard} title="2. Forma de pagamento">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Escolha um ou mais cartões para distribuir o pagamento.
              </p>
              <Link
                href="/customer/checkout/card/new"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Plus /> Novo cartão
              </Link>
            </div>
            {(profile.cards ?? []).map((card) => {
              const selected = selectedCards.includes(card.id);
              const primary = selected && card.id === primaryCardId;
              const amount = !selected
                ? 0
                : primary
                  ? primaryCardAmount
                  : Number(cardAmounts[card.id] ?? 0);
              return (
                <div
                  key={card.id}
                  className="grid items-center gap-3 border-t py-3 sm:grid-cols-[1fr_180px]"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => toggleCard(card.id, event.target.checked)}
                    />
                    <span>
                      <strong>
                        {card.brand} •••• {card.lastFourDigits}
                      </strong>
                      {primary && (
                        <small className="ml-2 rounded-full bg-[#59201f]/10 px-2 py-0.5 text-[#59201f]">
                          Principal
                        </small>
                      )}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {card.printedName}
                      </span>
                    </span>
                  </label>
                  <label className="text-xs">
                    {primary ? "Saldo restante neste cartão" : "Valor neste cartão"}
                    <Input
                      type="text"
                      inputMode="decimal"
                      disabled={!selected || primary}
                      value={
                        selected && !primary && card.id in amountDrafts
                          ? amountDrafts[card.id]
                          : decimalMoney(amount)
                      }
                      onFocus={(event) => event.currentTarget.select()}
                      onBlur={() => clearAmountDraft(card.id)}
                      onChange={(event) => {
                        const value = event.target.value;
                        setAmountDrafts((current) => ({ ...current, [card.id]: value }));
                        setCardAmounts((current) => ({
                          ...current,
                          [card.id]: parseMoney(value),
                        }));
                        setError(null);
                      }}
                    />
                  </label>
                </div>
              );
            })}
            {(profile.cards?.length ?? 0) === 0 && (
              <p className="text-sm text-[#b12704]">
                Nenhum cartão cadastrado. Use “Novo cartão” para continuar.
              </p>
            )}
            {selectedCards.length > 1 && (
              <p className="rounded border border-[#59201f]/15 bg-[#faf8f3] p-3 text-xs text-muted-foreground">
                Digite somente os valores dos cartões adicionais. O saldo do cartão
                principal é recalculado automaticamente.
              </p>
            )}
            <div className="mt-4 border-t pt-4">
              <Label>Selecionar cupons promocionais ou de troca</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Você pode combinar vários cupons de troca com apenas um promocional.
              </p>
              {coupons.map((coupon) => (
                <label
                  key={coupon.code}
                  className="mt-2 flex items-center gap-3 rounded border p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedCoupons.includes(coupon.code)}
                    onChange={(event) => toggleCoupon(coupon, event.target.checked)}
                  />
                  <span>
                    <strong>{coupon.code}</strong>
                    <small className="block text-muted-foreground">
                      {coupon.type === "EXCHANGE" ? "Troca" : "Promocional"} ·{" "}
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.value}%`
                        : money(coupon.value)}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          </Section>
        </form>
        <aside className="h-fit bg-white p-5">
          <Button
            form="checkout-form"
            type="submit"
            disabled={saving || (payableTotal > 0 && !profile.cards?.length)}
            className="w-full rounded-full bg-[#59201f] text-white hover:bg-[#eb0907]"
          >
            {saving && <Loader2 className="animate-spin" />}Confirmar pedido
          </Button>
          <div className="my-4 border-t" />
          <p className="flex justify-between text-sm">
            <span>Itens</span>
            <span>{money(cart.subtotal)}</span>
          </p>
          <p className="mt-2 flex justify-between text-sm">
            <span>Frete</span>
            <span>{money(cart.estimatedFreight)}</span>
          </p>
          {discount > 0 && (
            <p className="mt-2 flex justify-between text-sm text-[#007600]">
              <span>Cupons</span>
              <span>− {money(discount)}</span>
            </p>
          )}
          <p className="mt-4 flex justify-between border-t pt-4 text-lg font-bold text-[#b12704]">
            <span>Total</span>
            <span>{money(payableTotal)}</span>
          </p>
          {selectedCards.length > 1 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Mínimo de R$ 10,00 por cartão. Um valor residual menor é aceito quando
              houver cupons.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white p-5">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
        <Icon className="size-5 text-[#eb0907]" />
        {title}
      </h2>
      {children}
    </section>
  );
}
function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
}
function decimalMoney(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function parseMoney(value: string) {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100) / 100) : 0;
}
function messageFrom(cause: unknown) {
  return cause instanceof Error ? cause.message : "Não foi possível concluir o pedido.";
}
function couponDiscount(total: number, selected: CustomerCoupon[]) {
  return Math.min(
    total,
    selected.reduce(
      (sum, coupon) =>
        sum +
        (coupon.discountType === "PERCENTAGE"
          ? (total * coupon.value) / 100
          : coupon.value),
      0,
    ),
  );
}
