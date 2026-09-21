import { RemoteMakeLogin } from "@/data/usecases/remote-make-login";
import { RemoteMakeSignUp } from "@/data/usecases/remote-make-sign-up";
import { RemoteMakeSignOut } from "@/data/usecases/remote-make-sign-out";
import { apiUrl } from "@/main/connectors/runtime-environment";
export function makeLogin() {
  return new RemoteMakeLogin(apiUrl());
}
export function makeSignUp() {
  return new RemoteMakeSignUp(apiUrl());
}
export function makeSignOut() {
  return new RemoteMakeSignOut(apiUrl());
}
