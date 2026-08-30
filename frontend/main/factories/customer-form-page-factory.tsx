import { CustomerForm } from "@/presentation/components/organisms/customer-form";

export function CustomerFormPageFactory({ customerId }: { customerId?: number }) {
  return <CustomerForm customerId={customerId} />;
}
