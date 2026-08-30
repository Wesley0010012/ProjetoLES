import type { ReactNode } from "react";
import { StorefrontShell } from "@/presentation/components/templates/storefront-shell";

export default function EcommerceLayout({ children }: { children: ReactNode }) {
  return <StorefrontShell>{children}</StorefrontShell>;
}
