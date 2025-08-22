import { useCallback, useState } from "react";
import { useCurrentAnnotationMetadata } from "react-iiif-vault";

export function useAnnotationCreatorState<Type = any>({ key, initialValue, requestId, getInitialValue }: {
  key: string,
  initialValue?: Type,
  requestId?: string;
  getInitialValue?: (metadata: any) => (Type | null)
}) {
  const [metadata, setMetadata] = useCurrentAnnotationMetadata({ requestId });
  const [reactState, reactSetState] = useState<Type>(getInitialValue && getInitialValue(metadata) || (metadata[key] || initialValue));

  const setState = useCallback((newValue: Type) => {
    setMetadata({ [key]: newValue });
    reactSetState(newValue);
  }, []);

  return [
    reactState,
    setState,
  ] as const;
}
