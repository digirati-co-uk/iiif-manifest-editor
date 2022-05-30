import { ImageService } from "@iiif/presentation-3";
import { FlexContainerColumn } from "../../components/layout/FlexContainer";
import { Input, InputContainer, InputLabel } from "../../editors/Input";
import { DimensionsTriplet } from "../../atoms/DimensionsTriplet";
import "@digirati/canvas-panel-web-components";
import { Dropdown, DropdownOption } from "../../madoc/components/Dropdown";

const profiles: DropdownOption[] = [
  {
    key: "http://iiif.io/api/image/2/level0.json",
    label: "http://iiif.io/api/image/2/level0.json",
    value: "http://iiif.io/api/image/2/level0.json",
    text: "Level 0",
  },
  {
    key: "http://iiif.io/api/image/2/level1.json",
    label: "http://iiif.io/api/image/2/level1.json",
    value: "http://iiif.io/api/image/2/level1.json",
    text: "Level 1",
  },
  {
    key: "http://iiif.io/api/image/2/level2.json",
    label: "http://iiif.io/api/image/2/level2.json",
    value: "http://iiif.io/api/image/2/level2.json",
    text: "Level 2",
  },
];

interface ImageService2EditorProps {
  service: ImageService & { "@type": string };
  onChange: (service: ImageService & { "@type": string }) => void;
}

export function ImageService2Editor(props: ImageService2EditorProps) {
  const service = props.service;

  function setValue(key: string, value: any) {
    props.onChange({ ...service, [key]: value });
  }

  return (
    <FlexContainerColumn>
      <InputContainer wide>
        <Input disabled value={service["@id"]} placeholder={"Paste URL of Media"} />
      </InputContainer>

      <InputContainer wide>
        <InputLabel $margin htmlFor="type">
          Type
        </InputLabel>
        <Input id="type" value={service["@type"]} placeholder={"Image, sound etc"} disabled />
      </InputContainer>

      <InputContainer wide>
        <InputLabel $margin htmlFor="type">
          Protocol
        </InputLabel>
        <Input id="protocol" value={service.protocol} disabled />
      </InputContainer>

      <InputContainer wide>
        <DimensionsTriplet
          width={service.width || 0}
          changeWidth={(w) => setValue("width", w)}
          height={service.height || 0}
          changeHeight={(w) => setValue("height", w)}
        />
      </InputContainer>

      <InputContainer wide>
        <InputLabel $margin htmlFor="profile">
          Profile
        </InputLabel>

        <Dropdown
          id="profile"
          placeholder="Choose profile"
          value={service.profile as string}
          options={profiles}
          onChange={(changed) => setValue("profile", changed)}
        />
      </InputContainer>
    </FlexContainerColumn>
  );
}
