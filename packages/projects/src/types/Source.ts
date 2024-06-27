// Sources
export interface Source {
  id: string;
  type: string;
  data?: any;
}

export interface ManifestSource extends Source {
  id: string;
  type: "Manifest";
}

export interface TemplateSource extends Source {
  id: string;
  type: "ManifestTemplate";
}

export interface ForkedSource extends Source {
  id: string;
  type: "ForkedSource";
  data: {
    originalSource: Source;
  };
}
