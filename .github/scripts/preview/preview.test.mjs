import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  git,
  mergePr,
  select,
  fingerprint,
  comment,
  outcome,
  marker,
  snapshot,
  lastSuccess,
  shouldCompose,
  compose,
  fresh,
  record,
  read,
} from "./preview.mjs";

const repository = "test/project";
const repo = { owner: "test", repo: "project" };
const pull = (number, overrides = {}) => ({
  number,
  state: "open",
  base: { ref: "main" },
  labels: [{ name: "deploy" }],
  head: { sha: `${number}`, ref: `feature-${number}`, repo: { full_name: repository } },
  ...overrides,
});

test("selects labelled same-repository PRs across target branches in numeric order", () => {
  assert.deepEqual(
    select(
      [
        pull(10),
        pull(2, { draft: true }),
        pull(3, { state: "closed" }),
        pull(4, { labels: [] }),
        pull(5, { base: { ref: "other" } }),
        pull(6, { head: { sha: "fork", repo: { full_name: "outsider/project" } } }),
        pull(7, { head: { sha: "deleted", repo: null } }),
      ],
      repository
    ).map((pr) => pr.number),
    [2, 5, 10]
  );
});

test("freshness includes base, membership, and exact head but ignores titles", () => {
  const first = { base: "abc", prs: select([pull(1)], repository) };
  assert.equal(fingerprint(first), fingerprint({ ...first, prs: [{ ...first.prs[0], title: "edited" }] }));
  for (const next of [
    { ...first, base: "def" },
    { ...first, prs: [] },
    { ...first, prs: [{ ...first.prs[0], head: "new" }] },
  ]) {
    assert.notEqual(fingerprint(first), fingerprint(next));
  }
});

