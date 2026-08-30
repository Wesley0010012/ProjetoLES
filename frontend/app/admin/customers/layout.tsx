import type { ReactNode } from "react";
import { OperationShellFactory } from "@/main/factories/operation-shell-factory";

export default function CustomersLayout({ children }: { children: ReactNode }) {
  return <OperationShellFactory>{children}</OperationShellFactory>;
}
