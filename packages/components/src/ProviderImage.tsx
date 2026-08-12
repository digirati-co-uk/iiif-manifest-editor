import type { Reference } from "@iiif/parser";
import { useVaultSelector } from "react-iiif-vault/presentation-4";
import { twMerge } from "tailwind-merge";

export function ProviderImage({ className, item }: { className?: string; item: Reference<"ContentResource"> }) {
  const image = useVaultSelector((_, vault) => vault.get(item, { skipSelfReturn: false }), [item]);

  return (
    <div className={twMerge("h-16 my-5 w-full", className)}>
      <img
        src={image.id}
        alt=""
        className={twMerge(
          //
          "h-full w-full object-contain",
        )}
      />
    </div>
  );
}
