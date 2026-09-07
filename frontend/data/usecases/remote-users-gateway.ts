import { getPrototypeUser } from "@/data/auth/get-prototype-user";
import { getBackendErrorMessage } from "@/data/http/get-backend-error-message";
import { validatePassword } from "@/domain/rules/validate-password";

export type PrototypeUser = {
  id: number;
  email: string;
  type: "USER" | "OPERATOR";
  active: boolean;
};

export class RemoteUsersGateway {
  public constructor(private readonly apiUrl: string) {}

  public create(email: string, type: PrototypeUser["type"]): Promise<PrototypeUser> {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify({ email, type }),
    });
  }

  public findById(id: number): Promise<PrototypeUser> {
    return this.request(`/users/${id}`);
  }

  public async changePassword(
    password: string,
    passwordConfirmation: string,
  ): Promise<void> {
    const { userId } = getPrototypeUser();
    if (!userId || !Number.isSafeInteger(userId) || userId < 1) {
      throw new Error(
        "Esta conta ainda não está associada a um usuário do backend. Entre novamente.",
      );
    }
    await this.updatePassword(userId, password, passwordConfirmation);
  }

  public async updatePassword(
    id: number,
    password: string,
    passwordConfirmation: string,
  ): Promise<void> {
    validatePassword(password, passwordConfirmation);
    await this.request(`/users/${id}/password`, {
      method: "PATCH",
      body: JSON.stringify({ password, passwordConfirmation }),
    });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      ...init,
      headers: init.body ? { "Content-Type": "application/json" } : {},
    });
    if (!response.ok)
      throw new Error(
        await getBackendErrorMessage(
          response,
          "Não foi possível concluir a operação com o usuário.",
        ),
      );
    return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  }
}
