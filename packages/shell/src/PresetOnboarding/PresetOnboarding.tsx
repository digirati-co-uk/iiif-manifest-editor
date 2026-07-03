import { ActionButton, Modal } from "@manifest-editor/components";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "../AppContext/AppContext";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import { PreviewButton } from "../PreviewButton/PreviewButton";

const reopenEvent = "manifest-editor:preset-onboarding:open";

function isDismissed(key: string) {
  return typeof window !== "undefined" && window.localStorage.getItem(key) === "true";
}

function setDismissed(key: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, "true");
  }
}

export function getPresetOnboardingDismissalKey(
  onboarding: { id: string; mode: "global" | "per-resource" },
  resource?: { id: string; type: string },
) {
  if (onboarding.mode === "global" || !resource) {
    return `preset-onboarding/${onboarding.id}`;
  }

  return `preset-onboarding/${onboarding.id}/${resource.type}/${resource.id}`;
}

export function useOpenPresetOnboarding() {
  const app = useApp();
  const resource = useAppResource();
  const onboarding = app.preset?.onboarding;
  const dismissalKey = onboarding ? getPresetOnboardingDismissalKey(onboarding, resource) : null;

  return () => window.dispatchEvent(new CustomEvent(reopenEvent, { detail: dismissalKey }));
}

export function PresetOnboardingButton({ className }: { className?: string }) {
  const app = useApp();
  const onboarding = app.preset?.onboarding;
  const openOnboarding = useOpenPresetOnboarding();

  if (!onboarding) return null;

  return (
    <ActionButton className={className} onPress={openOnboarding}>
      {onboarding.openLabel || "Open guide"}
    </ActionButton>
  );
}

export function PresetPreviewButton(props: { downloadEnabled?: boolean; fileName?: string }) {
  const app = useApp();
  const custom = app.preset?.onboarding?.renderPreviewButton;

  if (custom) {
    return custom(props);
  }

  return <PreviewButton {...props} />;
}

export function PresetOnboarding() {
  const app = useApp();
  const resource = useAppResource();
  const onboarding = app.preset?.onboarding;
  const templates = app.preset?.templates || [];
  const dismissalKey = useMemo(
    () => (onboarding ? getPresetOnboardingDismissalKey(onboarding, resource) : null),
    [onboarding, resource],
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!dismissalKey) return;
    setOpen(!isDismissed(dismissalKey));
  }, [dismissalKey]);

  useEffect(() => {
    const reopen = (event: Event) => {
      if ((event as CustomEvent<string | null>).detail === dismissalKey) {
        setOpen(!!onboarding);
      }
    };
    window.addEventListener(reopenEvent, reopen);
    return () => window.removeEventListener(reopenEvent, reopen);
  }, [dismissalKey, onboarding]);

  if (!onboarding || !dismissalKey || !open) return null;

  const dismiss = () => {
    setDismissed(dismissalKey);
    setOpen(false);
  };

  return (
    <Modal
      title={onboarding.title}
      onClose={dismiss}
      actions={
        <>
          <ActionButton onPress={dismiss}>{onboarding.dismissLabel || "Dismiss"}</ActionButton>
          <ActionButton primary onPress={dismiss}>
            {onboarding.primaryLabel || "Continue"}
          </ActionButton>
        </>
      }
    >
      <div className="flex flex-col gap-4 p-6">
        {onboarding.summary ? <p className="text-sm text-gray-600">{onboarding.summary}</p> : null}
        {onboarding.renderBody({ templates, dismiss })}
      </div>
    </Modal>
  );
}
