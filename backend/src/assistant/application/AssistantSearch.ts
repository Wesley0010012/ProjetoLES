export function normalizeAssistantText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR');
}

const stopWords = new Set(
  'para como uma umas uns que quem qual quais quando onde porque por com sem sobre pelo pela pelos pelas esse essa isso isto esta este esses essas estas estes quero gostaria pode podem poderia tenho tem seja ser foi sera mais menos muito minha meu seus suas voce voces fazer saber favor ainda tambem'.split(
    ' ',
  ),
);

export function assistantTerms(value: string): string[] {
  return [
    ...new Set(normalizeAssistantText(value).match(/[a-z0-9]+/g) ?? []),
  ].filter((word) => word.length >= 3 && !stopWords.has(word));
}

export function asksAboutStore(value: string): boolean {
  return /\b(libra|loja|livros?|catalogo|autores?|autor|isbn|comprar|compra|compras|checkout|carrinho|pedidos?|entrega|entregue|frete|trocas?|devolucao|devolver|cupons?|cupom|desconto|pagamento|pagar|cartao|cartoes|endereco|enderecos|cadastro|cadastrar|conta|senha|login|estoque|precos?|valor|vendas?|cancelar|cancelamento)\b/.test(
    normalizeAssistantText(value),
  );
}

export function asksAboutBooks(value: string): boolean {
  return /\b(livros?|leituras?|ler|recomende|recomendacao|recomendacoes|indique|indicacao|indicacoes|autores?|autor|isbn|catalogo)\b/.test(
    normalizeAssistantText(value),
  );
}
