"use client";
import { useTranslations } from "@manifest-editor/i18n";
import { useEffect } from "react";
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride";
import { useLocalStorage } from "./hooks/use-local-storage";

interface OnboardingTourProps {
  id: string;
  steps: Step[];
  forceStart?: boolean;
  onClose?: () => void;
  lastButtonLabel?: string;
}

export function OnboardingTour({ id, steps, forceStart, onClose, lastButtonLabel }: OnboardingTourProps) {
  const t = useTranslations("components");
  const [isEnabled, setIsEnabled] = useLocalStorage(`tour_step/${id}`, true);
  const run = isEnabled || forceStart;

  // oxlint-disable react/exhaustive-deps -- setIsEnabled is stable like React setState.
  useEffect(() => {
    const onRestart = (e: Event) => {
      const target = (e as CustomEvent<{ id?: string }>).detail?.id;
      if (target === id) {
        setIsEnabled(true);
      }
    };
    window.addEventListener("onboarding:restart", onRestart as EventListener);
    return () => window.removeEventListener("onboarding:restart", onRestart as EventListener);
  }, [id]);
  // oxlint-enable react/exhaustive-deps

  useEffect(() => {
    const editor = document.getElementById("manifest-editor-container");
    if (!editor || !run) return;

    editor.setAttribute("inert", "");
    return () => {
      editor.removeAttribute("inert");
    };
  }, [run]);

  const lifecycle = (e: CallBackProps) => {
    if (
      e.action === "close" ||
      e.action === "skip" ||
      e.action === "stop" ||
      e.action === "reset" ||
      e.status === STATUS.FINISHED ||
      e.status === STATUS.SKIPPED
    ) {
      setIsEnabled(false);
      onClose?.();
    }
  };

  if (steps.length === 0) {
    return null;
  }

  return (
    <Joyride
      key={id}
      showProgress
      showSkipButton
      continuous
      steps={steps}
      run={run}
      callback={lifecycle}
      locale={{
        back: t("tour.back"),
        close: t("actions.close"),
        last: lastButtonLabel ?? t("tour.last"),
        next: t("tour.next"),
        nextLabelWithProgress: t("tour.nextProgress"),
        open: t("tour.open"),
        skip: t("tour.skip"),
      }}
      styles={{
        options: {
          primaryColor: "#b84c74",
          textColor: "#000000",
          zIndex: 10000,
        },
      }}
    />
  );
}
