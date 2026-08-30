import type { Authentication } from "@/domain/models/authentication";
import type { MakeLogin, MakeLoginParams } from "@/domain/usecases/make-login";
import { getBackendErrorMessage } from "@/data/http/get-backend-error-message";

type SignInResponse = {
  token: string;
  expiresAt: string;
};

export class RemoteMakeLogin implements MakeLogin {
  public constructor(private readonly apiUrl: string) {}

  public async execute(params: MakeLoginParams): Promise<Authentication> {
    const response = await fetch(`${this.apiUrl}/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(
        await getBackendErrorMessage(
          response,
          "Não foi possível entrar. Tente novamente.",
        ),
      );
    }

    const authentication = (await response.json()) as SignInResponse;

    return {
      token: authentication.token,
      expiresAt: new Date(authentication.expiresAt),
    };
  }
}
