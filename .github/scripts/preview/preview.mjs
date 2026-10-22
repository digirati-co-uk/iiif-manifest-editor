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
        pr.base.ref === "main" &&
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
    base: "main",
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

const escape = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("`", "&#96;");
const list = (manifest) =>
  manifest.prs
    .filter((pr) => pr.status === "included")
    .map((pr) => `- #${pr.number} — \`${pr.head}\``)
    .join("\n") || "- No PRs; main only.";

export function comment(manifest, live, number, outcome) {
  const pr = manifest.prs.find((pr) => pr.number === number);
  const lines = [
    marker,
    "## Shared dev preview",
    "",
    `[Dev site](${url})`,
    "",
    `Latest attempt: **${outcome}** — [workflow and full manifest](${manifest.run}).`,
    "",
  ];
  if (pr?.status === "conflict") {
    const preceding = manifest.prs.filter((item) => item.number < number && item.status === "included");
    lines.push(
      `**This PR was skipped: merge conflict** against main \`${manifest.base}\`${preceding.length ? ` plus ${preceding.map((item) => `#${item.number}`).join(", ")}` : ""}.`,
      "",
      ...pr.paths.slice(0, 100).map((path) => `- \`${escape(path)}\``),
      "",
      "<details><summary>Merge details</summary>",
      "",
      "<pre>",
      escape(pr.diagnostics).slice(0, 6000),
      "</pre>",
      "</details>",
      ""
    );
  } else if (!pr) {
    lines.push("This PR is no longer selected separately. If merged, its changes may be in the main baseline.", "");
  } else {
    lines.push(
      pr.status === "included"
        ? "This PR merged into the candidate successfully."
        : "This PR was not processed completely.",
      ""
    );
  }
  if (live) {
    lines.push(
      `### Currently deployed`,
      "",
      `Base: \`${live.base}\``,
      "",
      list(live),
      "",
      `Deployed: ${live.deployedAt || live.createdAt}. [Deployment run](${live.run}).`,
      ""
    );
  } else {
    lines.push("No successful deployment has been recorded by this workflow yet.", "");
  }
  lines.push(
    "### Latest candidate",
    "",
    `Base: \`${manifest.base}\``,
    "",
    list(manifest),
    "",
    `Skipped: ${
      manifest.prs
        .filter((item) => item.status === "conflict")
        .map((item) => `#${item.number}`)
        .join(", ") || "none"
    }.`,
    "",
    "<details><summary>Latest candidate commits (up to 100 per PR)</summary>",
    ""
  );
  for (const item of manifest.prs.filter((item) => item.status === "included")) {
    lines.push(`**#${item.number}**`, ...item.commits.slice(0, 100).map((sha) => `- \`${sha}\``), "");
  }
  lines.push("</details>");
  // Bound GitHub's comment size while preserving the current deployment section.
  const body = lines.join("\n");
  return body.length < 60000 ? body : `${body.slice(0, 59000)}\n\n… Full details in the workflow artifact.\n</details>`;
}

export async function report({ github, context, core }) {
  const manifest = read("state/manifest.json");
  const previous = read("state/previous.json");
  const recorded = await lastSuccess(github, context.repo);
  const published = process.env.PUBLISH_RESULT === "success";
  const live = published ? { ...manifest, deployedAt: process.env.DEPLOYED_AT } : recorded;
  const outcome =
    published && process.env.DEPLOY_RESULT !== "success"
      ? "published, but deployment bookkeeping failed; see workflow logs"
      : process.env.DEPLOY_RESULT === "success" && process.env.FRESH === "true"
        ? "deployed"
        : process.env.FRESH === "false"
          ? "superseded; not deployed"
          : `failed${process.env.FAILED_STEP ? ` at ${process.env.FAILED_STEP}` : ""}; see workflow logs`;
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
      const body = comment(manifest, live, number, outcome);
      if (existing) await github.rest.issues.updateComment({ ...context.repo, comment_id: existing.id, body });
      else await github.rest.issues.createComment({ ...context.repo, issue_number: number, body });
    } catch (error) {
      failures.push(`#${number}: ${error.message}`);
    }
  }
  if (failures.length) core.setFailed(failures.join("\n"));
}
