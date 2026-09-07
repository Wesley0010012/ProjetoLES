import { RemoteUsersGateway } from "./remote-users-gateway";
import { validatePassword } from "@/domain/rules/validate-password";
import type { MakeSignUp, MakeSignUpParams } from "@/domain/usecases/make-sign-up";

export class MockMakeSignUp implements MakeSignUp {
  public constructor(private readonly users: RemoteUsersGateway) {}

  public async execute(params: MakeSignUpParams) {
    validatePassword(params.password, params.passwordConfirmation);
    const user = await this.users.create(params.email.trim().toLowerCase(), "USER");
    await this.users.updatePassword(
      user.id,
      params.password,
      params.passwordConfirmation,
    );
    return {
      userId: user.id,
      token: `mock-user-${user.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }
}
