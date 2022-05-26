// Publications
export interface Publication {
  id: string;
  type: string;
  config: any;
}

export interface PreviewServicePublication extends Publication {
  id: string;
  type: "IIIFPreview";
  config: {
    secretPublishUrl: string;
  };
}
