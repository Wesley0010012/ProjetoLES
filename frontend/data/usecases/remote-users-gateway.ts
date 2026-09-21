import { requestJson } from "@/data/http/request-json";
import { getPrototypeUser } from "@/data/auth/get-prototype-user";
import { validatePassword } from "@/domain/rules/validate-password";

export type PrototypeUser = {
  id: number;
  email: string;
  type: "USER" | "OPERATOR";
  active: boolean;
};

export class RemoteUsersGateway {
  public constructor(private readonly apiUrl: string) {}

  public findById(id: number): Promise<PrototypeUser> {
    return this.request(`/users/${id}`);
  }

  public async changePassword(
    password: string,
    passwordConfirmation: string,
  ): Promise<void> {
    const { userId } = await getPrototypeUser();
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

  private request<T>(path: string, init: RequestInit = {}): Promise<T> {
    return requestJson<T>(`${this.apiUrl}${path}`, init, {
      role: "USER",
      errorMessage: "Não foi possível concluir a operação com o usuário.",
    });
  }
}
