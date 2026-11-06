# Public editor facade and browser distribution source inventory

Module: `packages/manifest-editor`. Revision: `66de064a5d217b7847db924db925b092b36a0eed`. [Implementation task](../modules/19-manifest-editor.md).

Default application-source scan: **26 occurrences** in **5 files** (21 files scanned). Expanded JS/TS scan including tests/stories/tutorials/examples: **28 occurrences**.

These are syntactic candidates, not final message IDs or verified active UI. Scans use git's tracked/unignored files and exclude generated, public and vendor assets. Supporting-source strings are usually fixtures or assertions, not catalog entries. Markdown/MDX/JSON/CSS and third-party UI are not included. Review authored defaults and developer errors before extraction. Mixed JSX may be fragments of one whole message. Text below is shortened to 180 characters; follow the source link for the original.

## Default application source files

| File | Candidate occurrences |
| --- | ---: |
| [packages/manifest-editor/src/remote/releases.ts](../../../../packages/manifest-editor/src/remote/releases.ts) | 9 |
| [packages/manifest-editor/browser/build.mjs](../../../../packages/manifest-editor/browser/build.mjs) | 6 |
| [packages/manifest-editor/src/remote/loader.ts](../../../../packages/manifest-editor/src/remote/loader.ts) | 5 |
| [packages/manifest-editor/browser/register.mjs](../../../../packages/manifest-editor/browser/register.mjs) | 4 |
| [packages/manifest-editor/browser/runtime-api.mjs](../../../../packages/manifest-editor/browser/runtime-api.mjs) | 2 |

## Expanded review list

### packages/manifest-editor/src/remote/releases.ts

- [ ] Review [source](../../../../packages/manifest-editor/src/remote/releases.ts) and classify its 9 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [26](../../../../packages/manifest-editor/src/remote/releases.ts#L26) | message-call | Invalid release catalog | user-or-developer-message-review |
| [29](../../../../packages/manifest-editor/src/remote/releases.ts#L29) | message-call | Invalid release catalog | user-or-developer-message-review |
| [45](../../../../packages/manifest-editor/src/remote/releases.ts#L45) | message-call | Invalid or duplicate release | user-or-developer-message-review |
| [57](../../../../packages/manifest-editor/src/remote/releases.ts#L57) | message-call | Invalid release asset | user-or-developer-message-review |
| [62](../../../../packages/manifest-editor/src/remote/releases.ts#L62) | message-call | Release asset origin or path is not allowed | user-or-developer-message-review |
| [68](../../../../packages/manifest-editor/src/remote/releases.ts#L68) | message-call | Latest must reference a catalogued stable release | user-or-developer-message-review |
| [83](../../../../packages/manifest-editor/src/remote/releases.ts#L83) | message-call | Choose an exact version, a minor line such as 2.2.x, or latest | user-or-developer-message-review |
| [94](../../../../packages/manifest-editor/src/remote/releases.ts#L94) | message-call | No approved browser runtime for {{expression1}} | interpolation, user-or-developer-message-review |
| [97](../../../../packages/manifest-editor/src/remote/releases.ts#L97) | message-call | Release {{expression1}} requires runtime API {{expression2}} and React {{expression3}} | interpolation, user-or-developer-message-review |

### packages/manifest-editor/browser/build.mjs

- [ ] Review [source](../../../../packages/manifest-editor/browser/build.mjs) and classify its 6 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [17](../../../../packages/manifest-editor/browser/build.mjs#L17) | message-call | Invalid ME_BROWSER_VERSION | user-or-developer-message-review |
| [19](../../../../packages/manifest-editor/browser/build.mjs#L19) | message-call | Published runtime version must match package.json; version overrides are local fixtures only | user-or-developer-message-review |
| [68](../../../../packages/manifest-editor/browser/build.mjs#L68) | message-call | React and its renderers must come from the host, not the runtime bundle | user-or-developer-message-review |
| [76](../../../../packages/manifest-editor/browser/build.mjs#L76) | message-call | Browser runtime must contain one script with only host React imports: | concatenation, user-or-developer-message-review |
| [89](../../../../packages/manifest-editor/browser/build.mjs#L89) | message-call | External stylesheet asset: {{expression1}} | interpolation, user-or-developer-message-review |
| [101](../../../../packages/manifest-editor/browser/build.mjs#L101) | message-call | Unknown stylesheet asset type: {{expression1}} | interpolation, user-or-developer-message-review |

### packages/manifest-editor/src/remote/loader.ts

- [ ] Review [source](../../../../packages/manifest-editor/src/remote/loader.ts) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [43](../../../../packages/manifest-editor/src/remote/loader.ts#L43) | message-call | Remote editor asset timed out | user-or-developer-message-review |
| [55](../../../../packages/manifest-editor/src/remote/loader.ts#L55) | message-call | Remote editor asset failed to load or failed its integrity check | user-or-developer-message-review |
| [64](../../../../packages/manifest-editor/src/remote/loader.ts#L64) | message-call | Remote editor is incompatible with this host | user-or-developer-message-review |
| [76](../../../../packages/manifest-editor/src/remote/loader.ts#L76) | message-call | Remote editor did not register its runtime | user-or-developer-message-review |
| [102](../../../../packages/manifest-editor/src/remote/loader.ts#L102) | message-call | Remote editor exports do not match runtime API 1 | user-or-developer-message-review |

### packages/manifest-editor/browser/register.mjs

- [ ] Review [source](../../../../packages/manifest-editor/browser/register.mjs) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [10](../../../../packages/manifest-editor/browser/register.mjs#L10) | message-call | Usage: node browser/register.mjs &lt;trusted-release.json&gt; [--latest] | user-or-developer-message-review |
| [14](../../../../packages/manifest-editor/browser/register.mjs#L14) | message-call | Expected a published CDN release descriptor | user-or-developer-message-review |
| [27](../../../../packages/manifest-editor/browser/register.mjs#L27) | message-call | CDN asset unavailable ({{expression1}}): {{expression2}} | interpolation, user-or-developer-message-review |
| [30](../../../../packages/manifest-editor/browser/register.mjs#L30) | message-call | CDN asset integrity mismatch: {{expression1}} | interpolation, user-or-developer-message-review |

### packages/manifest-editor/browser/runtime-api.mjs

- [ ] Review [source](../../../../packages/manifest-editor/browser/runtime-api.mjs) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [30](../../../../packages/manifest-editor/browser/runtime-api.mjs#L30) | message-call | Manifest Editor requires React 19 | terminology, user-or-developer-message-review |
| [33](../../../../packages/manifest-editor/browser/runtime-api.mjs#L33) | message-call | ManifestEditor.createRuntime requires {{expression1}} | interpolation, user-or-developer-message-review |

### packages/manifest-editor/browser/runtime-api.test.mjs

- [ ] Review [source](../../../../packages/manifest-editor/browser/runtime-api.test.mjs) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [31](../../../../packages/manifest-editor/browser/runtime-api.test.mjs#L31) | message-call | Must not run | user-or-developer-message-review |
| [81](../../../../packages/manifest-editor/browser/runtime-api.test.mjs#L81) | message-call | Network unavailable | user-or-developer-message-review |
