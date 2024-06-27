export class FixMeError extends Error {
  fix: () => void | Promise<void>;
  constructor(message: string, fix: () => void | Promise<void>) {
    super(message);
    this.fix = fix;
  }
}

export function fixMe(
  condition: any,
  message: string | (() => string),
  fix: () => void | Promise<void>
): asserts condition {
  if (!condition) {
    throw new FixMeError(message ? (typeof message === "string" ? message : message()) : "", fix);
  }
}
