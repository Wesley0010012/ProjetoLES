import { OperationShell } from "./operation-shell";
import { OperationOverview } from "../organisms/operation-overview";

export function OperationDashboard() {
  return (
    <OperationShell>
      <OperationOverview />
    </OperationShell>
  );
}
