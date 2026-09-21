import type { CustomerOptions } from "@/data/usecases/get-customer-options";

export function AddressTypeFields({
  options,
  prefix = "",
  residenceType,
  streetType,
  disabled = false,
}: {
  options: Pick<CustomerOptions, "residenceTypes" | "streetTypes">;
  prefix?: string;
  residenceType?: string;
  streetType?: string;
  disabled?: boolean;
}) {
  return (
    <>
      {[
        {
          name: "residenceType",
          label: "Tipo de residência",
          items: options.residenceTypes,
          value: residenceType,
        },
        {
          name: "streetType",
          label: "Tipo de logradouro",
          items: options.streetTypes,
          value: streetType,
        },
      ].map(({ name, label, items, value }) => (
        <label key={name} className="grid gap-2 text-sm">
          {label}
          <select
            key={`${value}-${items.length}`}
            name={`${prefix}${name}`}
            defaultValue={value ?? ""}
            required
            disabled={disabled || items.length === 0}
            className="h-9 rounded border bg-white px-3"
          >
            <option value="" disabled>
              {items.length ? "Selecione" : "Carregando opções…"}
            </option>
            {items.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </>
  );
}
