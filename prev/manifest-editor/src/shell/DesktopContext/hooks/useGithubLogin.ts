import { useCallback, useState } from "react";
import { useLocalStorage } from "../../../madoc/use-local-storage";
import { fetch, Body } from "@tauri-apps/api/http";
import invariant from "tiny-invariant";

type GithubLoginStages =
  | { type: "idle" }
  | { type: "fetching-code" }
  | { type: "login-code"; userCode: string; verificationUri: string }
  | { type: "failed"; error: { type: string; message: string } }
  | { type: "success"; accessToken: string };

export function useGithubLogin({ clientId, scope }: { clientId: string; scope: string }) {
  const [accessToken, setAccessToken] = useLocalStorage<string>(`github-auth/${clientId}/${scope}`);
  const [stage, setStage] = useState<GithubLoginStages>(
    accessToken ? { type: "success", accessToken } : { type: "idle" }
  );

  const reset = () => setStage({ type: "idle" });

  const logout = () => {
    setAccessToken("");
    setStage({ type: "idle" });
  };

  const login = useCallback(
    async function login() {
      try {
        setStage({ type: "fetching-code" });
        const resp = await fetch("https://github.com/login/device/code", {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: Body.json({
            client_id: clientId,
            scope: scope,
          }),
        });
        const json = resp.data as {
          device_code: string;
          user_code: string;
          verification_uri: string;
          expires_in: number;
          interval: number;
        };

        invariant(json.device_code);
        invariant(json.user_code);
        invariant(json.verification_uri);
        invariant(json.expires_in);
        invariant(json.interval);

        setStage({ type: "login-code", userCode: json.user_code, verificationUri: json.verification_uri });

        const abort = new AbortController();

        const abortTimeout = setTimeout(() => {
          console.log("aborted");
          clearTimeout(requestAccessTokenTimeout);
          abort.abort();
          setStage({ type: "failed", error: { type: "timeout", message: "Login took too long" } });
          // Any other
        }, json.expires_in * 1000);

        let isFetching = false;
        // Display user_code and verification_uri to user
        // Start polling.
        let interval = Math.max(5000, json.interval * 1000);

        const requestAccessToken = async () => {
          try {
            if (isFetching) {
              return;
            }
            isFetching = true;
            const resp = await fetch(`https://github.com/login/oauth/access_token`, {
              method: "POST",
              headers: {
                Accept: "application/json",
              },
              body: Body.json({
                client_id: clientId,
                device_code: json.device_code,
                grant_type: "urn:ietf:params:oauth:grant-type:device_code",
              }),
              // signal: abort.signal,
            });
            console.log(resp.data);

            if (resp.ok) {
              const error = (resp.data as any).error;
              if (error === "authorization_pending") {
                isFetching = false;
                return;
              }
              if (error === "slow_down") {
                interval = (resp.data as any).interval as number;
                clearInterval(requestAccessTokenTimeout);
                requestAccessTokenTimeout = setInterval(requestAccessToken, interval * 1050);
                isFetching = false;
                return;
              }

              const json = resp.data as {
                access_token: string;
                token_type: "bearer";
                scope: string;
              };

              invariant(json.access_token);
              invariant(json.token_type === "bearer");
              invariant(json.scope);

              console.log("aborted");
              clearTimeout(abortTimeout);
              clearInterval(requestAccessTokenTimeout);
              abort.abort(); // just in case?
              // Do something with JSON.

              setAccessToken(json.access_token);
              setStage({ type: "success", accessToken: json.access_token });
            }

            isFetching = false;
          } catch (e) {
            isFetching = false;
            console.log(e);
          }
        };

        let requestAccessTokenTimeout = setInterval(requestAccessToken, interval);
      } catch (e) {
        console.error(e);
        setStage({ type: "failed", error: { type: "unknown", message: (e as any).message } });
      }
    },
    [clientId, scope]
  );

  return [stage, { login, reset, logout }] as const;
}
