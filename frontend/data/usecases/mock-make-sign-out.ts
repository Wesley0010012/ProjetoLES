import type { MakeSignOut } from "@/domain/usecases/make-sign-out";

export class MockMakeSignOut implements MakeSignOut {
  public async execute(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
}
