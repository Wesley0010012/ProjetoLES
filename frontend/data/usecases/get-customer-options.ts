import { requestJson } from "@/data/http/request-json";

export type EnumOption = { value: string; label: string };
export type CustomerOptions = {
  genders: EnumOption[];
  residenceTypes: EnumOption[];
  streetTypes: EnumOption[];
  phoneTypes: EnumOption[];
};

export function getCustomerOptions(apiUrl: string): Promise<CustomerOptions> {
  return requestJson(
    `${apiUrl}/metadata/customer-options`,
    {},
    {
      role: null,
      errorMessage: "Não foi possível carregar as opções de cadastro.",
    },
  );
}