test("merge conflict is aborted and next PR merges; shared commits are not counted twice", () => {
  const cwd = mkdtempSync(join(tmpdir(), "preview-test-"));
  try {
    git(cwd, "init", "-b", "main");
    git(cwd, "config", "user.name", "Test");
    git(cwd, "config", "user.email", "test@example.com");
    const commit = (file, text) => {
      writeFileSync(join(cwd, file), text);
      git(cwd, "add", ".");
      git(cwd, "commit", "-m", text);
      return git(cwd, "rev-parse", "HEAD");
    };
    const base = commit("shared.txt", "base\n");
    git(cwd, "checkout", "-b", "first");
    const first = commit("shared.txt", "first\n");
    git(cwd, "checkout", "-b", "second", base);
    const second = commit("shared.txt", "second\n");
    git(cwd, "checkout", "-b", "third", first);
    const third = commit("other.txt", "third\n");
    git(cwd, "checkout", "--detach", base);
    const included = mergePr(cwd, { number: 1, head: first });
    assert.deepEqual(included.commits, [first]);
    const before = git(cwd, "rev-parse", "HEAD");
    const conflict = mergePr(cwd, { number: 2, head: second });
    assert.equal(conflict.status, "conflict");
    assert.deepEqual(conflict.paths, ["shared.txt"]);
    assert.equal(git(cwd, "rev-parse", "HEAD"), before);
    assert.equal(git(cwd, "status", "--porcelain"), "");
    assert.deepEqual(mergePr(cwd, { number: 3, head: third }).commits, [third]);
    assert.deepEqual(mergePr(cwd, { number: 4, head: first }).commits, []);
    assert.throws(() => mergePr(cwd, { number: 5, head: "nonexistent" }), /failed/);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

const candidate = {
  base: "new0000000000",
  run: "https://example.com/run",
  prs: [
    { number: 1, head: "aaa0000000000", status: "included", commits: ["aaa0000000000"] },
    { number: 2, head: "bbb0000000000", status: "conflict", paths: ["<path>"], diagnostics: "</pre>hello" },
    { number: 3, head: "ccc0000000000", status: "included", commits: ["c1", "ccc0000000000"] },
  ],
};
const previousLive = {
  base: "old0000000000",
  run: "https://example.com/old",
  deployedAt: "2026-10-01T10:00:00Z",
  prs: [{ number: 1, head: "aaa0000000000", status: "included" }],
};

test("outcome maps workflow results without conflating publication and bookkeeping", () => {
  assert.deepEqual(outcome({ DEPLOY_RESULT: "success", FRESH: "true", PUBLISH_RESULT: "success" }), {
    state: "deployed",
  });
  assert.deepEqual(outcome({ DEPLOY_RESULT: "failure", FRESH: "true", PUBLISH_RESULT: "success" }), {
    state: "bookkeeping",
  });
  assert.deepEqual(outcome({ DEPLOY_RESULT: "success", FRESH: "false" }), { state: "superseded" });
  assert.deepEqual(outcome({ DEPLOY_RESULT: "skipped", FAILED_STEP: "Lint" }), { state: "failed", step: "Lint" });
  assert.deepEqual(outcome({}), { state: "failed", step: null });
});

test("successful comment leads with live status and link, without repeating the snapshot", () => {
  const live = { ...candidate, deployedAt: "2026-10-22T10:00:00Z" };
  const body = comment(candidate, live, 3, { state: "deployed" });
  const lines = body.split("\n");
  assert.equal(lines[0], marker);
  assert.equal(lines[1], "## ✅ #3 is live");
  assert.match(body, /\*\*\[Open the shared dev preview ↗\]\(https:\/\/manifest-editor-preview/);
  assert.match(body, /\*\*This PR:\*\* ✅ Live at `ccc0000`/);
  assert.match(body, /\*\*Latest attempt:\*\* ✅ Deployed · \[workflow run\]\(https:\/\/example.com\/run\)/);
  assert.match(body, /\| \| Live on dev site \|\n/);
  assert.doesNotMatch(body, /Latest attempt \(not live\)/, "no duplicated candidate column");
  assert.match(body, /\| #1 \| ✅ `aaa0000` \|/);
  assert.match(body, /\| #2 \| ⚠️ conflict \|/);
  assert.match(body, /\| \*\*#3\*\* \(this PR\) \| ✅ `ccc0000` \|/);
  // Exact SHAs and commit lists stay available, but collapsed.
  assert.match(body, /<details><summary>Exact SHAs and commits<\/summary>[\s\S]*`new0000000000`[\s\S]*- `c1`/);
  assert.equal(body.match(/Exact SHAs/g).length, 1);
  assert.doesNotMatch(body, /\*\*Live\*\* —/, "live SHAs are not repeated when identical");
});

test("failed or superseded candidates never appear live", () => {
  for (const [result, title] of [
    [{ state: "failed", step: "Build <app>" }, "## ❌ Preview failed — #3 is not live"],
    [{ state: "superseded" }, "## ⏳ #3 is not live yet"],
  ]) {
    const body = comment(candidate, previousLive, 3, result);
    assert.equal(body.split("\n")[1], title);
    assert.doesNotMatch(body, /✅ Live at/);
    assert.match(body, /\| \| Live on dev site \| Latest attempt \(not live\) \|/);
    assert.match(body, /\| main \| `old0000` \| `new0000` \|/);
    assert.match(body, /\| \*\*#3\*\* \(this PR\) \| — \| ✅ `ccc0000` \|/);
    assert.match(body, /\*\*Live\*\* — main `old0000000000`/);
  }
  const failed = comment(candidate, previousLive, 3, { state: "failed", step: "Build <app>" });
  assert.match(failed, /❌ Failed at Build &lt;app&gt;/);
  assert.match(comment(candidate, previousLive, 1, { state: "failed" }), /## ✅ #1 is live/);
  // A previously deployed head that has since changed is reported as older, not current.
  const moved = { ...candidate, prs: [{ ...candidate.prs[0], head: "ddd0000000000" }] };
  assert.match(comment(moved, previousLive, 1, { state: "failed" }), /an older head `aaa0000` is live/);
});

test("conflict comment summarises merge base and escapes paths and logs in a collapsed block", () => {
  const body = comment(candidate, previousLive, 2, { state: "deployed" });
  assert.equal(body.split("\n")[1], "## ⚠️ #2 skipped: merge conflict");
  assert.match(body, /\*\*Merge conflict\*\* in 1 file against main `new0000` plus #1\./);
  assert.match(body, /<details><summary>Conflicting files and merge output<\/summary>\n\n<pre>\n&lt;path&gt;\n/);
  assert.match(body, /&lt;\/pre&gt;hello\n<\/pre>/);
  assert.equal(body.match(/<\/pre>/g).length, 1, "untrusted output cannot close the block");
  const huge = {
    ...candidate,
    prs: [
      { ...candidate.prs[1], paths: Array.from({ length: 150 }, (_, i) => `f${i}`), diagnostics: "x".repeat(9000) },
    ],
  };
  const capped = comment(huge, null, 2, { state: "deployed" });
  assert.match(capped, /f99\n… 50 more in the workflow artifact/);
  assert.doesNotMatch(capped, /x{6001}/);
});

test("removed PRs, main-only snapshots, and missing deployments are reported accurately", () => {
  const mainOnly = { base: "main000000000", run: "https://example.com/run", prs: [] };
  const deployed = comment(mainOnly, { ...mainOnly, deployedAt: "now" }, 1, { state: "deployed" });
  assert.equal(deployed.split("\n")[1], "## ➖ #1 removed from the dev preview");
  assert.match(deployed, /main baseline/);
  assert.match(deployed, /now · main only/);
  assert.match(deployed, /- No PRs; main only\./);
  const pending = comment(mainOnly, previousLive, 1, { state: "failed" });
  assert.equal(pending.split("\n")[1], "## ➖ #1 deselected — still live");
  assert.match(pending, /\| \*\*#1\*\* \(this PR\) \| ✅ `aaa0000` \| — \|/);
  const none = comment(candidate, null, 3, { state: "failed" });
  assert.match(none, /\*\*Live deployment:\*\* none yet/);
  assert.match(none, /\| main \| — \| `new0000` \|/);
  assert.match(none, /it is not live/);
  const partial = { ...candidate, prs: [{ number: 4, head: "eee0000000000" }] };
  assert.match(comment(partial, null, 4, { state: "failed" }), /❔ not processed/);
});

test("oversized comments drop collapsed detail before the status summary", () => {
  const big = {
    ...candidate,
    prs: Array.from({ length: 40 }, (_, i) => ({
      number: i + 1,
      head: `${i}`.padStart(40, "a"),
      status: "included",
      commits: Array.from({ length: 100 }, (_, j) => `${i}-${j}`.padStart(40, "c")),
    })),
  };
  const body = comment(big, null, 7, { state: "failed" });
  assert.ok(body.length < 60000);
  assert.ok(body.startsWith(marker));
  assert.match(body, /\| \*\*#7\*\* \(this PR\) \| — \| ✅ `aaaaaaa` \|/);
  assert.match(body, /\| #40 \|/);
  assert.match(body, /Commit list omitted for length/);
  assert.doesNotMatch(body, /<details>/);
});

test("snapshot uses pagination and captures main SHA", async () => {
  const github = {
    rest: { repos: { getCommit: async () => ({ data: { sha: "base" } }) }, pulls: { list: "pulls" } },
    paginate: async (method, options) => {
      assert.equal(method, "pulls");
      assert.equal(options.per_page, 100);
      assert.equal(Object.hasOwn(options, "base"), false, "must query PRs targeting any branch");
      return [pull(10, { base: { ref: "feature-2" } }), pull(2)];
    },
  };
  assert.deepEqual(
    (await snapshot(github, repo)).prs.map((pr) => pr.number),
    [2, 10]
  );
});

test("finds last successful deployment even after it becomes inactive", async () => {
  const github = {
    rest: { repos: { listDeployments: "deployments", listDeploymentStatuses: "statuses" } },
    paginate: Object.assign(
      async (_, options) =>
        options.deployment_id === 2 ? [{ state: "failure" }] : [{ state: "inactive" }, { state: "success" }],
      {
        iterator: async function* () {
          yield { data: [{ id: 2, payload: { schema: 1, base: "bad" } }] };
          yield { data: [{ id: 1, payload: { schema: 1, base: "good" } }] };
        },
      }
    ),
  };
  assert.equal((await lastSuccess(github, {})).base, "good");
});

test("report updates only bot comments, includes removed PRs, and continues after an API error", async () => {
  const { report } = await import("./preview.mjs");
  const { mkdirSync } = await import("node:fs");
  const cwd = mkdtempSync(join(tmpdir(), "preview-report-"));
  const original = process.cwd();
  const originalEnv = {
    DEPLOY_RESULT: process.env.DEPLOY_RESULT,
    FRESH: process.env.FRESH,
    PUBLISH_RESULT: process.env.PUBLISH_RESULT,
  };
  try {
    process.chdir(cwd);
    mkdirSync("state");
    writeFileSync(
      "state/manifest.json",
      JSON.stringify({
        base: "base",
        prs: [
          { number: 1, head: "a", status: "included", commits: ["a"] },
          { number: 2, head: "b", status: "included", commits: ["b"] },
        ],
        run: "https://example.com/run",
      })
    );
    writeFileSync("state/previous.json", JSON.stringify({ prs: [{ number: 3 }] }));
    process.env.DEPLOY_RESULT = "failure";
    process.env.FRESH = "true";
    process.env.PUBLISH_RESULT = "success";
    const updated = [],
      created = [],
      failures = [];
    const github = {
      rest: {
        repos: { listDeployments: "deployments" },
        issues: {
          listComments: "comments",
          updateComment: async (args) => {
            updated.push(args);
            throw new Error("API unavailable");
          },
          createComment: async (args) => created.push(args),
        },
      },
      paginate: Object.assign(
        async (_, { issue_number }) =>
          issue_number === 1
            ? [{ id: 11, user: { login: "github-actions[bot]" }, body: marker }]
            : [{ id: 22, user: { login: "human" }, body: marker }],
        {
          iterator: async function* () {
            yield { data: [] };
          },
        }
      ),
    };
    await report({ github, context: { repo: {} }, core: { setFailed: (value) => failures.push(value) } });
    assert.deepEqual(
      updated.map((item) => item.comment_id),
      [11]
    );
    assert.deepEqual(
      created.map((item) => item.issue_number),
      [2, 3]
    );
    assert.match(created[0].body, /Published, but deployment bookkeeping failed — rerun the entire workflow/);
    assert.match(created[0].body, /## ✅ #2 is live/, "publication succeeded, so the candidate is live");
    assert.match(created[0].body, /\| #1 \| ✅ `a` \|/);
    assert.match(created[1].body, /## ➖ #3 removed from the dev preview/);
    assert.match(failures[0], /#1: API unavailable/);
  } finally {
    process.chdir(original);
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("relevance ignores unchanged PR metadata, but reconciles membership/base drift and explicit retries", () => {
  const current = { base: "base", prs: select([pull(1)], repository) };
  assert.equal(shouldCompose("pull_request_target", current, current), false);
  assert.equal(shouldCompose("pull_request_target", null, { base: "base", prs: [] }), false);
  assert.equal(shouldCompose("pull_request_target", null, current), true);
  assert.equal(shouldCompose("pull_request_target", current, { base: "base", prs: [] }), true);
  assert.equal(shouldCompose("pull_request_target", current, { ...current, base: "new" }), true);
  assert.equal(shouldCompose("push", current, current), true);
  assert.equal(shouldCompose("workflow_dispatch", current, current), true);
});

test("compose includes a stacked PR after a conflict and round-trips the deployment ledger", async () => {
  const { mkdirSync, existsSync } = await import("node:fs");
  const root = mkdtempSync(join(tmpdir(), "preview-compose-"));
  const cwd = join(root, "controller");
  const original = process.cwd();
  mkdirSync(cwd);
  try {
    process.chdir(cwd);
    git(".", "init", "-b", "main");
    git(".", "config", "user.name", "Test");
    git(".", "config", "user.email", "test@example.com");
    // Harmless checkout-style auth entry: transfers config without real credentials.
    git(".", "config", "http.https://example.invalid/.extraheader", "test: value");
    const commit = (path, text) => {
      writeFileSync(path, text);
      git(".", "add", ".");
      git(".", "commit", "-m", text);
      return git(".", "rev-parse", "HEAD");
    };
    const base = commit("shared.txt", "base");
    git(".", "checkout", "-b", "first");
    const first = commit("shared.txt", "first");
    git(".", "checkout", "-b", "second", base);
    const second = commit("shared.txt", "second");
    git(".", "checkout", "-b", "third", first);
    const third = commit("independent.txt", "third");
    git(".", "checkout", "main");
    const remoteRoot = join(root, "remote");
    mkdirSync(join(remoteRoot, "test"), { recursive: true });
    const remote = join(remoteRoot, "test/project.git");
    git(".", "clone", "--bare", ".", remote);
    for (const [number, sha] of [
      [1, first],
      [2, second],
      [3, third],
    ]) {
      git(remote, "update-ref", `refs/pull/${number}/head`, sha);
    }
    let pulls = [pull(3, { base: { ref: "first" } }), pull(2), pull(1)].map((pr) => ({
      ...pr,
      head: {
        ...pr.head,
        sha: { 1: first, 2: second, 3: third }[pr.number],
      },
    }));
    const deployments = [],
      statuses = [];
    const github = {
      rest: {
        pulls: { list: "pulls" },
        repos: {
          getCommit: async () => ({ data: { sha: base } }),
          listDeployments: "deployments",
          listDeploymentStatuses: "statuses",
          createDeployment: async (args) => {
            deployments.unshift({ ...args, id: 1 });
            return { data: { id: 1 } };
          },
          createDeploymentStatus: async (args) => {
            statuses.push(args);
          },
        },
      },
      paginate: Object.assign(async (method) => (method === "pulls" ? pulls : statuses), {
        iterator: async function* () {
          yield { data: deployments };
        },
      }),
    };
    const outputs = {};
    const core = {
      setOutput: (key, value) => {
        outputs[key] = value;
      },
    };
    const context = {
      repo,
      eventName: "pull_request_target",
      payload: { pull_request: pull(99) },
      serverUrl: `file://${remoteRoot}`,
      runId: 123,
    };
    await compose({ github, context, core });
    const manifest = read("state/manifest.json");
    assert.equal(outputs.relevant, "true");
    assert.deepEqual(
      manifest.prs.map((pr) => [pr.number, pr.status]),
      [
        [1, "included"],
        [2, "conflict"],
        [3, "included"],
      ]
    );
    assert.deepEqual(manifest.prs[2].commits, [third], "stacked PR adds only its new commit");
    assert.equal(git("integration", "show", "HEAD:shared.txt"), "first");
    assert.equal(git("integration", "show", "HEAD:independent.txt"), "third");
    assert.equal(manifest.triggerPr, undefined, "unrelated triggering PR must not be reported");
    assert.equal(existsSync("state/source.tar"), true);
    assert.equal(git("integration", "status", "--porcelain"), "");
    await fresh({ github, context, core });
    assert.equal(outputs.fresh, "true");
    await record({ github, context });
    assert.equal(deployments[0].ref, base);
    assert.equal(deployments[0].auto_merge, false);
    assert.deepEqual(deployments[0].required_contexts, []);
    assert.equal(statuses[0].state, "success");
    const saved = await lastSuccess(github, repo);
    assert.equal(fingerprint(saved), fingerprint(manifest));
    assert.equal(saved.prs[0].commits, undefined, "durable ledger is compact");
    // Identical metadata event skips work before trying to recreate the integration checkout.
    await compose({ github, context, core });
    assert.equal(outputs.relevant, "false");
    pulls = pulls.filter((pr) => pr.number !== 1);
    await fresh({ github, context, core });
    assert.equal(outputs.fresh, "false");
    // Force-push race: API snapshot and fetched PR ref disagree; do not deploy another SHA.
    rmSync("integration", { recursive: true, force: true });
    pulls[0].head.sha = base;
    await assert.rejects(compose({ github, context, core }), /changed during collection/);
    rmSync("integration", { recursive: true, force: true });
    pulls = [];
    await compose({ github, context, core });
    const empty = read("state/manifest.json");
    assert.deepEqual(empty.prs, []);
    assert.equal(empty.integration, base, "removing every label returns the preview to main");
  } finally {
    process.chdir(original);
    rmSync(root, { recursive: true, force: true });
  }
});
