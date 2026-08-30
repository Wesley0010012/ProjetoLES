"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";

import { makeStorefrontGateway } from "@/main/factories/make-storefront-gateway";
import type { AssistantChatMessage } from "@/domain/models/storefront";

const gateway = makeStorefrontGateway();
const initialMessage: AssistantChatMessage = {
  role: "assistant",
  content:
    "Olá! Sou a assistente Libra. Posso indicar livros e explicar como funcionam compras, pagamentos, pedidos, trocas e sua conta.",
};
const exampleQuestions = [
  "Indique livros sobre arquitetura de software",
  "Como faço uma compra?",
  "Posso pagar com mais de um cartão?",
  "Como acompanho meu pedido?",
  "Como solicito a troca de um item?",
  "Onde altero os dados da minha conta?",
];

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<AssistantChatMessage[]>([initialMessage]);
  const [products, setProducts] = useState<
    { id: number; title: string; price: number; available: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actions, setActions] = useState<{ label: string; href: string }[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const question = message.trim();
    if (!question || loading) return;
    const history = messages.slice(-8);
    setMessages((current) => [...current, { role: "user", content: question }]);
    setMessage("");
    setError("");
    setActions([]);
    setLoading(true);
    try {
      const response = await gateway.askAssistant(question, history);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.answer },
      ]);
      setProducts(response.products);
      setActions(actionsFor(question));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível falar com a assistente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <section
          className="liquid-glass mb-3 flex h-[min(620px,calc(100svh-110px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-[2rem]"
          aria-label="Assistente Libra"
        >
          <header className="flex items-center gap-3 border-b border-white/10 bg-[linear-gradient(135deg,rgba(15,0,0,.96),rgba(89,32,31,.92))] px-4 py-4 text-white">
            <span className="grid size-10 place-items-center rounded-2xl bg-white/15 text-[#eb0907] shadow-inner">
              <Bot className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">Assistente Libra</h2>
              <p className="text-xs text-white/65">Produtos e ajuda sobre o sistema</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl p-2 hover:bg-white/10"
              aria-label="Fechar assistente"
            >
              <X className="size-5" />
            </button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-white/30 p-4 backdrop-blur-xl">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${item.role === "user" ? "ml-auto bg-gradient-to-br from-[#8f2d2c] to-[#59201f] text-white" : "border border-white/80 bg-white/75 text-[#38322b] backdrop-blur-xl"}`}
              >
                {item.content}
              </div>
            ))}
            {messages.length === 1 && !loading && (
              <div className="rounded-2xl border border-white/80 bg-white/60 p-3 shadow-sm">
                <p className="text-xs font-semibold text-[#59201f]">
                  Exemplos de perguntas
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {exampleQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => setMessage(question)}
                      className="rounded-full border border-[#59201f]/20 bg-white/80 px-3 py-1.5 text-left text-xs text-[#59201f] transition hover:border-[#eb0907] hover:bg-white"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {loading && (
              <div className="flex w-fit items-center gap-2 rounded-2xl bg-white/75 px-3 py-2 text-sm text-[#59201f] shadow-sm">
                <LoaderCircle className="size-4 animate-spin" />
                Consultando a Libra...
              </div>
            )}
            {products.length > 0 && !loading && (
              <div className="grid gap-2">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/customer/products/${product.id}`}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl border border-white/80 bg-white/75 p-3 text-xs shadow-sm transition hover:-translate-y-0.5 hover:border-[#eb0907]"
                  >
                    <strong className="block text-sm text-[#0f0000]">
                      {product.title}
                    </strong>
                    <span className="text-[#59201f]">
                      {product.available
                        ? product.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "Indisponível"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {actions.length > 0 && !loading && (
              <div className="grid gap-2 rounded-2xl border border-white/80 bg-white/60 p-3">
                <p className="text-xs font-semibold text-[#59201f]">Ações relacionadas</p>
                {actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-white/85 px-3 py-2 text-sm font-medium text-[#59201f] transition hover:bg-white"
                  >
                    {action.label}
                    <ArrowRight className="size-4" />
                  </Link>
                ))}
              </div>
            )}
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                {error}
              </p>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={send}
            className="flex gap-2 border-t border-white/70 bg-white/55 p-3 backdrop-blur-xl"
          >
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={1000}
              placeholder="Pergunte sobre um livro ou pedido..."
              className="h-11 min-w-0 flex-1 rounded-xl border border-white bg-white/70 px-3 text-sm shadow-inner outline-none focus:ring-3 focus:ring-[#d47b2e]/20"
              aria-label="Mensagem para a assistente"
            />
            <button
              disabled={loading || !message.trim()}
              className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[#8f2d2c] to-[#59201f] text-white shadow-lg shadow-[#59201f]/20 transition hover:scale-105 disabled:opacity-50"
              aria-label="Enviar mensagem"
            >
              <Send className="size-4" />
            </button>
          </form>
          <p className="bg-white px-3 pb-2 text-center text-[10px] text-black/45">
            A IA pode cometer erros. Confirme dados importantes antes de comprar.
          </p>
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="ml-auto flex size-15 items-center justify-center rounded-[1.4rem] border border-white/50 bg-gradient-to-br from-[#eb0907] to-[#59201f] text-white shadow-xl shadow-[#59201f]/30 ring-4 ring-white/60 transition hover:-translate-y-1 hover:shadow-2xl"
        aria-label={open ? "Fechar assistente" : "Abrir assistente"}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-7" />}
      </button>
    </div>
  );
}

function actionsFor(question: string) {
  const value = question
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
  const actions: { label: string; href: string }[] = [];
  const add = (label: string, href: string) => {
    if (!actions.some((item) => item.href === href)) actions.push({ label, href });
  };
  if (/livro|catalog|recomend|indic|autor|categoria/.test(value))
    add("Explorar catálogo", "/customer/catalog");
  if (/carrinho|comprar|compra|checkout|finalizar/.test(value))
    add("Abrir carrinho", "/customer/cart");
  if (/pedido|entrega|cancel|troca|devolu/.test(value))
    add("Ver pedidos e trocas", "/customer/orders");
  if (/cupom|desconto|credito/.test(value))
    add("Consultar meus cupons", "/customer/coupons");
  if (/endereco/.test(value)) add("Gerenciar endereços", "/customer/account/addresses");
  if (/cartao|pagamento/.test(value)) add("Gerenciar cartões", "/customer/account/cards");
  if (/conta|perfil|dados|senha/.test(value))
    add("Acessar minha conta", "/customer/account");
  return actions.slice(0, 3);
}
