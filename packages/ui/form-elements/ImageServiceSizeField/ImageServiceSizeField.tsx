import { ImageService } from "@iiif/presentation-3";
import { getFixedSizesFromService } from "@atlas-viewer/iiif-image-api";
import { StyledSelect } from "@/editors/LanguageSelector";

export interface ImageServiceSizeFieldProps {
  id?: string;
  imageService: ImageService;
}

export function ImageServiceSizeField(props: ImageServiceSizeFieldProps) {
  const sizes = getFixedSizesFromService(props.imageService);
  const id = props.id || "service-sizes";

  if (!sizes.length) {
    return null;
  }

  return (
    <StyledSelect name={id} id={id} style={{ height: "3em", borderRadius: 5 }}>
      {sizes.map((size, n) => (
        <option key={n} value={`${size.width},${size.height}`}>
          {size.width} x {size.height}
        </option>
      ))}
    </StyledSelect>
  );
}
