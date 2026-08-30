import { CustomerCardForm } from "@/presentation/components/organisms/customer-card-form";
export default async function EditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerCardForm cardId={Number(id)} />;
}
