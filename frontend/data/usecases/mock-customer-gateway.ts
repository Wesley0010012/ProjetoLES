import type {
  Customer,
  CustomerAddress,
  CustomerAddressPayload,
  CustomerCard,
  CustomerCardPayload,
  CustomerPayload,
} from "@/domain/models/customer";
import type { CustomerGateway } from "@/domain/usecases/customer-gateway";

const storageKey = "libra.customers.mock";
const seededCustomers: Customer[] = [
  {
    id: 1,
    code: "CLI-000001",
    name: "Henry Townshend",
    gender: "MAN",
    birthDate: "1990-05-15",
    document: "52998224725",
    phone: { type: "MOBILE", ddd: "11", number: "987654321" },
    email: "henry.townshend@libra.com.br",
    active: true,
    createdAt: "2026-01-12T10:00:00.000Z",
    updatedAt: "2026-08-18T14:00:00.000Z",
  },
  {
    id: 2,
    code: "CLI-000002",
    name: "Ada Lovelace",
    gender: "WOMAN",
    birthDate: "1988-12-10",
    document: "39053344705",
    phone: { type: "MOBILE", ddd: "11", number: "976543210" },
    email: "ada.lovelace@libra.com.br",
    active: true,
    createdAt: "2026-02-03T10:00:00.000Z",
    updatedAt: "2026-08-15T14:00:00.000Z",
  },
  {
    id: 3,
    code: "CLI-000003",
    name: "Alan Turing",
    gender: "MAN",
    birthDate: "1985-06-23",
    document: "16899535009",
    phone: { type: "MOBILE", ddd: "21", number: "998765432" },
    email: "alan.turing@libra.com.br",
    active: true,
    createdAt: "2026-03-08T10:00:00.000Z",
    updatedAt: "2026-08-12T14:00:00.000Z",
  },
  {
    id: 4,
    code: "CLI-000004",
    name: "Grace Hopper",
    gender: "WOMAN",
    birthDate: "1992-12-09",
    document: "11144477735",
    phone: { type: "MOBILE", ddd: "31", number: "991234567" },
    email: "grace.hopper@libra.com.br",
    active: true,
    createdAt: "2026-04-14T10:00:00.000Z",
    updatedAt: "2026-08-10T14:00:00.000Z",
  },
  {
    id: 5,
    code: "CLI-000005",
    name: "Margaret Hamilton",
    gender: "WOMAN",
    birthDate: "1987-08-17",
    document: "12345678909",
    phone: { type: "MOBILE", ddd: "41", number: "988776655" },
    email: "margaret.hamilton@libra.com.br",
    active: true,
    createdAt: "2026-05-20T10:00:00.000Z",
    updatedAt: "2026-08-08T14:00:00.000Z",
  },
];

export class MockCustomerGateway implements CustomerGateway {
  private readonly addresses: CustomerAddress[] = [
    {
      id: 1,
      name: "Casa",
      residenceType: "Apartamento",
      streetType: "Rua",
      street: "dos Compiladores",
      number: "302",
      district: "Centro",
      zipCode: "01001000",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      billing: true,
      delivery: true,
    },
  ];
  private readonly cards: CustomerCard[] = [
    {
      id: 1,
      lastFourDigits: "4242",
      printedName: "CLIENTE LIBRA",
      brand: "VISA",
      preferred: true,
    },
  ];
  public async list(): Promise<Customer[]> {
    return this.customers().filter((customer) => customer.active);
  }

  public async findById(id: number): Promise<Customer> {
    const customer = this.customers().find((item) => item.id === id);
    if (!customer) throw new Error("Cliente não encontrado.");
    return customer;
  }

  public async create(payload: CustomerPayload): Promise<Customer> {
    const customers = this.customers();
    const id = Math.max(0, ...customers.map((item) => item.id)) + 1;
    const customer = this.toCustomer(id, payload);
    customers.push(customer);
    this.save(customers);
    return customer;
  }

  public async update(id: number, payload: CustomerPayload): Promise<Customer> {
    const customers = this.customers();
    const index = customers.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Cliente não encontrado.");
    const customer = {
      ...this.toCustomer(id, payload),
      code: customers[index].code,
      createdAt: customers[index].createdAt,
    };
    customers[index] = customer;
    this.save(customers);
    return customer;
  }

  public async delete(id: number): Promise<void> {
    const customers = this.customers();
    const customer = customers.find((item) => item.id === id);
    if (!customer) throw new Error("Cliente não encontrado.");
    customer.active = false;
    customer.updatedAt = new Date().toISOString();
    this.save(customers);
  }

  public async listAddresses(): Promise<CustomerAddress[]> {
    return [...this.addresses];
  }

  public async addAddress(
    _customerId: number,
    payload: CustomerAddressPayload,
  ): Promise<CustomerAddress> {
    const address = { id: this.addresses.length + 1, ...payload };
    this.addresses.push(address);
    return address;
  }
  public async updateAddress(
    _customerId: number,
    id: number,
    payload: CustomerAddressPayload,
  ): Promise<CustomerAddress> {
    const index = this.addresses.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Endereço não encontrado.");
    const address = { id, ...payload };
    this.addresses[index] = address;
    return address;
  }

  public async deleteAddress(_customerId: number, id: number): Promise<void> {
    const index = this.addresses.findIndex((item) => item.id === id);
    if (index >= 0) this.addresses.splice(index, 1);
  }

  public async listCards(): Promise<CustomerCard[]> {
    return [...this.cards];
  }

  public async addCard(
    _customerId: number,
    payload: CustomerCardPayload,
  ): Promise<CustomerCard> {
    const card = {
      id: this.cards.length + 1,
      lastFourDigits: payload.number.slice(-4),
      printedName: payload.printedName,
      brand: payload.brand,
      preferred: payload.preferred,
    };
    this.cards.push(card);
    return card;
  }

  public async deleteCard(_customerId: number, id: number): Promise<void> {
    const index = this.cards.findIndex((item) => item.id === id);
    if (index >= 0) this.cards.splice(index, 1);
  }

  private toCustomer(id: number, payload: CustomerPayload): Customer {
    const now = new Date().toISOString();
    return {
      id,
      code: `CLI-${String(id).padStart(6, "0")}`,
      name: payload.name,
      gender: payload.gender,
      birthDate: payload.birthDate,
      document: payload.document.replace(/\D/g, ""),
      phone: {
        type: payload.phoneType,
        ddd: payload.phoneDdd,
        number: payload.phoneNumber,
      },
      email: payload.email,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  private customers(): Customer[] {
    const serialized = localStorage.getItem(storageKey);
    if (serialized) {
      const stored = JSON.parse(serialized) as Customer[];
      if (stored.length > 0) return stored;
    }
    const initial = seededCustomers.map((customer) => ({
      ...customer,
      phone: { ...customer.phone },
    }));
    this.save(initial);
    return initial;
  }

  private save(customers: Customer[]): void {
    localStorage.setItem(storageKey, JSON.stringify(customers));
  }
}
