export interface ManifestLinkingProps {
  editLinkingProperty?(property: string, id: string): void;
  editService?(property: string, id: string): void;
  openLinkingWizard?(property: string, id: string): void;
  openServiceWizard?(property: string, id: string): void;
}

export function ManifestLinking(props: ManifestLinkingProps) {
  // Resource ID for adding/removing
  // Just content resource ID for updating

  // SeeAlso
  // Service
  // Services
  // Homepage
  // Rendering
  // partOf
  // Start

  // Features
  // - Listing all linking properties
  // - Adding new link (panel)
  // - Removing property
  // - Edit single link (panel)
  return <div>Manifest linking</div>;
}
