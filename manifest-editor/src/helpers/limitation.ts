export class LimitationError extends Error {}

export function limitation(condition: any, message?: string | (() => string)): asserts condition {
  if (!condition) {
    throw new LimitationError(message ? (typeof message === "string" ? message : message()) : "");
  }
}
