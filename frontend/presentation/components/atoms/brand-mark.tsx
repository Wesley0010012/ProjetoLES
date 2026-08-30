import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3" aria-label="Libra">
      <Image
        src="/brand/symbol.svg"
        alt=""
        width={40}
        height={40}
        priority
        className={inverse ? "ring-1 ring-white/15" : ""}
      />
      {!compact && (
        <span
          className={`font-heading text-xl font-semibold tracking-[-0.035em] ${
            inverse ? "text-white" : "text-foreground"
          }`}
        >
          Libra
        </span>
      )}
    </div>
  );
}
