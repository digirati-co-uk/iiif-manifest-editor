import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const environment = "shared-preview";
export const url = "https://manifest-editor-preview.digirati.workers.dev";
export const marker = "<!-- manifest-editor:shared-preview -->";
const save = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2));
export const read = (path) => JSON.parse(readFileSync(path, "utf8"));

export function git(cwd, ...args) {
  const result = spawnSync("git", ["-c", "core.hooksPath=/dev/null", ...args], {
    cwd,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
  if (result.error || result.status !== 0) {
    throw new Error(`git ${args[0]} failed: ${result.error || result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

export function select(pulls, repository) {
  return pulls
    .filter(
      (pr) =>
        pr.state === "open" &&
        pr.head.repo?.full_name === repository &&
        pr.labels.some((label) => label.name === "deploy")
    )
    .sort((a, b) => a.number - b.number)
    .map((pr) => ({
      number: pr.number,
      title: pr.title,
      head: pr.head.sha,
      branch: pr.head.ref,
      repository: pr.head.repo?.full_name,
    }));
}

export async function snapshot(github, repo) {
  const main = await github.rest.repos.getCommit({ ...repo, ref: "main" });
  const pulls = await github.paginate(github.rest.pulls.list, {
    ...repo,
    state: "open",
    per_page: 100,
  });
  return { base: main.data.sha, prs: select(pulls, `${repo.owner}/${repo.repo}`) };
}

export function fingerprint(manifest) {
  return JSON.stringify([manifest.base, manifest.prs.map((pr) => [pr.number, pr.head])]);
}

// Explicit/manual and main-push runs can retry unchanged inputs. PR metadata-only
// changes do not rebuild a successful snapshot. Drift still reconciles coalesced events.
export function shouldCompose(eventName, previous, manifest) {
  if (eventName !== "pull_request_target") return true;
  if (!previous) return manifest.prs.length > 0;
  return fingerprint(previous) !== fingerprint(manifest);
}

// Search successful statuses, including inactive deployments superseded by a later one.
export async function lastSuccess(github, repo) {
  for await (const page of github.paginate.iterator(github.rest.repos.listDeployments, {
    ...repo,
    environment,
    per_page: 100,
  })) {
    for (const deployment of page.data) {
      const payload =
        typeof deployment.payload === "string" ? JSON.parse(deployment.payload || "{}") : deployment.payload;
      if (payload?.schema !== 1) continue;
      const statuses = await github.paginate(github.rest.repos.listDeploymentStatuses, {
        ...repo,
        deployment_id: deployment.id,
        per_page: 100,
      });
      if (statuses.some((status) => status.state === "success")) return payload;
    }
  }
  return null;
}

export function mergePr(cwd, pr) {
  const before = git(cwd, "rev-parse", "HEAD");
  const result = spawnSync(
    "git",
    ["-c", "core.hooksPath=/dev/null", "merge", "--no-ff", "--no-edit", "--no-stat", pr.head],
    {
      cwd,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    }
  );
  if (result.error) throw result.error;
  if (result.status === 0) {
    const commits = git(cwd, "rev-list", "--reverse", `${before}..${pr.head}`).split("\n").filter(Boolean);
    return { ...pr, status: "included", commits, integration: git(cwd, "rev-parse", "HEAD") };
  }
  const paths = git(cwd, "diff", "--name-only", "--diff-filter=U", "-z").split("\0").filter(Boolean);
  if (!paths.length) throw new Error(`Merge of #${pr.number} failed: ${result.stderr}\n${result.stdout}`);
  const diagnostics = `${result.stdout}\n${result.stderr}`;
  git(cwd, "merge", "--abort");
  if (git(cwd, "rev-parse", "HEAD") !== before || git(cwd, "status", "--porcelain")) {
    throw new Error(`Merge abort did not restore the checkout after #${pr.number}`);
  }
  return { ...pr, status: "conflict", paths, diagnostics, against: before };
}

export async function compose({ github, context, core }) {
  const repo = context.repo;
  const previous = await lastSuccess(github, repo);
  const manifest = await snapshot(github, repo);
  // An unrelated event can replace a pending relevant event in the concurrency queue.
  // Reconcile any drift even when this particular event is not deployment-related.
  const relevant = shouldCompose(context.eventName, previous, manifest);
  core.setOutput("relevant", String(Boolean(relevant)));
  if (!relevant) return;
  mkdirSync("state", { recursive: true });
  save("state/previous.json", previous);
  Object.assign(manifest, {
    schema: 1,
    url,
    run: `${context.serverUrl}/${repo.owner}/${repo.repo}/actions/runs/${context.runId}`,
    createdAt: new Date().toISOString(),
  });
  save("state/manifest.json", manifest);
  const cwd = resolve("integration");
  git(".", "clone", "--no-hardlinks", ".", cwd);
  git(cwd, "config", "user.name", "github-actions[bot]");
  git(cwd, "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com");
  // Checkout credentials are available only in this read-only composition job.
  git(cwd, "remote", "set-url", "origin", `${context.serverUrl}/${repo.owner}/${repo.repo}.git`);
  const auth = git(".", "config", "--get-regexp", "^http\\..*\\.extraheader$");
  for (const line of auth.split("\n").filter(Boolean)) {
    const split = line.indexOf(" ");
    git(cwd, "config", line.slice(0, split), line.slice(split + 1));
  }
  git(cwd, "fetch", "origin", manifest.base);
  git(cwd, "checkout", "--detach", manifest.base);
  for (let index = 0; index < manifest.prs.length; index++) {
    const pr = manifest.prs[index];
    git(cwd, "fetch", "origin", `refs/pull/${pr.number}/head`);
    if (git(cwd, "rev-parse", "FETCH_HEAD") !== pr.head) {
      throw new Error(`#${pr.number} changed during collection; rerun the workflow.`);
    }
    manifest.prs[index] = mergePr(cwd, pr);
    save("state/manifest.json", manifest);
  }
  manifest.integration = git(cwd, "rev-parse", "HEAD");
  manifest.tree = git(cwd, "rev-parse", "HEAD^{tree}");
  save("state/manifest.json", manifest);
  git(cwd, "archive", "--format=tar", `--output=${resolve("state/source.tar")}`, "HEAD");
}

export async function fresh({ github, context, core }) {
  const current = await snapshot(github, context.repo);
  core.setOutput("fresh", String(fingerprint(current) === fingerprint(read("state/manifest.json"))));
}

export async function record({ github, context }) {
  const manifest = read("state/manifest.json");
  // Keep the durable payload compact; the artifact contains complete commit lists/logs.
  const payload = {
    ...manifest,
    deployedAt: new Date().toISOString(),
    cloudflareVersion: process.env.CLOUDFLARE_VERSION || null,
    prs: manifest.prs.map(({ diagnostics, commits, paths, ...pr }) => pr),
  };
  const deployment = await github.rest.repos.createDeployment({
    ...context.repo,
    ref: manifest.base,
    environment,
    auto_merge: false,
    required_contexts: [],
    transient_environment: false,
    production_environment: false,
    payload,
    description: "Combined deploy-labelled pull requests",
  });
  if (!deployment.data.id) throw new Error("GitHub did not create a deployment");
  await github.rest.repos.createDeploymentStatus({
    ...context.repo,
    deployment_id: deployment.data.id,
    state: "success",
    environment_url: url,
    log_url: manifest.run,
    auto_inactive: true,
  });
}

const limit = 60000;
const escape = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("`", "&#96;");
const short = (sha) => `\`${String(sha).slice(0, 7)}\``;
const refs = (prs) => prs.map((pr) => `#${pr.number}`).join(", ");
const included = (manifest) => manifest?.prs.filter((pr) => pr.status === "included") || [];
const cell = (pr) =>
  !pr
    ? "—"
    : pr.status === "included"
      ? `✅ ${short(pr.head)}`
      : pr.status === "conflict"
        ? "⚠️ conflict"
        : "❔ not processed";
const labels = {
  deployed: "✅ Deployed",
  bookkeeping: "⚠️ Published, but deployment bookkeeping failed — rerun the entire workflow",
  superseded: "⏭️ Superseded by newer changes; not deployed",
  failed: "❌ Failed",
};

// Attempt result from the workflow job outputs. What is live is derived separately.
export function outcome(env = process.env) {
  if (env.PUBLISH_RESULT === "success" && env.DEPLOY_RESULT !== "success") return { state: "bookkeeping" };
  if (env.DEPLOY_RESULT === "success" && env.FRESH === "true") return { state: "deployed" };
  if (env.FRESH === "false") return { state: "superseded" };
  return { state: "failed", step: env.FAILED_STEP || null };
}

// Per-PR headline and detail; "live" claims come only from the live manifest.
function status(number, pr, live, state) {
  const deployed = live?.prs.find((item) => item.number === number && item.status === "included");
  const current = deployed && pr?.status === "included" && deployed.head === pr.head;
  const older = deployed ? `an older head ${short(deployed.head)} is live` : "it is not live";
  if (pr?.status === "conflict") {
    return [
      `⚠️ #${number} skipped: merge conflict`,
      `⚠️ Skipped (merge conflict); ${deployed ? `an earlier head ${short(deployed.head)} is still live` : "not live"}`,
    ];
  }
  if (current) return [`✅ #${number} is live`, `✅ Live at ${short(pr.head)}`];
  if (pr?.status === "included") {
    return state === "superseded"
      ? [
          `⏳ #${number} is not live yet`,
          `⏳ Merged cleanly at ${short(pr.head)}, but ${older}; a newer run will pick it up`,
        ]
      : [`❌ Preview failed — #${number} is not live`, `❌ Merged cleanly at ${short(pr.head)}, but ${older}`];
  }
  if (!pr) {
    return deployed
      ? [
          `➖ #${number} deselected — still live`,
          `➖ No longer selected, but still live until the next successful deployment`,
        ]
      : [
          `➖ #${number} removed from the dev preview`,
          "➖ No longer selected. If merged, its changes may be in the main baseline",
        ];
  }
  return [`❌ Preview failed — #${number} was not processed`, `❌ Not processed; ${older}`];
}

function table(manifest, live, number, same) {
  const numbers = [...new Set([...manifest.prs, ...(same ? [] : live?.prs || [])].map((pr) => pr.number))].sort(
    (a, b) => a - b
  );
  const find = (source, value) => source?.prs.find((pr) => pr.number === value);
  const label = (value) => (value === number ? `**#${value}** (this PR)` : `#${value}`);
  if (same) {
    return [
      "| | Live on dev site |",
      "|---|---|",
      `| main | ${short(live.base)} |`,
      ...numbers.map((value) => `| ${label(value)} | ${cell(find(live, value))} |`),
    ];
  }
  return [
    "| | Live on dev site | Latest attempt (not live) |",
    "|---|---|---|",
    `| main | ${live ? short(live.base) : "—"} | ${short(manifest.base)} |`,
    ...numbers.map(
      (value) => `| ${label(value)} | ${live ? cell(find(live, value)) : "—"} | ${cell(find(manifest, value))} |`
    ),
  ];
}

function conflict(manifest, pr) {
  const preceding = included(manifest).filter((item) => item.number < pr.number);
  const files = `${pr.paths.length} file${pr.paths.length === 1 ? "" : "s"}`;
  const paths = pr.paths.slice(0, 100).map(escape);
  if (pr.paths.length > 100) paths.push(`… ${pr.paths.length - 100} more in the workflow artifact`);
  return {
    summary: [
      `**Merge conflict** in ${files} against main ${short(manifest.base)}${preceding.length ? ` plus ${refs(preceding)}` : ""}. PRs merge in ascending number order; resolve against those and push to retry.`,
      "",
    ],
    details: [
      "<details><summary>Conflicting files and merge output</summary>",
      "",
      "<pre>",
      ...paths,
      "",
      escape(String(pr.diagnostics ?? "").slice(0, 6000)),
      "</pre>",
      "</details>",
      "",
    ],
  };
}

function commits(manifest, live, same) {
  const lines = [
    "<details><summary>Exact SHAs and commits</summary>",
    "",
    `**Latest attempt** — main \`${manifest.base}\``,
    "",
  ];
  for (const item of included(manifest)) {
    const list = item.commits || [];
    lines.push(`- #${item.number} head \`${item.head}\` — ${list.length} new commit${list.length === 1 ? "" : "s"}`);
    lines.push(...list.slice(0, 100).map((sha) => `  - \`${sha}\``));
    if (list.length > 100) lines.push(`  - … ${list.length - 100} more in the workflow artifact`);
  }
  if (!included(manifest).length) lines.push("- No PRs; main only.");
  if (live && !same) {
    lines.push("", `**Live** — main \`${live.base}\``, "");
    lines.push(...included(live).map((item) => `- #${item.number} head \`${item.head}\``));
    if (!included(live).length) lines.push("- No PRs; main only.");
  }
  lines.push("", "</details>");
  return lines;
}

export function comment(manifest, live, number, { state, step }) {
  // One column when the live snapshot is the attempted one; otherwise show both side by side.
  const same = Boolean(live) && fingerprint(live) === fingerprint(manifest);
  const pr = manifest.prs.find((item) => item.number === number);
  const [title, detail] = status(number, pr, live, state);
  const attempt = `${labels[state]}${step ? ` at ${escape(step)}` : ""}`;
  const head = [
    marker,
    `## ${title}`,
    "",
    `**[Open the shared dev preview ↗](${url})**`,
    "",
    `- **This PR:** ${detail}.`,
    `- **Latest attempt:** ${attempt} · [workflow run](${manifest.run})`,
    live
      ? `- **Live deployment:** ${escape(live.deployedAt || live.createdAt || "time unknown")}${included(live).length ? "" : " · main only"} · [deployment run](${live.run})`
      : "- **Live deployment:** none yet — no successful deployment has been recorded by this workflow.",
    "",
  ];
  const block = pr?.status === "conflict" ? conflict(manifest, pr) : { summary: [], details: [] };
  const essentials = [...head, ...block.summary, ...table(manifest, live, number, same), ""];
  const omitted = (what) => [`_${what} omitted for length; see the [workflow run](${manifest.run}) artifact._`, ""];
  // Bound GitHub's comment size: drop detail sections before touching the status summary.
  for (const parts of [
    [block.details, commits(manifest, live, same)],
    [block.details, omitted("Commit list")],
    [block.summary.length ? omitted("Conflict output") : [], omitted("Commit list")],
  ]) {
    const body = [...essentials, ...parts.flat()].join("\n");
    if (body.length < limit) return body;
  }
  return `${essentials.join("\n").slice(0, limit - 200)}\n\n_Truncated; see the [workflow run](${manifest.run})._`;
}

export async function report({ github, context, core }) {
  const manifest = read("state/manifest.json");
  const previous = read("state/previous.json");
  const recorded = await lastSuccess(github, context.repo);
  const published = process.env.PUBLISH_RESULT === "success";
  const live = published ? { ...manifest, deployedAt: process.env.DEPLOYED_AT } : recorded;
  const result = outcome();
  const numbers = new Set([...manifest.prs, ...(previous?.prs || [])].map((pr) => pr.number));
  const failures = [];
  for (const number of numbers) {
    try {
      const comments = await github.paginate(github.rest.issues.listComments, {
        ...context.repo,
        issue_number: number,
        per_page: 100,
      });
      const existing = comments.find(
        (item) => item.user?.login === "github-actions[bot]" && item.body?.includes(marker)
      );
      const body = comment(manifest, live, number, result);
      if (existing) await github.rest.issues.updateComment({ ...context.repo, comment_id: existing.id, body });
      else await github.rest.issues.createComment({ ...context.repo, issue_number: number, body });
    } catch (error) {
      failures.push(`#${number}: ${error.message}`);
    }
  }
  if (failures.length) core.setFailed(failures.join("\n"));
}
