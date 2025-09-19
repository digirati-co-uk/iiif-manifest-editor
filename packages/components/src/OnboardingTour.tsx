"use client";
import { useLocalStorage } from "./hooks/use-local-storage";
import { useEffect, useLayoutEffect, useState } from "react";
import Joyride, { type CallBackProps, type Step } from "react-joyride";

interface OnboardingTourProps {
  id: string;
  steps: Step[];
  forceStart?: boolean;
}

export function OnboardingTour({ id, steps, forceStart }: OnboardingTourProps) {
  const [_isEnabled_, _setIsEnabled] = useLocalStorage(`tour_step/${id}`, true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [key, setKey] = useState(0);

  useLayoutEffect(() => {
    setTimeout(() => {
      setIsEnabled(true);
    }, 2000);
  }, []);

  useEffect(() => {
    const onRestart = (e: Event) => {
      const target = (e as CustomEvent<{ id?: string }>).detail?.id;
      if (target === id) {
        setIsEnabled(false);
        setKey((k) => k + 1);
        requestAnimationFrame(() => setIsEnabled(true));
      }
    };
    window.addEventListener("onboarding:restart", onRestart as EventListener);
    return () => window.removeEventListener("onboarding:restart", onRestart as EventListener);
  }, [id]);

  const lifecycle = (e: CallBackProps) => {
    if (e.action === "close") {
      _setIsEnabled(false);
    }
  };

  if ((!_isEnabled_ || steps.length === 0) && !forceStart) {
    return null;
  }

  return (
    <Joyride
      //
      key={`${id}-${key}`}
      showProgress
      showSkipButton
      continuous
      steps={steps}
      run={isEnabled || forceStart}
      callback={lifecycle}
      styles={{
        options: {
          primaryColor: '#b84c74',
          textColor: '#000000',
          zIndex: 10000,
        },
      }}
    />
  );
}
