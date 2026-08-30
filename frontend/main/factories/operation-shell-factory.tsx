import type { ReactNode } from "react";
import { OperationShell } from "@/presentation/components/templates/operation-shell";

export function OperationShellFactory({ children }: { children: ReactNode }) {
  return <OperationShell>{children}</OperationShell>;
}
