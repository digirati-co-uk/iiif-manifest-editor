/// <reference lib="webworker" />

import {
  createErrorResponse,
  createEventEnvelope,
  createSuccessResponse,
  createTranslationResultResponse,
  type TranslationWorkerRequest,
} from "../protocol";
import { TranslationWorkerRuntime } from "./runtime";

const runtime = new TranslationWorkerRuntime();

self.addEventListener("message", async (message: MessageEvent<TranslationWorkerRequest>) => {
  const request = message.data;
  if (request.kind !== "request") {
    return;
  }

  const respond = (payload: unknown) => {
    self.postMessage(payload);
  };

  try {
    switch (request.command) {
      case "preload":
        await runtime.preload(request.payload.runtime, (event) => respond(createEventEnvelope(event)));
        respond(createSuccessResponse("preload", request.requestId, undefined));
        break;
      case "translate": {
        const result = await runtime.translate(
          request.requestId,
          request.payload,
          (event) => respond(createEventEnvelope(event)),
        );
        respond(createTranslationResultResponse(request.requestId, result));
        break;
      }
      case "dispose":
        runtime.dispose();
        respond(createSuccessResponse("dispose", request.requestId, undefined));
        break;
    }
  } catch (error) {
    const runtimeError =
      error instanceof Error
        ? {
            code: error.name as any,
            message: error.message,
            recoverable: error.name === "busy" || error.name === "invalid_request",
          }
        : {
            code: "worker_failed" as const,
            message: "The translation worker failed unexpectedly.",
            recoverable: false,
          };

    respond(
      createEventEnvelope({
        type: "error",
        requestId: request.requestId,
        code: runtimeError.code,
        message: runtimeError.message,
        recoverable: runtimeError.recoverable,
      }),
    );
    respond(createErrorResponse(request.command, request.requestId, runtimeError));
  }
});

export {};
