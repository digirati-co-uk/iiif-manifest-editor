# Creator API message contracts source inventory

Module: `packages/creator-api`. Revision: `66de064a5d217b7847db924db925b092b36a0eed`. [Implementation task](../modules/03-creator-api.md).

Default application-source scan: **8 occurrences** in **3 files** (10 files scanned). Expanded JS/TS scan including tests/stories/tutorials/examples: **8 occurrences**.

These are syntactic candidates, not final message IDs or verified active UI. Scans use git's tracked/unignored files and exclude generated, public and vendor assets. Supporting-source strings are usually fixtures or assertions, not catalog entries. Markdown/MDX/JSON/CSS and third-party UI are not included. Review authored defaults and developer errors before extraction. Mixed JSX may be fragments of one whole message. Text below is shortened to 180 characters; follow the source link for the original.

## Default application source files

| File | Candidate occurrences |
| --- | ---: |
| [packages/creator-api/src/Creator.ts](../../../../packages/creator-api/src/Creator.ts) | 6 |
| [packages/creator-api/src/CreatorInstance.ts](../../../../packages/creator-api/src/CreatorInstance.ts) | 1 |
| [packages/creator-api/src/CreatorRuntime.ts](../../../../packages/creator-api/src/CreatorRuntime.ts) | 1 |

## Expanded review list

### packages/creator-api/src/Creator.ts

- [ ] Review [source](../../../../packages/creator-api/src/Creator.ts) and classify its 6 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [30](../../../../packages/creator-api/src/Creator.ts#L30) | message-call | Creator config {{expression1}} not found | interpolation, user-or-developer-message-review |
| [36](../../../../packages/creator-api/src/Creator.ts#L36) | message-call | Definition {{expression1}} does not support parent type {{expression2}} | interpolation, user-or-developer-message-review |
| [41](../../../../packages/creator-api/src/Creator.ts#L41) | message-call | Definition {{expression1}} does not support parent field {{expression2}} | interpolation, user-or-developer-message-review |
| [49](../../../../packages/creator-api/src/Creator.ts#L49) | message-call | Definition {{expression1}} does not support parent {{expression2}} / {{expression3}} | interpolation, user-or-developer-message-review |
| [56](../../../../packages/creator-api/src/Creator.ts#L56) | message-call | Definition does not support resource | user-or-developer-message-review |
| [72](../../../../packages/creator-api/src/Creator.ts#L72) | message-call | Invalid placeholder position | user-or-developer-message-review |

### packages/creator-api/src/CreatorInstance.ts

- [ ] Review [source](../../../../packages/creator-api/src/CreatorInstance.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [157](../../../../packages/creator-api/src/CreatorInstance.ts#L157) | message-call | Creator config {{expression1}} not found | interpolation, user-or-developer-message-review |

### packages/creator-api/src/CreatorRuntime.ts

- [ ] Review [source](../../../../packages/creator-api/src/CreatorRuntime.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [137](../../../../packages/creator-api/src/CreatorRuntime.ts#L137) | message-call | Creator has not been run | user-or-developer-message-review |
