import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = ComponentProps<typeof Input> & {
  label: string;
  hint?: string;
};

export function FormField({ id, label, hint, ...inputProps }: FormFieldProps) {
  const hintId = hint && id ? `${id}-hint` : undefined;

  return (
    <div className="group/field grid gap-2.5">
      <Label htmlFor={id}>
        {label}
        {inputProps.required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-auto text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
            Opcional
          </span>
        )}
      </Label>
      <Input id={id} aria-describedby={hintId} {...inputProps} />
      {hint && (
        <p id={hintId} className="px-1 text-xs leading-5 text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
