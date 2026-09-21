"use client";
import { CustomerAddressTypeEnum } from "@/domain/models/customer";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { SelfProfile } from "@/domain/models/storefront";
import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";
import { AccountPageHeader } from "@/presentation/components/molecules/account-page-header";
import { Loading } from "./customer-account";
import { errorMessage, Feedback } from "./customer-personal-data";

export function CustomerAddressList() {
  const gateway = useMemo(() => makeStorefrontGateway(), []);
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [message, setMessage] = useState("");
  async function reload() {
    setProfile(await gateway.profile());
  }
  useEffect(() => {
    gateway
      .profile()
      .then(setProfile)
      .catch((cause) => setMessage(errorMessage(cause)));
  }, [gateway]);
  async function remove(id: number) {
    if (!window.confirm("Deseja excluir este endereço?")) return;
    try {
      await gateway.deleteAddress(id);
      await reload();
      setMessage("Endereço excluído com sucesso.");
    } catch (cause) {
      setMessage(errorMessage(cause));
    }
  }
  if (!profile) return message ? <Feedback message={message} /> : <Loading />;
  return (
    <div className="p-4">
      <AccountPageHeader
        eyebrow="Minha conta"
        title="Meus endereços"
        description="Consulte, edite ou exclua endereços cadastrados. A criação acontece em uma etapa separada."
      />
      {message && <Feedback message={message} />}
      <section className="liquid-glass rounded-3xl p-5 sm:p-7">
        <div className="flex flex-col gap-4 border-b border-white/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Endereços cadastrados</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.addresses?.length ?? 0} registros
            </p>
          </div>
          <Link
            href="/customer/account/addresses/new"
            className={buttonVariants({ className: "h-11 rounded-xl" })}
          >
            <Plus />
            Criar endereço
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {profile.addresses?.map((address) => (
            <article
              key={address.id}
              className={`rounded-2xl border bg-white/75 p-5 shadow-sm ${address.type === CustomerAddressTypeEnum.Primary ? "border-primary/30 ring-2 ring-primary/5" : "border-white"}`}
            >
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{address.name}</strong>
                    {address.type === CustomerAddressTypeEnum.Primary && (
                      <small className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                        Principal
                      </small>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {address.street}, {address.number}
                    <br />
                    {address.city}/{address.state}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-primary">
                    {address.type === CustomerAddressTypeEnum.Primary
                      ? "Residencial · protegido"
                      : [
                          address.type === CustomerAddressTypeEnum.Billing && "Cobrança",
                          address.type === CustomerAddressTypeEnum.Delivery && "Entrega",
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Adicional"}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex gap-2 border-t pt-4">
                <Link
                  href={`/customer/account/addresses/${address.id}/edit`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <Pencil />
                  Editar
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={address.type === CustomerAddressTypeEnum.Primary}
                  title={
                    address.type === CustomerAddressTypeEnum.Primary
                      ? "O endereço principal não pode ser excluído"
                      : undefined
                  }
                  onClick={() => void remove(address.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 />
                  Excluir
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
