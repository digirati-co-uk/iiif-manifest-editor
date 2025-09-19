"use client";
import { useEffect } from "react";
import Joyride, { type CallBackProps, type Step } from "react-joyride";
import { useLocalStorage } from "./hooks/use-local-storage";

interface OnboardingTourProps {
  id: string;
  steps: Step[];
  forceStart?: boolean;
  onClose?: () => void;
}

export function OnboardingTour({ id, steps, forceStart, onClose }: OnboardingTourProps) {
  const [isEnabled, setIsEnabled] = useLocalStorage(`tour_step/${id}`, true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: like setState in React.
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

  const lifecycle = (e: CallBackProps) => {
    if (e.action === "close" || e.action === "skip" || e.action === "stop" || e.action === "reset") {
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
      run={isEnabled || forceStart}
      callback={lifecycle}
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
