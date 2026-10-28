import type { MessageReference } from "@manifest-editor/i18n/core";
import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { manifestMessage } from "../i18n";
import { Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { type LayoutPanel, type PluginMetadata, useLayoutActions } from "@manifest-editor/shell";
import type { SVGProps } from "react";
import { useManifest, useVaultSelector } from "react-iiif-vault";

type IssueSeverity = "error" | "warning" | "info";

type QualityIssue = {
  id: string;
  severity: IssueSeverity;
  title: string;
  titleMessage?: MessageReference;
  detail: string;
  detailMessage?: MessageReference;
  resource?: { id: string; type: string };
  index?: number;
};

type QualityReport = {
  canvasCount: number;
  paintingAnnotationCount: number;
  issues: QualityIssue[];
};

export default {
  id: "@manifest-editor/manifest-quality-checks",
  label: "Manifest Quality Checks",
  labelMessage: manifestMessage("workflow.manifestQualityChecks"),
  description: "Review common IIIF completeness and presentation issues before publishing.",
  descriptionMessage: manifestMessage("workflow.qualitySummary"),
  author: "Digirati",
  official: true,
  localisation: { requiredNamespaces: ["manifest"] },
  defaultEnabled: false,
  tags: ["quality", "validation", "publishing"],
  supports: {
    projectTypes: ["Manifest"],
  },
} satisfies PluginMetadata;

export const leftPanels: LayoutPanel[] = [
  {
    id: "manifest-quality-checks",
    label: "Quality",
    labelMessage: manifestMessage("workflow.quality"),
    icon: <QualityChecksIcon />,
    render: () => <ManifestQualityChecksPanel />,
  },
];

function QualityChecksIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="m10.6 16.6l7.05-7.05l-1.4-1.4l-5.65 5.65l-2.85-2.85l-1.4 1.4zM12 22q-3.475-.875-5.738-3.988T4 11.1V5l8-3l8 3v6.1q0 3.8-2.262 6.912T12 22m0-2.1q2.6-.825 4.3-3.3t1.7-5.5V6.4l-6-2.25L6 6.4v4.7q0 3.025 1.7 5.5t4.3 3.3"
      />
    </svg>
  );
}

