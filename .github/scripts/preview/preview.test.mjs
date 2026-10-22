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

test("selects all labelled open main PRs, including drafts, in numeric order", () => {
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
    [2, 10]
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

test("comments distinguish failed candidates from the live deployment and escape conflict text", () => {
  const manifest = {
    base: "new",
    run: "https://example.com/run",
    prs: [
      { number: 1, head: "aaa", status: "included", commits: ["aaa"] },
      { number: 2, head: "bbb", status: "conflict", paths: ["<path>"], diagnostics: "</pre>hello" },
    ],
  };
  const body = comment(manifest, { base: "old", prs: [], run: "https://example.com/old" }, 2, "failed");
  assert.match(body, /Currently deployed[\s\S]*old/);
  assert.match(body, /Latest candidate[\s\S]*new/);
  assert.match(body, /plus #1/);
  assert.match(body, /&lt;path&gt;/);
  assert.match(comment(manifest, null, 3, "failed"), /no longer selected separately/);
});

test("snapshot uses pagination and captures main SHA", async () => {
  const github = {
    rest: { repos: { getCommit: async () => ({ data: { sha: "base" } }) }, pulls: { list: "pulls" } },
    paginate: async (method, options) => {
      assert.equal(method, "pulls");
      assert.equal(options.per_page, 100);
      return [pull(10), pull(2)];
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
  const { report, marker } = await import("./preview.mjs");
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
    assert.match(created[0].body, /published, but deployment bookkeeping failed/);
    assert.match(created[0].body, /Currently deployed[\s\S]*#1/);
    assert.match(created[1].body, /no longer selected separately/);
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

test("compose, freshness, and deployment ledger round-trip with real Git refs", async () => {
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
    git(".", "checkout", "-b", "third", base);
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
    let pulls = [pull(3), pull(2), pull(1)].map((pr) => ({
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
