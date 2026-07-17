# 1.3 Shared configuration for forked creators

## Objective

Allow a forked creator definition to read and edit the same configuration as its source creator, so settings are shown once and both runtimes resolve one value.

## Owned files/areas

- `packages/creator-api/src/types.ts`
- `packages/creator-api/src/Creator.ts`, `CreatorRuntime.ts`, and `CreatorInstance.ts` as required by the existing config flow
- `packages/shell/src/ConfigContext/CreatorSettings.tsx`
- `packages/shell/src/ConfigContext/ConfigContext.tsx` only if merge semantics require a focused change
- Creator API and shell tests for configuration resolution
- Forked creator definitions only to opt them into the new key after the contract is proven

## Proposed contract

Add an optional creator-definition property such as `configKey` (use repository naming conventions; do not preserve the issue's snake_case merely for fidelity). The effective key is `definition.configKey ?? definition.id`.

Use that same helper everywhere:

- runtime config passed to `create` and `render`;
- settings form deduplication and save key;
- reading defaults/current values;
- config merge behavior.

Do not copy settings from one id to another at startup and do not write duplicate keys for compatibility. Existing creator ids without `configKey` must behave exactly as before.

## Implementation steps

1. Trace config from `Config.creators` through `useInlineCreator`, `Creator`, `CreatorRuntime`, and `CreatorInstance`.
2. Add a pure effective-key helper and unit tests before changing consumers.
3. Add the optional typed field to `CreatorDefinition`.
4. Make runtime reads use the effective key.
5. Make `CreatorSettings` group definitions by effective key. Choose the first definition with fields as the displayed label, or prefer the definition whose id equals the key. Do not render duplicate forms.
6. Save settings only under the effective key.
7. Opt the exhibition's forked IIIF Browser creator into the base browser creator's configuration key, then identify any other direct forks with duplicated settings and migrate only confirmed cases.
8. Verify old saved config under ordinary creator ids remains readable for creators without the new field.

## Automated checks

- Test that base and fork receive identical config when the fork declares a shared key.
- Test that creators without a shared key remain isolated.
- Test that the settings list renders one entry for two definitions sharing a key.
- Test config merging still preserves fields under the effective key.
- Run `pnpm --filter @manifest-editor/creator-api typecheck` and `pnpm --filter @manifest-editor/shell typecheck`.
- Run only focused tests; do not build packages.

## Browser checks at localhost:3000

1. Open Settings in a normal manifest and an exhibition.
2. Confirm the IIIF Browser setting is listed once, not once for each fork.
3. Change the setting, open the generic and exhibition browser creators, and confirm both use it.
4. Reload the project and confirm the setting persists under one config entry.

## Acceptance criteria

- A creator may opt into another stable configuration key.
- Rendering, creation, settings display, saving, and merging agree on the same effective key.
- Shared settings display once.
- Existing unshared creator configuration remains backward compatible.
- No exhibition-specific condition appears in core config code.

## Commit guidance

Prefer one core commit (`feat(creator-api): support shared creator configuration`) and one small opt-in commit (`fix(exhibition): reuse IIIF Browser creator settings`) after both have tests.
