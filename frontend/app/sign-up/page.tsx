import type { Metadata } from "next";

import { SignUpPageFactory } from "@/main/factories/sign-up-page-factory";

export const metadata: Metadata = {
  title: "Criar conta | Libra",
  description: "Crie sua conta de cliente na Libra.",
};

export default function SignUpPage() {
  return <SignUpPageFactory />;
}
