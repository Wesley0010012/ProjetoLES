"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle, Loader2, Plus, TicketPercent, Trash2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Coupon } from "@/domain/models/sales";
import { makeSalesGateway } from "@/main/factories/make-sales-gateway";

export function CouponManagement() {
  const gateway = useMemo(() => makeSalesGateway(), []);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [type, setType] = useState<Coupon["type"]>("PROMOTIONAL");
  const [discountType, setDiscountType] = useState<Coupon["discountType"]>("PERCENTAGE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setCoupons(await gateway.coupons());
  }

  useEffect(() => {
    async function initialize() {
      try {
        setCoupons(await gateway.coupons());
      } catch (cause) {
        setError(messageFrom(cause));
      } finally {
        setLoading(false);
      }
    }
    void initialize();
  }, [gateway]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSaving(true);
    setError("");
    setSuccess("");
    const form = new FormData(formElement);
    try {
      const result = await gateway.createCoupon({
        code: optionalText(form, "code"),
        type,
        discountType: type === "EXCHANGE" ? "FIXED" : discountType,
        value: Number(form.get("value")),
        customerId: optionalNumber(form, "customerId"),
        expiresAt: optionalText(form, "expiresAt"),
        singleUse: type === "EXCHANGE" || form.get("singleUse") === "on",
      });
      setSuccess(`Cupom ${result.code} criado com sucesso.`);
      formElement.reset();
      setType("PROMOTIONAL");
      setDiscountType("PERCENTAGE");
      await load();
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id: number) {
    const coupon = coupons.find((item) => item.id === id);
    if (!window.confirm(`Deseja desativar o cupom ${coupon?.code ?? "selecionado"}?`))
      return;
    setError("");
    setSuccess("");
    try {
      await gateway.deactivateCoupon(id);
      await load();
      setSuccess(`Cupom ${coupon?.code ?? "selecionado"} desativado com sucesso.`);
    } catch (cause) {
      setError(messageFrom(cause));
    }
  }

  return (
    <div className="mt-5 grid gap-6 xl:grid-cols-[380px_1fr]">
      <form
        onSubmit={create}
        className="liquid-glass h-fit rounded-3xl p-5 shadow-xl shadow-black/5 sm:p-6"
      >
        <div className="flex items-center gap-2">
          <TicketPercent className="size-5 text-[#eb0907]" />
          <h2 className="font-semibold">Criar cupom</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          O código pode ser informado ou gerado automaticamente.
        </p>
        <div className="mt-5 grid gap-4">
          <Field label="Tipo">
            <select
              value={type}
              onChange={(event) => {
                const value = event.target.value as Coupon["type"];
                setType(value);
                if (value === "EXCHANGE") setDiscountType("FIXED");
              }}
              className="h-9 rounded border bg-white px-3 text-sm"
            >
              <option value="PROMOTIONAL">Promocional</option>
              <option value="EXCHANGE">Troca</option>
            </select>
          </Field>
          <Field label="Código">
            <Input name="code" placeholder="Gerado automaticamente" />
          </Field>
          <Field label="Modalidade do desconto">
            <select
              value={type === "EXCHANGE" ? "FIXED" : discountType}
              onChange={(event) =>
                setDiscountType(event.target.value as Coupon["discountType"])
              }
              disabled={type === "EXCHANGE"}
              className="h-9 rounded border bg-white px-3 text-sm disabled:bg-muted"
            >
              <option value="PERCENTAGE">Percentual</option>
              <option value="FIXED">Valor fixo</option>
            </select>
          </Field>
          <Field
            label={
              discountType === "PERCENTAGE" && type !== "EXCHANGE"
                ? "Percentual (%)"
                : "Valor (R$)"
            }
          >
            <Input
              name="value"
              type="number"
              min="0.01"
              max={discountType === "PERCENTAGE" && type !== "EXCHANGE" ? 100 : undefined}
              step="0.01"
              required
            />
          </Field>
          {type === "EXCHANGE" && (
            <Field label="ID do cliente">
              <Input name="customerId" type="number" min="1" required />
            </Field>
          )}
          <Field label="Validade">
            <Input name="expiresAt" type="date" />
          </Field>
          {type === "PROMOTIONAL" && (
            <label className="flex items-center gap-2 text-sm">
              <input name="singleUse" type="checkbox" className="accent-[#eb0907]" />
              Invalidar após o primeiro uso
            </label>
          )}
          <Button disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Plus />}Criar cupom
          </Button>
        </div>
      </form>

      <section>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {loading ? (
          <div className="grid min-h-56 place-items-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="grid gap-3">
            {coupons.map((coupon) => (
              <article
                key={coupon.id}
                className="grid gap-4 rounded border bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{coupon.code}</strong>
                    <Badge>{coupon.type === "EXCHANGE" ? "Troca" : "Promocional"}</Badge>
                    {coupon.used && <Badge>Utilizado</Badge>}
                    {!coupon.active && <Badge>Inativo</Badge>}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#59201f]">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.value}% de desconto`
                      : money(coupon.value)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {coupon.customer
                      ? `${coupon.customer.name} · ${coupon.customer.code}`
                      : "Disponível para todos os clientes"}{" "}
                    ·{" "}
                    {coupon.expiresAt
                      ? `válido até ${new Date(coupon.expiresAt).toLocaleDateString("pt-BR")}`
                      : "sem vencimento"}{" "}
                    · {coupon.singleUse ? "uso único" : "múltiplos usos"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!coupon.active}
                  onClick={() => void deactivate(coupon.id)}
                >
                  <Trash2 />
                  {coupon.active ? "Desativar" : "Desativado"}
                </Button>
              </article>
            ))}
            {coupons.length === 0 && (
              <div className="grid min-h-48 place-items-center rounded border bg-white text-sm text-muted-foreground">
                Nenhum cupom ativo.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
      {children}
    </span>
  );
}

function optionalText(form: FormData, name: string) {
  const value = String(form.get(name) ?? "").trim();
  return value || undefined;
}

function optionalNumber(form: FormData, name: string) {
  const value = optionalText(form, name);
  return value ? Number(value) : undefined;
}

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function messageFrom(cause: unknown) {
  return cause instanceof Error
    ? cause.message
    : "Não foi possível concluir a operação com o cupom.";
}
