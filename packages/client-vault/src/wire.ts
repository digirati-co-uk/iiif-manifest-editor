/** An explicit value codec: JSON alone loses undefined, sparse arrays and special numbers. */
type Value = null | string | boolean | number | { t: string; v?: unknown };

function encode(value: unknown, parents = new Set<object>()): Value {
  if (value === undefined) return { t: "undefined" };
  if (typeof value === "number") {
    if (Object.is(value, -0)) return { t: "number", v: "-0" };
    return Number.isFinite(value) ? value : { t: "number", v: String(value) };
  }
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value !== "object" || parents.has(value)) throw new Error("Unsupported Vault transport value");
  if (value instanceof Error) return { t: "error", v: [value.name, value.message] };
  if (value instanceof Date) return { t: "date", v: value.toISOString() };
  parents.add(value);
  try {
    if (Array.isArray(value))
      return {
        t: "array",
        v: [value.length, Object.keys(value).map((key) => [key, encode(value[Number(key)], parents)])],
      };
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
      throw new Error("Unsupported Vault transport object");
    return { t: "object", v: Object.entries(value).map(([key, item]) => [key, encode(item, parents)]) };
  } finally {
    parents.delete(value);
  }
}

function decode(value: Value): any {
  if (value === null || typeof value !== "object") return value;
  if (value.t === "undefined") return undefined;
  if (value.t === "error") {
    const [name, message] = value.v as [string, string];
    const error = new Error(message);
    error.name = name;
    return error;
  }
  if (value.t === "date") return new Date(value.v as string);
  if (value.t === "number") {
    if (!["-0", "NaN", "Infinity", "-Infinity"].includes(value.v as string)) throw new Error("Invalid Vault number");
    return Number(value.v);
  }
  if (value.t === "object")
    return Object.fromEntries((value.v as [string, Value][]).map(([key, item]) => [key, decode(item)]));
  if (value.t === "array") {
    const [length, entries] = value.v as [number, [string, Value][]];
    if (!Number.isSafeInteger(length) || length < 0 || length > 10_000_000) throw new Error("Invalid Vault array");
    const array = new Array(length);
    for (const [key, item] of entries) {
      if (!/^\d+$/.test(key) || Number(key) >= length) throw new Error("Invalid Vault array index");
      array[Number(key)] = decode(item);
    }
    return array;
  }
  throw new Error("Invalid Vault transport value");
}

export function stringifyVaultMessage(message: unknown): string {
  return JSON.stringify({ _vaultWire: 1, value: encode(message) });
}

/** Accept ordinary JSON from older preview hosts as well. */
export function parseVaultMessage<T = any>(message: string | unknown): T {
  const parsed = typeof message === "string" ? JSON.parse(message) : message;
  return parsed && typeof parsed === "object" && "_vaultWire" in parsed && parsed._vaultWire === 1
    ? decode((parsed as { value: Value }).value)
    : (parsed as T);
}
