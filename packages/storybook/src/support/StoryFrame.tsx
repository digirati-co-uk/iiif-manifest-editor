import { useId, useMemo, type ReactNode } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-json";

Prism.manual = true;

export interface StoryFrameProps {
  title: string;
  summary?: string;
  source?: string;
  onReset?: () => void;
  children: ReactNode;
}

export function StoryFrame({ title, summary, source, onReset, children }: StoryFrameProps) {
  const id = useId();
  return (
    <section className="sb-frame" aria-labelledby={`${id}-title`}>
      <header className="sb-header">
        <h1 id={`${id}-title`} className="sb-title">
          {title}
        </h1>
        {summary || source || onReset ? (
          <div className="sb-actions">
            {summary ? (
              <details className="sb-details">
                <summary>About</summary>
                <p>{summary}</p>
              </details>
            ) : null}
            {source ? (
              <a className="sb-link" href={source} target="_blank" rel="noopener noreferrer">
                View source<span className="sb-visually-hidden"> of {title} (opens in new tab)</span>
                <span aria-hidden="true"> ↗</span>
              </a>
            ) : null}
            {onReset ? (
              <button type="button" className="sb-button" onClick={onReset}>
                Reset
              </button>
            ) : null}
          </div>
        ) : null}
      </header>
      <div className="sb-body">{children}</div>
    </section>
  );
}

export interface JsonPanelProps {
  value: unknown;
  title?: string;
}

function stringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2) ?? "undefined";
  } catch (e) {
    return `Unable to serialise: ${(e as Error).message}`;
  }
}

export function JsonPanel({ value, title = "JSON" }: JsonPanelProps) {
  const id = useId();
  const highlighted = useMemo(() => Prism.highlight(stringify(value), Prism.languages.json!, "json"), [value]);
  return (
    <aside className="sb-json" aria-labelledby={id}>
      <h2 id={id} className="sb-json-title">
        {title}
      </h2>
      {/* tabIndex lets keyboard users scroll the overflowing region */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <pre className="sb-json-pre" tabIndex={0} aria-labelledby={id}>
        <code className="language-json" dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </aside>
  );
}
