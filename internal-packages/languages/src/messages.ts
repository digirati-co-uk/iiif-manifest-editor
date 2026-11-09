import { assertNamespace, assertRecord, flattenCatalog } from "./schema.ts";
import type { MessageReference, MessageValue } from "./schema.ts";
import type { BuiltinNamespace, SourceCatalogs } from "./catalog-types.ts";

type LeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : T[K] extends object ? `${K}.${LeafPaths<T[K]>}` : never;
}[keyof T & string];
type PluralAlias<Key> = Key extends `${infer Base}_other` ? Base : never;
export type MessageKey<N extends BuiltinNamespace> =
  | LeafPaths<SourceCatalogs[N]>
  | PluralAlias<LeafPaths<SourceCatalogs[N]>>;
type AtPath<T, Path extends string> = Path extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? AtPath<T[Head], Tail>
    : never
  : Path extends keyof T
    ? T[Path]
    : never;
type SourceMessage<N extends BuiltinNamespace, K extends MessageKey<N>> =
  K extends LeafPaths<SourceCatalogs[N]> ? AtPath<SourceCatalogs[N], K> : AtPath<SourceCatalogs[N], `${K}_other`>;
type Trim<T extends string> = T extends ` ${infer Rest}` ? Trim<Rest> : T extends `${infer Rest} ` ? Trim<Rest> : T;
type Variables<T> = T extends `${string}{{${infer Variable}}}${infer Rest}` ? Trim<Variable> | Variables<Rest> : never;
type MessageOptions<N extends BuiltinNamespace, K extends MessageKey<N>> = [Variables<SourceMessage<N, K>>] extends [
  never,
]
  ? [options?: { readonly defaultValue?: string }]
  : [
      options: {
        readonly values: { readonly [V in Variables<SourceMessage<N, K>>]: V extends "count" ? number : MessageValue };
        readonly defaultValue?: string;
      },
    ];

/** Typed, serialisable references. No string is formatted at module-import time. */
export function message<N extends BuiltinNamespace, K extends MessageKey<N>>(
  namespace: N,
  key: K,
  ...options: MessageOptions<N, K>
): MessageReference<N, K> {
  return createMessageReference(namespace, key, options[0]);
}

/** Open extension API for plugin-local namespaces. Runtime catalog validation supplies the contract. */
export function createMessageReference<N extends string, K extends string>(
  namespace: N,
  key: K,
  options?: { readonly values?: Readonly<Record<string, MessageValue>>; readonly defaultValue?: string }
): MessageReference<N, K> {
  assertNamespace(namespace);
  if (
    !key ||
    key.includes(":") ||
    key.split(".").some((part) => !part || ["__proto__", "prototype", "constructor"].includes(part))
  )
    throw new TypeError("Invalid message key");
  if (options?.values) {
    assertRecord(options.values, "message values");
    // Same plain-data checks as catalogs; interpolation names may not have nested paths.
    flattenCatalog(
      Object.fromEntries(
        Object.entries(options.values).map(([name, value]) => {
          if (value !== null && !["string", "number", "boolean"].includes(typeof value))
            throw new TypeError("Message values must be serialisable primitives");
          if (typeof value === "number" && !Number.isFinite(value))
            throw new TypeError("Message numbers must be finite");
          return [name, String(value)];
        })
      )
    );
  }
  return Object.freeze({
    namespace,
    key,
    ...(options?.values ? { values: Object.freeze({ ...options.values }) } : {}),
    ...(options?.defaultValue !== undefined ? { defaultValue: options.defaultValue } : {}),
  });
}
