export function startViewTransition(cb: () => void | Promise<void>) {
  if (!(document as any).startViewTransition) {
    cb();
    return;
  }

  (document as any).startViewTransition(() => cb());
}
