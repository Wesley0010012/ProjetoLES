import type { Authentication } from "@/domain/models/authentication";
import type { MakeSignUp, MakeSignUpParams } from "@/domain/usecases/make-sign-up";
import { getBackendErrorMessage } from "@/data/http/get-backend-error-message";

type SignUpResponse = {
  token: string;
  expiresAt: string;
};

export class RemoteMakeSignUp implements MakeSignUp {
  public constructor(private readonly apiUrl: string) {}

  public async execute(params: MakeSignUpParams): Promise<Authentication> {
    const response = await fetch(`${this.apiUrl}/auth/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(
        await getBackendErrorMessage(response, "Não foi possível criar sua conta."),
      );
    }

    const authentication = (await response.json()) as SignUpResponse;

    return {
      token: authentication.token,
      expiresAt: new Date(authentication.expiresAt),
    };
  }
}
