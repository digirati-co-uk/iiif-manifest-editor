import type { Reference } from "@iiif/parser";

export async function completeCreator(options: {
  create: () => Promise<Reference | Reference[]>;
  onCreate?: () => void;
  close?: () => void;
  edit?: (resource: Reference) => void;
}) {
  const created = await options.create();
  const first = Array.isArray(created) ? created[0] : created;

  if (!first) return false;

  options.onCreate?.();
  options.close?.();
  options.edit?.(first);
  return true;
}