function ManifestQualityChecksPanel() {
  const t = useTranslations("manifest");
  const { locale, profile } = useEditorI18n();
  const manifest = useManifest();
  const actions = useLayoutActions();
  const report = useVaultSelector(
    (_, vault) => createQualityReport(manifest, vault, t),
    [manifest?.id, manifest?.items?.length, locale, profile, t]
  );
  const counts = countBySeverity(report.issues);

  const openIssue = (issue: QualityIssue) => {
    if (!manifest?.id) return;

    if (issue.resource?.type === "Canvas") {
      actions.open("current-canvas");
      actions.edit(
        issue.resource,
        {
          parent: { id: manifest.id, type: "Manifest" },
          property: "items",
          index: issue.index,
        },
        { forceOpen: true }
      );
      return;
    }

    actions.edit({ id: manifest.id, type: "Manifest" }, undefined, { forceOpen: true });
  };

  return (
    <Sidebar>
      <SidebarHeader title={t("workflow.qualityChecks")} />
      <SidebarContent className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <SummaryMetric label={t("workflow.errors")} value={counts.error} tone="error" />
          <SummaryMetric label={t("workflow.warnings")} value={counts.warning} tone="warning" />
          <SummaryMetric label={t("workflow.info")} value={counts.info} tone="info" />
        </div>

        <div className="rounded border border-gray-200 bg-white p-3 text-sm text-gray-700">
          <div className="font-medium text-gray-900">{t("workflow.manifestCoverage")}</div>
          <div className="mt-1">
            {t(
              report.paintingAnnotationCount === 1
                ? "workflow.qualityCoverageOneAnnotation"
                : "workflow.qualityCoverageAnnotations",
              { count: report.canvasCount, annotations: report.paintingAnnotationCount }
            )}
          </div>
        </div>

        {report.issues.length ? (
          <div className="flex flex-col gap-2">
            {report.issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onOpen={() => openIssue(issue)} />
            ))}
          </div>
        ) : (
          <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-900">
            {t("workflow.noCommonPublishingIssuesFound")}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function SummaryMetric({ label, value, tone }: { label: string; value: number; tone: IssueSeverity }) {
  const className =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-900"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-blue-200 bg-blue-50 text-blue-900";

  return (
    <div className={`rounded border p-2 ${className}`}>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

function IssueCard({ issue, onOpen }: { issue: QualityIssue; onOpen: () => void }) {
  const t = useTranslations("manifest");
  const { resolveMessage } = useEditorI18n();
  const badgeClass =
    issue.severity === "error"
      ? "bg-red-100 text-red-800"
      : issue.severity === "warning"
        ? "bg-amber-100 text-amber-800"
        : "bg-blue-100 text-blue-800";

  return (
    <div className="rounded border border-gray-200 bg-white p-3 text-sm">
      <div className="flex items-start gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${badgeClass}`}>
          {t(`workflow.severity.${issue.severity}`)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900">{resolveMessage(issue.titleMessage, issue.title)}</div>
          <div className="mt-1 text-gray-600">{resolveMessage(issue.detailMessage, issue.detail)}</div>
        </div>
      </div>
      {issue.resource ? (
        <button className="mt-3 text-sm font-medium text-me-primary-600 hover:underline" type="button" onClick={onOpen}>
          {t(issue.resource.type === "Canvas" ? "workflow.openCanvas" : "workflow.openManifest")}
        </button>
      ) : null}
    </div>
  );
}

function countBySeverity(issues: QualityIssue[]) {
  return issues.reduce(
    (counts, issue) => {
      counts[issue.severity] += 1;
      return counts;
    },
    { error: 0, warning: 0, info: 0 } satisfies Record<IssueSeverity, number>
  );
}

export function createQualityReport(
  manifest: any,
  vault: any,
  t?: (key: string, values?: Record<string, string | number>) => string
): QualityReport {
  const issues: QualityIssue[] = [];
  const canvases = manifest?.items ? vault.get(manifest.items) || [] : [];
  let paintingAnnotationCount = 0;

  if (!manifest) {
    return { canvasCount: 0, paintingAnnotationCount: 0, issues };
  }

  if (!hasText(manifest.label)) {
    issues.push({
      id: "manifest-label",
      severity: "error",
      title: "Manifest label is missing",
      titleMessage: manifestMessage("workflow.manifestLabelIsMissing"),
      detail: "Published IIIF resources need a clear label so viewers and search results can identify them.",
      detailMessage: manifestMessage("workflow.qualityLabelHelp"),
      resource: { id: manifest.id, type: "Manifest" },
    });
  }

  if (!canvases.length) {
    issues.push({
      id: "manifest-canvases",
      severity: "warning",
      title: "No canvases",
      titleMessage: manifestMessage("canvas.empty"),
      detail: "A manifest usually needs at least one canvas before it is useful in viewers.",
      detailMessage: manifestMessage("workflow.qualityCanvasHelp"),
      resource: { id: manifest.id, type: "Manifest" },
    });
  }

  if (!manifest.requiredStatement) {
    issues.push({
      id: "manifest-required-statement",
      severity: "warning",
      title: "Required statement is missing",
      titleMessage: manifestMessage("workflow.requiredStatementIsMissing"),
      detail: "Required statements are commonly used for attribution, holding institution, or usage information.",
      detailMessage: manifestMessage("workflow.qualityAttributionHelp"),
      resource: { id: manifest.id, type: "Manifest" },
    });
  }

  if (!manifest.rights) {
    issues.push({
      id: "manifest-rights",
      severity: "info",
      title: "Rights statement is missing",
      titleMessage: manifestMessage("workflow.rightsStatementIsMissing"),
      detail: "Adding a rights URI helps downstream viewers and catalogues communicate reuse conditions.",
      detailMessage: manifestMessage("workflow.qualityRightsHelp"),
      resource: { id: manifest.id, type: "Manifest" },
    });
  }

  for (const [index, canvas] of canvases.entries()) {
    if (!canvas) continue;
    const canvasLabel = getText(
      canvas.label,
      t ? t("workflow.canvasNumber", { number: index + 1 }) : `Canvas ${index + 1}`
    );
    const canvasRef = { id: canvas.id, type: "Canvas" };

    if (!hasText(canvas.label)) {
      issues.push({
        id: `${canvas.id}-label`,
        severity: "warning",
        title: "Canvas label is missing",
        titleMessage: manifestMessage("workflow.canvasLabelIsMissing"),
        detail: `${canvasLabel} will be harder to identify in navigation, search, and range editing.`,
        detailMessage: manifestMessage("workflow.qualityLabelDetail", { label: canvasLabel }),
        resource: canvasRef,
        index,
      });
    }

    if (!canvas.width && !canvas.height && !canvas.duration) {
      issues.push({
        id: `${canvas.id}-dimensions`,
        severity: "warning",
        title: "Canvas dimensions or duration are missing",
        titleMessage: manifestMessage("workflow.qualityDimensionsMissing"),
        detail: `${canvasLabel} does not expose width/height or duration, which can make viewer layout unreliable.`,
        detailMessage: manifestMessage("workflow.qualityDimensionsDetail", { label: canvasLabel }),
        resource: canvasRef,
        index,
      });
    }

    const paintingAnnotations = getPaintingAnnotations(canvas, vault);
    paintingAnnotationCount += paintingAnnotations.length;

    if (!paintingAnnotations.length) {
      issues.push({
        id: `${canvas.id}-painting`,
        severity: "error",
        title: "Canvas has no painting content",
        titleMessage: manifestMessage("workflow.qualityPaintingMissing"),
        detail: `${canvasLabel} has no painting annotation, so viewers may show it as empty.`,
        detailMessage: manifestMessage("workflow.qualityPaintingDetail", { label: canvasLabel }),
        resource: canvasRef,
        index,
      });
      continue;
    }

    for (const [annotationIndex, annotation] of paintingAnnotations.entries()) {
      if (!annotation?.body) {
        issues.push({
          id: `${canvas.id}-painting-${annotationIndex}-body`,
          severity: "error",
          title: "Painting annotation has no body",
          titleMessage: manifestMessage("workflow.qualityBodyMissing"),
          detail: `${canvasLabel} includes a painting annotation without an image, video, audio, or text body.`,
          detailMessage: manifestMessage("workflow.qualityBodyDetail", { label: canvasLabel }),
          resource: canvasRef,
          index,
        });
      }
    }
  }

  return { canvasCount: canvases.length, paintingAnnotationCount, issues };
}

function getPaintingAnnotations(canvas: any, vault: any) {
  const pages = canvas.items ? vault.get(canvas.items) || [] : [];
  const annotations = [];

  for (const page of pages) {
    const pageAnnotations = page?.items ? vault.get(page.items) || [] : [];
    for (const annotation of pageAnnotations) {
      const motivation = Array.isArray(annotation?.motivation) ? annotation.motivation : [annotation?.motivation];
      if (motivation.includes("painting")) {
        annotations.push(annotation);
      }
    }
  }

  return annotations;
}

function hasText(value: any): boolean {
  return getText(value, "").trim().length > 0;
}

function getText(value: any, fallback: string): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || fallback;
  if (typeof value === "object") {
    for (const candidate of Object.values(value)) {
      if (Array.isArray(candidate) && candidate.length) {
        return candidate.filter(Boolean).join(", ");
      }
      if (typeof candidate === "string" && candidate) {
        return candidate;
      }
    }
  }
  return fallback;
}
