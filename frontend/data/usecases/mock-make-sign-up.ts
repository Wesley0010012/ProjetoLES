import type { MakeSignUp, MakeSignUpParams } from "@/domain/usecases/make-sign-up";

export class MockMakeSignUp implements MakeSignUp {
  public async execute(params: MakeSignUpParams) {
    await new Promise((resolve) => setTimeout(resolve, 650));

    if (params.password !== params.passwordConfirmation) {
      throw new Error("A senha e a confirmação devem ser iguais.");
    }

    return {
      token: `mock-user-${Date.now()}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }
}
