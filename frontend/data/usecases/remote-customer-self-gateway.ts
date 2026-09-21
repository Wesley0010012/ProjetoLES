import { requestJson } from "@/data/http/request-json";
import { getPrototypeUser } from "@/data/auth/get-prototype-user";
import type { SelfProfile } from "@/domain/models/storefront";
import type { StorefrontGateway } from "@/domain/usecases/storefront-gateway";

export type CustomerSelfGateway = Pick<
  StorefrontGateway,
  | "profile"
  | "completeProfile"
  | "updateProfile"
  | "inactivateProfile"
  | "addAddress"
  | "updateAddress"
  | "deleteAddress"
  | "addCard"
  | "updateCard"
  | "deleteCard"
>;
export class RemoteCustomerSelfGateway implements CustomerSelfGateway {
  public constructor(
    private readonly apiUrl: string,
    private readonly resolveUserId: () => Promise<number | undefined> = async () =>
      (await getPrototypeUser()).userId,
  ) {}
  public async profile(): Promise<SelfProfile> {
    return this.request(await this.profilePath());
  }
  public async completeProfile(payload: Record<string, unknown>): Promise<void> {
    await this.request(await this.profilePath(), {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  public async updateProfile(payload: Record<string, unknown>): Promise<void> {
    const profile = await this.profile();
    const customer = this.requireCustomer(profile);
    await this.request(await this.profilePath(), {
      method: "PUT",
      body: JSON.stringify({
        name: customer.name,
        gender: customer.gender,
        birthDate: customer.birthDate,
        document: customer.document,
        email: customer.email,
        phoneType: customer.phone.type,
        ...payload,
        phoneDdd: payload.ddd ?? customer.phone.ddd,
        phoneNumber: payload.phone ?? customer.phone.number,
      }),
    });
  }
  public async inactivateProfile(): Promise<void> {
    await this.request(await this.profilePath(), { method: "DELETE" });
  }
  public async addAddress(payload: Record<string, unknown>): Promise<void> {
    await this.request(`${await this.profilePath()}/addresses`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  public async updateAddress(
    id: number,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.request(`${await this.profilePath()}/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }
  public async deleteAddress(id: number): Promise<void> {
    await this.request(`${await this.profilePath()}/addresses/${id}`, {
      method: "DELETE",
    });
  }
  public async addCard(payload: Record<string, unknown>): Promise<void> {
    await this.request(`${await this.profilePath()}/cards`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  public async updateCard(id: number, payload: Record<string, unknown>): Promise<void> {
    await this.request(`${await this.profilePath()}/cards/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }
  public async deleteCard(id: number): Promise<void> {
    await this.request(`${await this.profilePath()}/cards/${id}`, { method: "DELETE" });
  }
  private requireCustomer(profile: SelfProfile) {
    if (!profile.complete || !profile.customer)
      throw new Error("Complete seu cadastro antes de continuar.");
    return profile.customer;
  }
  private async profilePath(): Promise<string> {
    const userId = await this.resolveUserId();
    if (!userId || !Number.isSafeInteger(userId) || userId < 1)
      throw new Error("Entre novamente para identificar sua conta.");
    return `/users/${userId}/customer`;
  }
  private request<T>(path: string, init: RequestInit = {}): Promise<T> {
    return requestJson<T>(`${this.apiUrl}${path}`, init, {
      role: "USER",
      errorMessage: "Não foi possível concluir a operação com o cliente.",
    });
  }
}
