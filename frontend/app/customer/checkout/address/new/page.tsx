import { CustomerAddressForm } from "@/presentation/components/organisms/customer-address-form";

export default function NewCheckoutAddressPage() {
  return <CustomerAddressForm returnTo="/customer/checkout" />;
}
