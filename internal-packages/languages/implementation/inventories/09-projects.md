# Project and draft controls source inventory

Module: `packages/projects`. Revision: `66de064a5d217b7847db924db925b092b36a0eed`. [Implementation task](../modules/09-projects.md).

Default application-source scan: **13 occurrences** in **5 files** (20 files scanned). Expanded JS/TS scan including tests/stories/tutorials/examples: **13 occurrences**.

These are syntactic candidates, not final message IDs or verified active UI. Scans use git's tracked/unignored files and exclude generated, public and vendor assets. Supporting-source strings are usually fixtures or assertions, not catalog entries. Markdown/MDX/JSON/CSS and third-party UI are not included. Review authored defaults and developer errors before extraction. Mixed JSX may be fragments of one whole message. Text below is shortened to 180 characters; follow the source link for the original.

## Default application source files

| File | Candidate occurrences |
| --- | ---: |
| [packages/projects/src/components/AppMenu.tsx](../../../../packages/projects/src/components/AppMenu.tsx) | 4 |
| [packages/projects/src/components/DraftTitleEditor.tsx](../../../../packages/projects/src/components/DraftTitleEditor.tsx) | 3 |
| [packages/projects/src/storage/WebsocketLoader.ts](../../../../packages/projects/src/storage/WebsocketLoader.ts) | 3 |
| [packages/projects/src/ProjectContext.hooks.ts](../../../../packages/projects/src/ProjectContext.hooks.ts) | 2 |
| [packages/projects/src/ProjectContext.internal.tsx](../../../../packages/projects/src/ProjectContext.internal.tsx) | 1 |

## Expanded review list

### packages/projects/src/components/AppMenu.tsx

- [ ] Review [source](../../../../packages/projects/src/components/AppMenu.tsx) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [72](../../../../packages/projects/src/components/AppMenu.tsx#L72) | jsx-text | Apps | — |
| [88](../../../../packages/projects/src/components/AppMenu.tsx#L88) | jsx-text | Quick Settings | — |
| [91](../../../../packages/projects/src/components/AppMenu.tsx#L91) | jsx-expression | Show menu | mixed-jsx |
| [91](../../../../packages/projects/src/components/AppMenu.tsx#L91) | jsx-expression | Hide menu | mixed-jsx |

### packages/projects/src/components/DraftTitleEditor.tsx

- [ ] Review [source](../../../../packages/projects/src/components/DraftTitleEditor.tsx) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [56](../../../../packages/projects/src/components/DraftTitleEditor.tsx#L56) | jsx-text | Drafts | — |
| [69](../../../../packages/projects/src/components/DraftTitleEditor.tsx#L69) | jsx-text | Save | — |
| [80](../../../../packages/projects/src/components/DraftTitleEditor.tsx#L80) | jsx-expression | Untitled project | mixed-jsx |

### packages/projects/src/storage/WebsocketLoader.ts

- [ ] Review [source](../../../../packages/projects/src/storage/WebsocketLoader.ts) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [20](../../../../packages/projects/src/storage/WebsocketLoader.ts#L20) | message-call | Method not implemented. | user-or-developer-message-review |
| [28](../../../../packages/projects/src/storage/WebsocketLoader.ts#L28) | message-call | Cannot create new project from Manifest Editor | terminology, user-or-developer-message-review |
| [59](../../../../packages/projects/src/storage/WebsocketLoader.ts#L59) | message-call | Cannot delete | user-or-developer-message-review |

### packages/projects/src/ProjectContext.hooks.ts

- [ ] Review [source](../../../../packages/projects/src/ProjectContext.hooks.ts) and classify its 2 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [38](../../../../packages/projects/src/ProjectContext.hooks.ts#L38) | message-call | Cannot create project with this storage backend | user-or-developer-message-review |
| [70](../../../../packages/projects/src/ProjectContext.hooks.ts#L70) | message-call | Not implemented yet | user-or-developer-message-review |

### packages/projects/src/ProjectContext.internal.tsx

- [ ] Review [source](../../../../packages/projects/src/ProjectContext.internal.tsx) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [59](../../../../packages/projects/src/ProjectContext.internal.tsx#L59) | jsx-text | Loading... | — |
