import { useEffect, useState } from "react";
import { handleOpenRouterCallback } from "../auth";

type CallbackStatus = "loading" | "success" | "error";

function OpenRouterLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-12 w-12 text-me-primary-600">
      <path
        fill="currentColor"
        d="M16 3c3.313 0 6 2.695 6 5.994V21H8.001C4.687 21 2 18.305 2 15.006V11h2v4.006A4.005 4.005 0 0 0 8.001 19H20V8.994A4.005 4.005 0 0 0 16 5h-6V3zm-6 10H8v-2h2zm6 0h-2v-2h2zM3.53 1.32a.507.507 0 0 1 .94 0l.254.61a4.37 4.37 0 0 0 2.25 2.327l.718.32a.53.53 0 0 1 0 .962l-.76.338a4.36 4.36 0 0 0-2.218 2.25l-.247.566a.506.506 0 0 1-.934 0l-.247-.565a4.36 4.36 0 0 0-2.219-2.251l-.76-.338a.53.53 0 0 1 0-.963l.718-.32a4.37 4.37 0 0 0 2.251-2.325z"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-8 w-8 animate-spin text-me-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function OpenRouterCallbackPage() {
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void handleOpenRouterCallback({
      history: window.history,
      autoClose: false,
    }).then((result) => {
      if (cancelled) {
        return;
      }

      if (!result.handled) {
        setStatus("error");
        setError("Missing authorization code. Please try logging in again.");
        return;
      }

      if ("apiKey" in result && result.apiKey) {
        setStatus("success");
        setError(null);
        return;
      }

      setStatus("error");
      setError(("error" in result && result.error) || "Authentication failed.");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-me-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-me-gray-300 bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <OpenRouterLogo />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-me-gray-900">OpenRouter Authentication</h1>

          {status === "loading" ? (
            <>
              <div className="my-6 flex justify-center">
                <LoadingSpinner />
              </div>
              <p className="text-sm text-me-gray-700">Connecting to OpenRouter...</p>
            </>
          ) : null}

          {status === "success" ? (
            <>
              <div className="my-6 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <SuccessIcon />
                </div>
              </div>
              <p className="mb-2 font-medium text-green-700">Successfully connected</p>
              <p className="mb-6 text-sm text-me-gray-700">
                Your OpenRouter API key has been stored locally and the editor has been notified. You can close this window now.
              </p>
            </>
          ) : null}

          {status === "error" ? (
            <>
              <div className="my-6 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
                  <ErrorIcon />
                </div>
              </div>
              <p className="mb-2 font-medium text-red-700">Authentication failed</p>
              <p className="mb-6 text-sm text-me-gray-700">{error}</p>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => window.close()}
            className={[
              "w-full rounded-md px-4 py-2.5 font-medium transition-colors",
              status === "success"
                ? "bg-me-primary-600 text-white hover:bg-me-primary-700"
                : "bg-me-gray-100 text-me-gray-900 hover:bg-me-gray-200",
            ].join(" ")}
          >
            Close Window
          </button>
        </div>
      </div>
    </main>
  );
}
