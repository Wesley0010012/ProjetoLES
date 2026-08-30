import type { ReactNode } from "react";
import { OperationShellFactory } from "@/main/factories/operation-shell-factory";

export default function SalesLayout({ children }: { children: ReactNode }) {
  return <OperationShellFactory>{children}</OperationShellFactory>;
}
