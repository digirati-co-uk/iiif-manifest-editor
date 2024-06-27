import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" activeProps={{ className: "text-blue-500 underline" }}>
          Home
        </Link>{" "}
        <Link to="/about" activeProps={{ className: "text-blue-500 underline" }}>
          About
        </Link>{" "}
        <Link to="/shell" activeProps={{ className: "text-blue-500 underline" }}>
          Shell
        </Link>{" "}
        <Link to="/explorer" activeProps={{ className: "text-blue-500 underline" }}>
          IIIF Explorer
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
