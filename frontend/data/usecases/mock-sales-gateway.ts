import type {
  Coupon,
  CouponPayload,
  Exchange,
  Sale,
  SalesSeries,
} from "@/domain/models/sales";
import type { SalesGateway } from "@/domain/usecases/sales-gateway";

const sales: Sale[] = [
  {
    id: 1,
    code: "VEN-000001",
    customer: { id: 1, code: "CLI-000001", name: "Henry Townshend" },
    items: [
      {
        bookId: 1,
        code: "LIB-0001",
        title: "Clean Code",
        quantity: 2,
        unitPrice: 41.6,
        total: 83.2,
      },
    ],
    status: "ENTREGUE",
    saleDate: "2026-02-10T14:30:00.000Z",
    freight: 12,
    total: 95.2,
    deliveryAddress: "Rua da Arquitetura, 42 · São Paulo/SP",
    coupons: [],
    payments: [{ label: "VISA •••• 4242", amount: 95.2 }],
  },
  {
    id: 2,
    code: "VEN-000002",
    customer: { id: 2, code: "CLI-000002", name: "Ada Lovelace" },
    items: [
      {
        bookId: 2,
        code: "LIB-0002",
        title: "Domain-Driven Design",
        quantity: 1,
        unitPrice: 49.4,
        total: 49.4,
      },
    ],
    status: "EM ABERTO",
    saleDate: "2026-03-04T10:15:00.000Z",
    freight: 10,
    total: 59.4,
  },
  {
    id: 3,
    code: "VEN-000003",
    customer: { id: 3, code: "CLI-000003", name: "Alan Turing" },
    items: [
      {
        bookId: 3,
        code: "LIB-0003",
        title: "The Pragmatic Programmer",
        quantity: 3,
        unitPrice: 28.8,
        total: 86.4,
      },
    ],
    status: "EM PROCESSAMENTO",
    saleDate: "2026-04-18T18:00:00.000Z",
    freight: 14,
    total: 100.4,
  },
  {
    id: 4,
    code: "VEN-000004",
    customer: { id: 4, code: "CLI-000004", name: "Grace Hopper" },
    items: [
      {
        bookId: 1,
        code: "LIB-0001",
        title: "Clean Code",
        quantity: 1,
        unitPrice: 41.6,
        total: 41.6,
      },
    ],
    status: "PAGAMENTO REALIZADO",
    saleDate: "2026-05-02T12:00:00.000Z",
    freight: 12,
    total: 53.6,
  },
  {
    id: 5,
    code: "VEN-000005",
    customer: { id: 5, code: "CLI-000005", name: "Margaret Hamilton" },
    items: [
      {
        bookId: 2,
        code: "LIB-0002",
        title: "Domain-Driven Design",
        quantity: 1,
        unitPrice: 49.4,
        total: 49.4,
      },
    ],
    status: "EM TRÂNSITO",
    saleDate: "2026-05-07T12:00:00.000Z",
    freight: 10,
    total: 59.4,
  },
];
const exchanges: Exchange[] = [
  {
    id: 1,
    code: "TRO-000001",
    saleId: 1,
    saleCode: "VEN-000001",
    customer: "Henry Townshend",
    items: [{ bookId: 1, title: "Clean Code", quantity: 1, unitPrice: 41.6 }],
    status: "TROCA SOLICITADA",
    requestedAt: "2026-05-27T11:00:00.000Z",
    total: 41.6,
    reason: "Produto com defeito",
  },
  {
    id: 2,
    code: "TRO-000002",
    saleId: 2,
    saleCode: "VEN-000002",
    customer: "Ada Lovelace",
    items: [{ bookId: 2, title: "Domain-Driven Design", quantity: 1, unitPrice: 49.4 }],
    status: "ITEM ENVIADO",
    requestedAt: "2026-06-02T11:00:00.000Z",
    total: 49.4,
  },
  {
    id: 3,
    code: "TRO-000003",
    saleId: 3,
    saleCode: "VEN-000003",
    customer: "Alan Turing",
    items: [
      { bookId: 3, title: "The Pragmatic Programmer", quantity: 1, unitPrice: 28.8 },
    ],
    status: "ITEM RECEBIDO",
    requestedAt: "2026-06-04T11:00:00.000Z",
    total: 28.8,
  },
];
const coupons: Coupon[] = [
  {
    id: 1,
    code: "LIBRA10",
    type: "PROMOTIONAL",
    discountType: "PERCENTAGE",
    value: 10,
    singleUse: false,
    used: false,
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

export class MockSalesGateway implements SalesGateway {
  public async list(): Promise<Sale[]> {
    return [...sales];
  }
  public async listByCustomer(id: number): Promise<Sale[]> {
    return sales.filter((sale) => sale.customer.id === id);
  }
  public async dispatch(id: number): Promise<void> {
    this.sale(id).status = "EM_TRANSPORTE";
  }
  public async deliver(id: number): Promise<void> {
    this.sale(id).status = "ENTREGUE";
  }
  public async exchanges(): Promise<Exchange[]> {
    return [...exchanges];
  }
  public async authorizeExchange(id: number, observation: string): Promise<void> {
    const exchange = this.exchange(id);
    exchange.status = "TROCA_AUTORIZADA";
    exchange.reviewObservation = observation;
  }
  public async rejectExchange(id: number, observation: string): Promise<void> {
    const exchange = this.exchange(id);
    exchange.status = "TROCA_NEGADA";
    exchange.reviewObservation = observation;
  }
  public async receiveExchange(
    id: number,
    returnToStock: boolean,
  ): Promise<{ code: string; value: number }> {
    const exchange = this.exchange(id);
    exchange.status = "TROCADO";
    exchange.returnToStock = returnToStock;
    const couponId = Math.max(0, ...coupons.map((coupon) => coupon.id)) + 1;
    exchange.coupon = {
      code: `TROCA-${String(couponId).padStart(6, "0")}`,
      value: exchange.total,
    };
    coupons.push({
      id: couponId,
      code: exchange.coupon.code,
      type: "EXCHANGE",
      discountType: "FIXED",
      value: exchange.total,
      singleUse: true,
      used: false,
      active: true,
      createdAt: new Date().toISOString(),
    });
    return exchange.coupon;
  }
  public async analyze(
    startDate: string,
    endDate: string,
    groupBy: "PRODUCT" | "CATEGORY",
  ): Promise<SalesSeries[]> {
    const dates = [
      "2026-02-01",
      "2026-03-01",
      "2026-04-01",
      "2026-05-01",
      "2026-06-01",
      "2026-07-01",
      "2026-08-01",
    ];
    const values =
      groupBy === "CATEGORY"
        ? [
            {
              name: "Engenharia de software",
              quantities: [18, 24, 21, 31, 35, 42, 48],
              unitProfit: 15.2,
            },
            {
              name: "Arquitetura de software",
              quantities: [11, 15, 19, 17, 25, 29, 34],
              unitProfit: 17.4,
            },
            {
              name: "Programação",
              quantities: [14, 17, 16, 23, 27, 32, 39],
              unitProfit: 11.8,
            },
            {
              name: "Boas práticas",
              quantities: [8, 12, 15, 18, 16, 23, 28],
              unitProfit: 13.6,
            },
          ]
        : [
            {
              name: "Clean Code",
              quantities: [12, 18, 16, 24, 29, 36, 43],
              unitProfit: 14.56,
            },
            {
              name: "Domain-Driven Design",
              quantities: [7, 11, 14, 12, 19, 24, 31],
              unitProfit: 17.29,
            },
            {
              name: "The Pragmatic Programmer",
              quantities: [9, 13, 11, 18, 21, 27, 35],
              unitProfit: 10.08,
            },
          ];
    return values
      .map((series) => ({
        name: series.name,
        points: dates
          .map((date, index) => ({
            date,
            quantity: series.quantities[index],
            profit: Math.round(series.quantities[index] * series.unitProfit * 100) / 100,
          }))
          .filter((point) => point.date >= startDate && point.date <= endDate),
      }))
      .filter((series) => series.points.length > 0);
  }
  public async coupons(): Promise<Coupon[]> {
    return [...coupons];
  }
  public async createCoupon(
    payload: CouponPayload,
  ): Promise<{ id: number; code: string }> {
    const id = Math.max(0, ...coupons.map((coupon) => coupon.id)) + 1;
    const code =
      payload.code?.toUpperCase() ||
      `${payload.type === "EXCHANGE" ? "TROCA" : "PROMO"}-${String(id).padStart(6, "0")}`;
    coupons.push({
      id,
      code,
      ...payload,
      used: false,
      active: true,
      createdAt: new Date().toISOString(),
    });
    return { id, code };
  }
  public async deactivateCoupon(id: number): Promise<void> {
    const coupon = coupons.find((item) => item.id === id);
    if (coupon) coupon.active = false;
  }
  private sale(id: number): Sale {
    const sale = sales.find((item) => item.id === id);
    if (!sale) throw new Error("Venda não encontrada.");
    return sale;
  }
  private exchange(id: number): Exchange {
    const exchange = exchanges.find((item) => item.id === id);
    if (!exchange) throw new Error("Troca não encontrada.");
    return exchange;
  }
}
