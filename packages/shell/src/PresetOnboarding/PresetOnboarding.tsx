import { ActionButton, Modal } from "@manifest-editor/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { useManifest } from "react-iiif-vault";
import { useApp, useAppState, usePresetTemplateSelection } from "../AppContext/AppContext";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import { PreviewButton } from "../PreviewButton/PreviewButton";
import { resolvePresetTemplateSelection } from "./preset-template-selection";

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
  const resource = useAppResource();
  const { state, setState } = useAppState<{ presetOnboardingPreviewHintKey?: string | null }>();
  const onboarding = app.preset?.onboarding;
  const custom = app.preset?.onboarding?.renderPreviewButton;
  const dismissalKey = onboarding ? getPresetOnboardingDismissalKey(onboarding, resource) : null;
  const showOnboardingPreviewHint = !!dismissalKey && state?.presetOnboardingPreviewHintKey === dismissalKey;

  if (custom) {
    return custom({
      ...props,
      preview: app.preset?.preview,
      showOnboardingPreviewHint,
      onOnboardingPreviewHintClose: () => {
        if (showOnboardingPreviewHint) {
          setState({ presetOnboardingPreviewHintKey: null });
        }
      },
    });
  }

  return <PreviewButton {...props} preview={app.preset?.preview} />;
}

export function PresetOnboarding() {
  const app = useApp();
  const resource = useAppResource();
  const onboarding = app.preset?.onboarding;
  const { setState } = useAppState<{ presetOnboardingPreviewHintKey?: string | null }>();
  const templateSelection = usePresetTemplateSelection();
  const manifest = useManifest();
  const resolvedTemplate = resolvePresetTemplateSelection(
    templateSelection.templates,
    templateSelection.selectedTemplateId,
    (manifest?.behavior as string[]) || [],
  );
  const selectedTemplateIdRef = useRef<string | null>(resolvedTemplate?.id || null);
  selectedTemplateIdRef.current = resolvedTemplate?.id || null;
  const dismissalKey = useMemo(
    () => (onboarding ? getPresetOnboardingDismissalKey(onboarding, resource) : null),
    [onboarding, resource],
  );
  const [open, setOpen] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);

  useEffect(() => {
    if (!dismissalKey) return;
    const shouldOpen = !isDismissed(dismissalKey);
    setOpen(shouldOpen);
    setAutoOpened(shouldOpen);
  }, [dismissalKey]);

  useEffect(() => {
    const reopen = (event: Event) => {
      if ((event as CustomEvent<string | null>).detail === dismissalKey) {
        setOpen(!!onboarding);
        setAutoOpened(false);
      }
    };
    window.addEventListener(reopenEvent, reopen);
    return () => window.removeEventListener(reopenEvent, reopen);
  }, [dismissalKey, onboarding]);

  if (!onboarding || !dismissalKey) return null;

  const dismiss = () => {
    templateSelection.setSelectedTemplateId(
      resolvePresetTemplateSelection(templateSelection.templates, selectedTemplateIdRef.current)?.id || null,
    );
    setDismissed(dismissalKey);
    if (autoOpened) {
      setState({ presetOnboardingPreviewHintKey: dismissalKey });
    }
    setOpen(false);
    setAutoOpened(false);
  };

  const setSelectedTemplateId = (id: string | null) => {
    selectedTemplateIdRef.current = id;
    templateSelection.setSelectedTemplateId(id);
  };

  return (
    <Modal
      title={onboarding.title}
      open={open}
      onClose={dismiss}
      actions={
        <div className="flex gap-2">
          <ActionButton onPress={dismiss}>{onboarding.dismissLabel || "Dismiss"}</ActionButton>
          {resolvedTemplate ? (
            <ActionButton primary onPress={dismiss}>
              {onboarding.primaryLabel || "Continue"}
            </ActionButton>
          ) : null}
        </div>
      }
    >
      <div className="flex flex-col gap-4 p-6">
        {onboarding.summary ? <p className="text-sm text-gray-600">{onboarding.summary}</p> : null}
        {onboarding.renderBody({
          ...templateSelection,
          selectedTemplateId: resolvedTemplate?.id || null,
          selectedTemplate: resolvedTemplate,
          setSelectedTemplateId,
          dismiss,
        })}
      </div>
    </Modal>
  );
}
