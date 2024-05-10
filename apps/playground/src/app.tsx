import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import "manifest-editor/dist/index.css";
import "@manifest-editor/shell/dist/index.css";

// Aim: For this to be exactly like the current manifest editor.

const classes = {
  container: "m-4",
  row: "border-b border-gray-200 flex flex-col flex-wrap py-2",
  label: "font-bold text-slate-600 w-full text-sm font-semibold mb-0",
  value: "text-sm text-slate-800 block [&>a]:underline",
  empty: "text-gray-400",
};

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
