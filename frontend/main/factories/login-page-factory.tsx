"use client";

import { useMemo } from "react";

import { AccessType } from "@/domain/models/access-type";
import { LoginPageTemplate } from "@/presentation/components/templates/login-page-template";
import { makeLogin } from "./make-auth-usecases";

type LoginPageFactoryProps = {
  accessType: AccessType;
};

const pageContent = {
  [AccessType.USER]: {
    eyebrow: "Área do cliente",
    title: "Que bom ter você de volta",
    description: "Use seu e-mail e senha para continuar sua jornada pela Libra.",
    demoEmail: "henry.townshend@libra.com.br",
    demoPassword: "Cliente@123",
  },
  [AccessType.OPERATOR]: {
    eyebrow: "Portal de operações",
    title: "Acesso da equipe",
    description:
      "Entre com suas credenciais de operador para acessar o ambiente interno.",
    demoEmail: "operador@libra.com.br",
    demoPassword: "Operador@123",
  },
};

export function LoginPageFactory({ accessType }: LoginPageFactoryProps) {
  const login = useMemo(() => makeLogin(), []);
  const content = pageContent[accessType];

  return (
    <LoginPageTemplate
      accessType={accessType}
      makeLogin={login}
      operator={accessType === AccessType.OPERATOR}
      {...content}
    />
  );
}
