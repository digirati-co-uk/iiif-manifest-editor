"use client";
import { useTranslations } from "@manifest-editor/i18n";
import { useLocalStorage } from "@manifest-editor/components";
import { useLayoutEffect, useState } from "react";
import Joyride, { type CallBackProps, type Step } from "react-joyride";

interface OnboardingTourProps {
  id: string;
  steps: Step[];
}

export function OnboardingTour({ id, steps }: OnboardingTourProps) {
  const t = useTranslations("web");
  const [_isEnabled_, _setIsEnabled] = useLocalStorage(`tour_step/${id}`, true);
  const [isEnabled, setIsEnabled] = useState(false);

  const lifecycle = (e: CallBackProps) => {
    if (e.action === "close") {
      _setIsEnabled(false);
    }
  };

  useLayoutEffect(() => {
    setTimeout(() => {
      setIsEnabled(true);
    }, 2000);
  }, []);

  if (!_isEnabled_ || steps.length === 0) {
    return null;
  }

  return (
    <Joyride
      locale={{
        back: t("tour.back"),
        close: t("tour.close"),
        last: t("tour.last"),
        next: t("tour.next"),
        open: t("tour.open"),
        skip: t("tour.skip"),
        nextLabelWithProgress: t("tour.progress"),
      }}
      showProgress
      showSkipButton
      continuous
      scrollToFirstStep
      steps={steps}
      run={isEnabled}
      callback={lifecycle}
    />
  );
}
