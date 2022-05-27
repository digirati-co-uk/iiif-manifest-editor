export interface ManifestLinkingProps {
  editLinkingProperty?(property: string, id: string): void;
  editService?(property: string, id: string): void;
  openLinkingWizard?(property: string, id: string): void;
  openServiceWizard?(property: string, id: string): void;
}

export function ManifestLinking(props: ManifestLinkingProps) {
  // SeeAlso
  // Service
  // Services
  // Homepage
  // Rendering
  // partOf
  // Start
  return <div>Manifest linking</div>;
}
