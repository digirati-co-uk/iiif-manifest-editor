import type { Vault, VaultInteraction } from "@iiif/helpers/vault";

/** Synchronous commands retain their return type; asynchronous commands seal in finally. */
export function runVaultCommand<T>(vault: Vault, label: string, callback: (scoped: Vault) => T): T {
  const context = vault.beginInteraction({ label });
  try {
    const result = callback(context.vault);
    if (result && typeof (result as any).then === "function") {
      return Promise.resolve(result).finally(() => context.finish()) as T;
    }
    context.finish();
    return result;
  } catch (error) {
    context.finish();
    throw error;
  }
}

const sessions = new WeakMap<object, Set<VaultEditSession>>();

/** A field/gesture owns this scope explicitly. It never changes ambient dispatch context. */
export class VaultEditSession {
  private context?: VaultInteraction<Vault>;
  private disposed = false;
  private stopReset?: () => void;
  private flushers = new Set<() => void>();
  constructor(
    private vault: Vault,
    private label: string,
    readonly epoch = 0
  ) {}
  private register() {
    const key = this.vault.getStore();
    if (!sessions.has(key)) sessions.set(key, new Set());
    sessions.get(key)!.add(this);
    this.stopReset ||= this.vault.getStore().onReset(() => {
      // Pending field values belong to the old document. Never flush them into its replacement.
      this.disposed = true;
      this.context = undefined;
      this.flushers.clear();
      sessions.get(key)?.delete(this);
      this.stopReset?.();
      this.stopReset = undefined;
    });
  }
  run<T>(write: (scoped: Vault) => T): T | undefined {
    if (this.disposed) return;
    this.register();
    try {
      this.context ||= this.vault.beginInteraction({ label: this.label });
      return write(this.context.vault);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.startsWith("Vault interaction is closed") || error.message === "Vault history has been disposed")
      )
        return;
      throw error;
    }
  }
  onFlush(callback: () => void) {
    if (this.disposed) return () => {};
    this.register();
    this.flushers.add(callback);
    return () => {
      this.flushers.delete(callback);
    };
  }
  finish() {
    if (this.disposed) return;
    for (const flush of this.flushers) flush();
    this.context?.finish();
    this.context = undefined;
    sessions.get(this.vault.getStore())?.delete(this);
  }
  dispose() {
    this.finish();
    this.disposed = true;
    this.flushers.clear();
    this.stopReset?.();
    this.stopReset = undefined;
    sessions.get(this.vault.getStore())?.delete(this);
  }
}

export function finishVaultEditSessions(vault: Vault) {
  for (const session of sessions.get(vault.getStore()) || []) session.finish();
}

export function documentValuesEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    (!Array.isArray(a) || a.length === b.length) &&
    keys.every((key) => Object.hasOwn(b, key) && documentValuesEqual(a[key], b[key]))
  );
}
