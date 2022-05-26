import { useContentResource } from "../../hooks/useContentResource";
import { useVault } from "react-iiif-vault";
import { FlexContainer, FlexContainerColumn } from "../../components/layout/FlexContainer";
import { Input, InputLabel } from "../../editors/Input";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";
import { DimensionsTriplet } from "../../atoms/DimensionsTriplet";

export function EditAnnotationBodyWithoutTarget(props: { id: string }) {
  const resource = useContentResource<any>({ id: props.id });
  const vault = useVault();

  function setValue(prop: string, value: any) {
    if (resource) {
      vault.modifyEntityField({ id: resource.id, type: "ContentResource" }, prop, value);
    }
  }

  if (!resource) {
    return <div>Resource not found</div>;
  }

  return (
    <FlexContainerColumn>
      <FlexContainer>
        <Input disabled value={resource.id} placeholder={"Paste URL of Media"} />
      </FlexContainer>
      <HorizontalDivider />
      <InputLabel>
        Media Dimensions
        <DimensionsTriplet
          width={resource.width || 0}
          changeWidth={(w) => setValue("width", w)}
          height={resource.height || 0}
          changeHeight={(w) => setValue("height", w)}
          duration={resource.duration || 0}
          changeDuration={(w) => setValue("duration", w)}
        />
      </InputLabel>
      <HorizontalDivider />
      <InputLabel>
        Type
        <Input
          value={resource.type}
          placeholder={"Image, sound etc"}
          onChange={(e: any) => setValue("type", e.target.value)}
        />
      </InputLabel>
      <HorizontalDivider />
      <InputLabel>
        Format
        <Input
          value={resource.format}
          placeholder={"jpg, png etc."}
          onChange={(e: any) => setValue("format", e.target.value)}
        />
      </InputLabel>
    </FlexContainerColumn>
  );
}
