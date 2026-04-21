import {
  createDisposeRequest,
  createPreloadRequest,
  createTranslateRequest,
  type TranslationWorkerCommand,
  type TranslationWorkerResponse,
} from "../protocol";
import type {
  TranslationEvent,
  TranslationPreloadRequest,
  TranslationTextRequest,
  TranslationTextResult,
} from "../types";
import type { TranslationWorkerClient } from "./client.types";

type PendingRequest = {
  command: TranslationWorkerCommand;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

export interface CreateTranslationWorkerClientOptions {
  worker?: Worker;
}

function randomRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `translation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createTranslationWorkerClient(
  options: CreateTranslationWorkerClientOptions = {},
): TranslationWorkerClient {
  const worker =
    options.worker ??
    new Worker(new URL("./translation-worker.js", import.meta.url), {
      type: "module",
    });
  const listeners = new Set<(event: TranslationEvent) => void>();
  const pendingRequests = new Map<string, PendingRequest>();
  let terminated = false;

  const emit = (event: TranslationEvent) => {
    for (const listener of listeners) {
      listener(event);
    }
  };

  const failAllPending = (reason: unknown) => {
    for (const request of pendingRequests.values()) {
      request.reject(reason);
    }
    pendingRequests.clear();
  };

  worker.addEventListener("message", (message: MessageEvent<TranslationWorkerResponse>) => {
    const payload = message.data;

    if (payload.kind === "event") {
      emit(payload.payload);
      return;
    }

    const pendingRequest = pendingRequests.get(payload.requestId);
    if (!pendingRequest) {
      return;
    }

    pendingRequests.delete(payload.requestId);

    if (payload.kind === "error") {
      const error = new Error(payload.payload.message);
      error.name = payload.payload.code;
      pendingRequest.reject(error);
      return;
    }

    pendingRequest.resolve(payload.payload);
  });

  worker.addEventListener("error", (event) => {
    const error = new Error(event.message || "The translation worker crashed.");
    error.name = "worker_failed";
    emit({
      type: "error",
      code: "worker_failed",
      message: error.message,
      recoverable: false,
    });
    failAllPending(error);
  });

  const send = <T>(command: TranslationWorkerCommand, request: object): Promise<T> => {
    if (terminated) {
      return Promise.reject(new Error("The translation worker client has been terminated."));
    }

    const requestId = randomRequestId();
    const envelope =
      command === "translate"
        ? createTranslateRequest(requestId, (request as { payload: TranslationTextRequest }).payload)
        : command === "dispose"
          ? createDisposeRequest(requestId)
          : createPreloadRequest(requestId, (request as { payload: TranslationPreloadRequest }).payload);

    return new Promise<T>((resolve, reject) => {
      pendingRequests.set(requestId, {
        command,
        resolve: (value: unknown) => resolve(value as T),
        reject,
      });
      worker.postMessage(envelope);
    });
  };

  return {
    async preload(request) {
      await send<void>("preload", { payload: request });
    },
    translate(request) {
      return send<TranslationTextResult>("translate", { payload: request });
    },
    onEvent(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    terminate() {
      if (terminated) {
        return;
      }

      terminated = true;
      worker.postMessage(createDisposeRequest(randomRequestId()));
      worker.terminate();
      failAllPending(new Error("The translation worker client has been terminated."));
    },
  };
}
