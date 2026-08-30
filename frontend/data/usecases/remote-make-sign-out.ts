import type { MakeSignOut } from "@/domain/usecases/make-sign-out";
import { getBackendErrorMessage } from "@/data/http/get-backend-error-message";

export class RemoteMakeSignOut implements MakeSignOut {
  public constructor(private readonly apiUrl: string) {}

  public async execute(token: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/auth/sign-out`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        await getBackendErrorMessage(response, "Não foi possível encerrar a sessão."),
      );
    }
  }
}
