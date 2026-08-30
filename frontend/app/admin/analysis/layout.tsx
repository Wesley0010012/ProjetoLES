import type { ReactNode } from "react";
import { OperationShellFactory } from "@/main/factories/operation-shell-factory";

export default function AnalysisLayout({ children }: { children: ReactNode }) {
  return <OperationShellFactory>{children}</OperationShellFactory>;
}
