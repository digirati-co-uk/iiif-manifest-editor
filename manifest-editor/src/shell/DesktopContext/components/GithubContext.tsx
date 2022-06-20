import { useGithubLogin } from "../hooks/useGithubLogin";
import { ErrorMessage } from "../../../madoc/components/callouts/ErrorMessage";

export function GithubContext() {
  const [stage, { reset, login, logout }] = useGithubLogin({
    scope: "repo",
    clientId: "28c4617f1be9666bc0c5",
  });

  return (
    <div>
      {stage.type === "idle" || stage.type === "fetching-code" ? (
        <button disabled={stage.type === "fetching-code"} onClick={login}>
          Login with github
        </button>
      ) : null}

      {stage.type === "failed" ? (
        <>
          <ErrorMessage>{stage.error.message}</ErrorMessage>
          <button onClick={reset}>Try again</button>
        </>
      ) : null}
      {stage.type === "login-code" ? (
        <div>
          <h3>Authorize on Github</h3>
          <p>
            Enter the following code:
            <h4>{stage.userCode}</h4>
            <a target="_blank" href={stage.verificationUri}>
              {stage.verificationUri}
            </a>
          </p>
        </div>
      ) : null}
      {stage.type === "success" ? (
        <div>
          <h4>Logged in!</h4>
          <pre>
            <code>{stage.accessToken}</code>
          </pre>
          <button onClick={logout}>Logout</button>
        </div>
      ) : null}
    </div>
  );
}
