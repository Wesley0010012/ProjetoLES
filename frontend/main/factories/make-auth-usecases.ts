import { MockMakeLogin } from "@/data/usecases/mock-make-login";
import { MockMakeSignOut } from "@/data/usecases/mock-make-sign-out";
import { MockMakeSignUp } from "@/data/usecases/mock-make-sign-up";
import { RemoteMakeLogin } from "@/data/usecases/remote-make-login";
import { RemoteMakeSignOut } from "@/data/usecases/remote-make-sign-out";
import { RemoteMakeSignUp } from "@/data/usecases/remote-make-sign-up";
import type { MakeLogin } from "@/domain/usecases/make-login";
import type { MakeSignOut } from "@/domain/usecases/make-sign-out";
import type { MakeSignUp } from "@/domain/usecases/make-sign-up";
import { apiUrl, isMockEnvironment } from "@/main/connectors/runtime-environment";

export function makeLogin(): MakeLogin {
  return isMockEnvironment() ? new MockMakeLogin() : new RemoteMakeLogin(apiUrl());
}

export function makeSignUp(): MakeSignUp {
  return isMockEnvironment() ? new MockMakeSignUp() : new RemoteMakeSignUp(apiUrl());
}

export function makeSignOut(): MakeSignOut {
  return isMockEnvironment() ? new MockMakeSignOut() : new RemoteMakeSignOut(apiUrl());
}
