import { CustomerAddressForm } from "@/presentation/components/organisms/customer-address-form";
export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerAddressForm addressId={Number(id)} />;
}
