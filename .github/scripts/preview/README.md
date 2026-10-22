# Shared dev preview

`deploy-preview.yml` composes same-repository open PRs targeting any branch with
the exact `deploy` label, including drafts, in ascending PR-number order. It starts from a fresh
`main` checkout each time. Conflicting PRs are skipped and later PRs are still
attempted. With no successful PR merges, the preview contains `main` alone.
Neither the PR branches nor `main` are modified.

Stacked PRs are supported: a labelled PR targeting another feature branch is
merged by its head SHA just like a PR targeting `main`. Shared ancestor commits
are included only once. A selected child also brings its ancestor commits, even
if the parent PR is unlabelled; labels select branch heads, not isolated diffs.
Merge order remains ascending PR number, with no automatic conflict resolution.

The existing `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets publish to
`https://manifest-editor-preview.digirati.workers.dev/`. Production deployment
remains in the Build workflow. Merge this workflow and its scripts into `main`
before using it; run **Shared preview → Run workflow** for the initial deployment.
The repository's Actions policy must permit `pull_request_target` workflows.

Fork PRs are excluded even when labelled, and fork events cannot replace queued
reconciliation runs. This preserves the previous deployment trust boundary and
prevents fork code from running with the default branch's Actions cache scope or
accessing the existing production KV binding through the preview Worker. To
preview external contributions, a maintainer must first bring them onto a branch
in this repository.

The `deploy` label authorizes including that PR's application code in the shared
Worker. Composition runs only trusted controller scripts; the combined source
build runs on a separate runner without deployment secrets or write permissions.
Deployment uses the controller's Wrangler configuration and a separately pinned
Wrangler. A credential-free `wrangler deploy --dry-run` verifies the downloaded
artifact in the exact isolated deployment layout before publication, without running package scripts from the combined source. Thus changes
to Wrangler bindings/configuration must land on `main` before they take effect.
The existing shared production/preview KV binding is unchanged.

The workflow serializes the entire composition/build/publication/report cycle.
It checks current selection and SHAs before publication and skips stale builds.
Pending events may coalesce; every run queries live state, including when an
unrelated same-repository PR event replaces a pending relevant event. That event's
PR does not receive a comment unless it is in the current or previous selection.
Unchanged PR metadata does not rebuild a successful snapshot; explicit manual or
main-push runs can retry it. After a failed candidate, subsequent same-repository
events may retry the outstanding drift. A change immediately after
the freshness check is reconciled by the next run.

`preview-state-<attempt>` contains the complete candidate manifest and previous
successful deployment. `preview-source-<attempt>` contains its source archive;
`preview-worker-<attempt>` contains its OpenNext build. GitHub deployments in
`shared-preview` retain compact successful manifests beyond artifact retention.
Each PR's comment opens with that PR's status and the dev site link, then a
table of what is live. When the latest attempt was not deployed, a second
column shows that attempt; a PR is called live only if the live deployment
contains its current head. Exact SHAs, commit lists and conflict output are in
collapsed sections, and these are dropped first if a comment gets too long. Build or
lint failures stop publication; conflicts alone do not. Reporting attempts every
affected PR even when one comment update fails.

If publication succeeds but GitHub deployment bookkeeping fails, comments flag
that explicitly. Rerun the **entire workflow** to reconcile the durable record.
Use a full workflow rerun for other failures too: artifacts are attempt-scoped,
so rerunning only failed jobs cannot reuse inputs from a previous attempt. A
manual cancellation during publication can leave Cloudflare state uncertain;
a full rerun reconciles it. No automatic rollback is attempted.

Run the dependency-free controller tests (temporary Git repositories, no builds):

```sh
node --test .github/scripts/preview/preview.test.mjs
```
