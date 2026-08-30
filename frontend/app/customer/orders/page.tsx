import { Suspense } from "react";
import { CustomerOrders } from "@/presentation/components/organisms/customer-orders";

export default function OrdersPage() {
  return (
    <Suspense>
      <CustomerOrders />
    </Suspense>
  );
}
