import { AccessType } from "@/domain/models/access-type";
import type { MakeLogin, MakeLoginParams } from "@/domain/usecases/make-login";

type MockAccount = {
  email: string;
  password: string;
  type: AccessType;
};

const MOCK_ACCOUNTS: MockAccount[] = [
  {
    email: "henry.townshend@libra.com.br",
    password: "Cliente@123",
    type: AccessType.USER,
  },
  {
    email: "operador@libra.com.br",
    password: "Operador@123",
    type: AccessType.OPERATOR,
  },
];

export class MockMakeLogin implements MakeLogin {
  public async execute(params: MakeLoginParams) {
    await new Promise((resolve) => setTimeout(resolve, 650));

    const account = MOCK_ACCOUNTS.find(
      (candidate) =>
        candidate.email === params.email.trim().toLowerCase() &&
        candidate.password === params.password &&
        candidate.type === params.type,
    );

    if (!account) {
      throw new Error("E-mail, senha ou tipo de acesso inválido.");
    }

    return {
      token: `mock-${account.type.toLowerCase()}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }
}
