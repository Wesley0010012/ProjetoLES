import type { Authentication } from "@/domain/models/authentication";

export type MakeSignUpParams = {
  email: string;
  password: string;
  passwordConfirmation: string;
};

export interface MakeSignUp {
  execute(params: MakeSignUpParams): Promise<Authentication>;
}
