import { ImageService3 } from "@iiif/presentation-3";
import { FlexContainerColumn } from "../../components/layout/FlexContainer";
import { Input, InputContainer, InputLabel } from "../../editors/Input";
import { DimensionsTriplet } from "../../atoms/DimensionsTriplet";
import { Dropdown, DropdownOption } from "../../madoc/components/Dropdown";

const profiles: DropdownOption[] = [
  {
    key: "level0",
    value: "level0",
    text: "Level 0",
  },
  {
    key: "level1",
    value: "level1",
    text: "Level 1",
  },
  {
    key: "level2",
    value: "level2",
    text: "Level 2",
  },
];

interface ImageService3EditorProps {
  service: ImageService3;
  onChange: (service: ImageService3) => void;
}

export function ImageService3Editor(props: ImageService3EditorProps) {
  const service = props.service;

  function setValue(key: string, value: any) {
    props.onChange({ ...service, [key]: key === "width" || key === "height" ? value || undefined : value });
  }

  return (
    <FlexContainerColumn>
      <InputContainer wide>
        <Input disabled value={service.id} placeholder={"Paste URL of Media"} />
      </InputContainer>

      <InputContainer wide>
        <InputLabel $margin htmlFor="type">
          Type
        </InputLabel>
        <Input id="type" value={service.type} placeholder={"Image, sound etc"} disabled />
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
