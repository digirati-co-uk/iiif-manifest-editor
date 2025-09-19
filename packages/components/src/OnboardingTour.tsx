"use client";
import { useLayoutEffect, useState } from "react";
import Joyride, { type CallBackProps, type Step } from "react-joyride";
import { useLocalStorage } from "./hooks/use-local-storage";

interface OnboardingTourProps {
  id: string;
  steps: Step[];
  forceStart?: boolean;
}

export function OnboardingTour({ id, steps, forceStart }: OnboardingTourProps) {
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

  if ((!_isEnabled_ || steps.length === 0) && !forceStart) {
    return null;
  }

  return (
    <Joyride
      //
      showProgress
      showSkipButton
      continuous
      steps={steps}
      run={isEnabled || forceStart}
      callback={lifecycle}
    />
  );
}
