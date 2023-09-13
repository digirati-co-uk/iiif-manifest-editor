import { AppDefinition } from "@/apps/app-loader";
import React, { useMemo } from "react";
import qs from "query-string";
import { GlobalStyle } from "@/atoms/GlobalStyle";
import { ManifestUrlEmbed } from "@/shell/Embed/ManifestUrlEmbed";

export function OptionalEmbed({ children, apps }: { apps: AppDefinition; children: React.ReactNode }) {
  const initialParsed = useMemo(() => qs.parse(window.location.toString().split("?")[1] || ""), []);

  if (!initialParsed.embed) {
    return children;
  }

  const error = (err: string): any => {
    return (
      <>
        <GlobalStyle />
        <div style={{ padding: "3em", textAlign: "center" }}>{err}</div>
      </>
    );
  };

  // 1. Extract IIIF content
  if (!initialParsed.manifest && !initialParsed.iiifContent) {
    // error instead?
    return error("No resource selected");
  }

  if (initialParsed.iiifContent) {
    return error("Still a work in progress");
  }

  if (initialParsed.manifest) {
    return <ManifestUrlEmbed apps={apps} query={initialParsed} />;
  }

  // 2. Parse shell options.
  // 3. Parse app options.
  // 4. Set up post-message if needed.

  return children;
}
