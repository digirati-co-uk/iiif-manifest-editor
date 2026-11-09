import type { ImageService } from "@iiif/presentation-3";
import { useState } from "react";

/** Request state belongs to the form, independently of the UI locale/profile. */
export function useServiceRequest() {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  async function load(url: () => string | null, receive: (service: ImageService) => void) {
    setLoading(true);
    setFailed(false);
    try {
      const target = url();
      if (!target) throw new Error("Invalid image service request");
      const response = await fetch(target);
      if (!response.ok) throw new Error("Could not load the image service");
      const service = await response.json();
      receive(service);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }
  return { load, loading, failed };
}
