import type { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

/**
 * Same `--exhibition-*` tokens (and fallbacks) as `simpleLayoutColours` in SlideBehaviours. Kept local so the
 * audio panels' building blocks do not pull the whole layout editor (and its map/viewer dependencies) in.
 */
export const simpleLayoutColours = {
  primary: "var(--exhibition-primary, #b84c74)",
  fieldBorder: "var(--exhibition-field-border, #dcd5ce)",
  fieldBackground: "var(--exhibition-field-bg, #f8f6f3)",
  text: "var(--exhibition-text, #25211f)",
  muted: "var(--exhibition-muted, #6a625c)",
  buttonText: "var(--exhibition-button-text, #ffffff)",
  inactiveButtonText: "var(--exhibition-inactive-button-text, #332f2c)",
};

/**
 * Small presentational pieces shared by the audio slide tabs, so Exhibition / Layout / Images read as one family
 * with the image-slide panels (same warm border + surface tokens as SimpleCheckbox / ReadonlyExhibitionSummary).
 */
export function AudioPanelSection({
  title,
  description,
  children,
  label,
  tone = "card",
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  label?: string;
  tone?: "card" | "plain";
}) {
  return (
    <section
      aria-label={label || title}
      className={twMerge("flex flex-col gap-3", tone === "card" && "rounded-md border bg-white p-4")}
      style={tone === "card" ? { borderColor: simpleLayoutColours.fieldBorder } : undefined}
    >
      <div>
        <h3 className="text-sm font-semibold" style={{ color: simpleLayoutColours.text }}>
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed" style={{ color: simpleLayoutColours.muted }}>
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function AudioHint({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs leading-relaxed" style={{ color: simpleLayoutColours.muted }}>
      {children}
    </p>
  );
}

export function AudioStatus({ tone, children }: { tone: "ok" | "muted"; children: ReactNode }) {
  return (
    <div
      className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold"
      style={{
        backgroundColor: tone === "ok" ? "#f1f8f3" : simpleLayoutColours.fieldBackground,
        borderColor: tone === "ok" ? "#b9dcc3" : simpleLayoutColours.fieldBorder,
        color: tone === "ok" ? "#1f6a37" : simpleLayoutColours.muted,
      }}
    >
      <span
        aria-hidden="true"
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: tone === "ok" ? "#2f9e55" : "#b7aea6" }}
      />
      {children}
    </div>
  );
}

export function AudioAlert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">
      {children}
    </p>
  );
}

type AudioButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" };

/** Button treatments used in the exhibition panels: filled brand colour, outlined, and destructive outline. */
export function AudioButton({ variant = "secondary", className, style, ...props }: AudioButtonProps) {
  const primary = variant === "primary";
  return (
    <button
      type="button"
      {...props}
      className={twMerge(
        "min-h-10 rounded-md border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        !primary && "hover:bg-[#f8f6f3]",
        className
      )}
      style={{
        backgroundColor: primary ? simpleLayoutColours.primary : simpleLayoutColours.buttonText,
        borderColor: primary ? simpleLayoutColours.primary : variant === "danger" ? "#e3b4b4" : simpleLayoutColours.fieldBorder,
        color: primary ? simpleLayoutColours.buttonText : variant === "danger" ? "#a12626" : simpleLayoutColours.inactiveButtonText,
        ...style,
      }}
    />
  );
}

export function formatAudioDuration(seconds?: number | null) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

/** "example.org · recording.mp3" without the query string, for a compact source line. */
export function describeAudioSource(url: string) {
  try {
    const parsed = new URL(url);
    const file = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || "");
    return { host: parsed.host, file: file || parsed.host };
  } catch {
    return { host: "", file: url };
  }
}
