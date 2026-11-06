import { readFile } from "node:fs/promises";
import { analyseSource } from "../../../scripts/audit-i18n.mjs";

/** The caller supplies git's tracked/unignored file list, avoiding generated and vendored bundles. */
export function isSourceFile(file, includeSupporting = false) {
  if (!/\.(?:[cm]?[jt]sx?)$/.test(file) || /\.d\.[cm]?ts$/.test(file)) return false;
  if (/(?:^|\/)(?:[^/]+\.)?config\.[^/]+$/.test(file)) return false;
  if (/(?:^|\/)(?:node_modules|dist|build|out|coverage|fixtures|__fixtures__|vendor|public)\//.test(file)) return false;
  if (file.split("/").some((part) => part.startsWith("."))) return false;
  if (
    !includeSupporting &&
    /(?:\.(?:test|spec|stories)\.[^/]+$|\/(?:__tests__|tests|playwright|storybook|docs|tutorials|examples)\/)/.test(
      file
    )
  )
    return false;
  return true;
}

export async function scanModule(root, path, sourceFiles, revision) {
  const entries = [];
  for (const file of sourceFiles.filter((file) => file.startsWith(`${path}/`) && isSourceFile(file, true)).sort()) {
    let source;
    try {
      source = await readFile(new URL(file, root), "utf8");
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    entries.push({ file, lines: source.split("\n").length, ...analyseSource(file, source) });
  }
  function report(includeSupporting) {
    const selected = entries.filter((entry) => isSourceFile(entry.file, includeSupporting));
    const candidates = selected.flatMap((entry) => entry.candidates);
    const counts = new Map();
    for (const item of candidates) counts.set(item.file, (counts.get(item.file) || 0) + 1);
    const errors = selected.flatMap((entry) => entry.errors);
    return {
      revision,
      candidates,
      errors,
      risks: selected.flatMap((entry) => entry.risks),
      byFile: [...counts]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      summary: {
        filesScanned: selected.length,
        linesScanned: selected.reduce((sum, entry) => sum + entry.lines, 0),
        candidateOccurrences: candidates.length,
        distinctCandidateTexts: new Set(candidates.map((item) => item.text)).size,
        filesWithCandidates: counts.size,
        parseErrors: errors.length,
      },
    };
  }
  return { primary: report(false), supporting: report(true) };
}
