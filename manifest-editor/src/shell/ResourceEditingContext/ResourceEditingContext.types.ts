import { InternationalString } from "@iiif/presentation-3";
import { InputHTMLAttributes } from "react";

interface ResourceEditing {
  descriptive: {};
  metadata: {};
  technical: {};
  structural: {};
}

interface DescriptivePropertyEditor<T> {
  get(): T;
  set(newT: T): void;
  subscribe(cb: (newT: T) => void): () => void;
  inputProps: Partial<InputHTMLAttributes<HTMLInputElement>>;
  iiifDocs: string;
}

interface UseDescriptiveEditor {
  label: DescriptivePropertyEditor<InternationalString>;
  summary: DescriptivePropertyEditor<InternationalString>;
}
interface UseMetadataEditor {}
interface UseTechnicalEditor {}
interface UseLinkingEditor {}
interface UseStructuralEditor {}
