import { useEffect } from "react";
import posthog from "posthog-js";

export function Posthog() {
  useEffect(() => {
    posthog.init("phc_7cVoectc5bjIZ6wB8zjN1qbUYkYfK79fnYxEOY4J1Xn", {
      api_host: "https://eu.i.posthog.com",
      person_profiles: "identified_only",
    });
  }, []);

  return null;
}
