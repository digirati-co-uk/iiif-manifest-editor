import { useCallback, useEffect, useState } from "react";
import { useStore } from "zustand";
import {
  type AnnotationRequest,
  type AnnotationRequestOptions,
  type AnnotationResponse,
  requestToAnnotationResponse,
} from "../AtlasStore/AtlasStore";
import { useAtlasStore } from "../AtlasStore/AtlasStoreProvider";

export function useRequestAnnotation(opts?: { onSuccess?: (r: AnnotationResponse) => void }) {
  const [id, setId] = useState(0);
  const store = useAtlasStore();
  const { tool, getRequestId, requestAnnotation, completeRequest, cancelRequest } = useStore(store, (s) => ({
    getRequestId: s.getRequestId,
    requestAnnotation: s.requestAnnotation,
    completeRequest: s.completeRequest,
    cancelRequest: s.cancelRequest,
    tool: s.tool,
  }));

  // Sequence.
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<AnnotationResponse | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const busy = tool.enabled && tool.requestId !== requestId;

  const mutateAsync = useCallback(
    async (request: AnnotationRequest, options?: Omit<AnnotationRequestOptions, "requestId">) => {
      if (requestId) {
        setIsPending(true);
        const response = await requestAnnotation(request, {
          ...options,
          requestId: requestId,
        });
        if (response) {
          opts?.onSuccess?.(response);
          setId((i) => i + 1);
          setIsPending(false);
          setData(response);
          return response;
        }

        // Otherwise the request was cancelled
        const resp = {
          id: requestId,
          cancelled: true,
          ...requestToAnnotationResponse(request),
        };
        opts?.onSuccess?.(resp);
        setData(resp);
        setId((i) => i + 1);
        setIsPending(false);
        return resp;
      }
      return null;
    },
    [opts?.onSuccess, requestAnnotation, requestId]
  );

  const reset = useCallback(() => {
    setData(null);
    setIsPending(false);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const request = getRequestId();
    setRequestId(request.requestId);
    return () => {
      request.clear();
    };
  }, [id]);

  return {
    id,
    busy,
    isPending,
    requestAnnotation: mutateAsync,
    cancelRequest: () => (requestId ? cancelRequest(requestId) : void 0),
    completeRequest: () => (requestId ? completeRequest(requestId) : void 0),
    reset,
    data,
  };
}
