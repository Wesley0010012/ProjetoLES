import { CustomerProfile } from "@/presentation/components/organisms/customer-profile";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerProfile key={id} customerId={Number(id)} />;
}
