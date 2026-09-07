import { makeUsersGateway } from "./make-users-gateway";
import { MockMakeLogin } from "@/data/usecases/mock-make-login";
import { MockMakeSignOut } from "@/data/usecases/mock-make-sign-out";
import { MockMakeSignUp } from "@/data/usecases/mock-make-sign-up";
import type { MakeLogin } from "@/domain/usecases/make-login";
import type { MakeSignOut } from "@/domain/usecases/make-sign-out";
import type { MakeSignUp } from "@/domain/usecases/make-sign-up";

export function makeLogin(): MakeLogin {
  return new MockMakeLogin();
}

export function makeSignUp(): MakeSignUp {
  return new MockMakeSignUp(makeUsersGateway());
}

export function makeSignOut(): MakeSignOut {
  return new MockMakeSignOut();
}
