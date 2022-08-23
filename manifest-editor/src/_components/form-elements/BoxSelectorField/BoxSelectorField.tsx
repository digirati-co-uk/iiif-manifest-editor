import { BoxSelector } from "@iiif/vault-helpers";
import { FieldsetContainer, Input, InputContainer, InputLabel } from "@/editors/Input";
import { FlexContainer, FlexContainerColumn } from "@/components/layout/FlexContainer";
import { Fragment, ReactNode, useEffect, useRef } from "react";

interface BoxSelectorFieldProps {
  selector: BoxSelector;
  form?: boolean;
  onSubmit?: (selector: BoxSelector) => void;
  children?: ReactNode;
}

export function BoxSelectorField({ selector, form, onSubmit, children }: BoxSelectorFieldProps) {
  const formEl = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formEl.current) {
      formEl.current.reset();
    }
  }, [selector]);

  if (!selector.spatial || selector.spatial.unit !== "pixel") {
    return null;
  }

  const fields = (
    <FieldsetContainer id="box-selector-fieldset">
      <FlexContainer>
        <input type="hidden" name="selector.type" value="BoxSelector" />
        <FlexContainerColumn style={{ width: "100%", marginRight: "0.4em" }}>
          <InputContainer>
            <InputLabel $margin htmlFor="type">
              x
            </InputLabel>
            <Input id="selector-x" name="selector.x" type="number" defaultValue={selector.spatial.x} />
          </InputContainer>
        </FlexContainerColumn>
        <FlexContainerColumn style={{ width: "100%", marginRight: "0.4em" }}>
          <InputContainer>
            <InputLabel $margin htmlFor="selector-y">
              y
            </InputLabel>
            <Input id="selector-y" name="selector.y" type="number" defaultValue={selector.spatial.y} />
          </InputContainer>
        </FlexContainerColumn>
        <FlexContainerColumn style={{ width: "100%", marginRight: "0.4em" }}>
          <InputContainer>
            <InputLabel $margin htmlFor="type">
              width
            </InputLabel>
            <Input id="selector-width" name="selector.width" type="number" defaultValue={selector.spatial.height} />
          </InputContainer>
        </FlexContainerColumn>
        <FlexContainerColumn style={{ width: "100%", marginRight: "0.4em" }}>
          <InputContainer>
            <InputLabel $margin htmlFor="selector-y">
              height
            </InputLabel>
            <Input id="selector-height" name="selector.height" type="number" defaultValue={selector.spatial.height} />
          </InputContainer>
        </FlexContainerColumn>
      </FlexContainer>
      {children}
    </FieldsetContainer>
  );

  if (form) {
    return (
      <form
        ref={formEl}
        onSubmit={(e) => {
          e.preventDefault();
          if (onSubmit) {
            const data = new FormData(e.target as HTMLFormElement);
            const object = Object.fromEntries(data.entries());

            onSubmit({
              type: "BoxSelector",
              spatial: {
                x: Number(object["selector.x"]),
                y: Number(object["selector.y"]),
                width: Number(object["selector.width"]),
                height: Number(object["selector.height"]),
              },
            });
          }
        }}
      >
        {fields}
      </form>
    );
  }

  const serialised = `${selector.spatial.x},${selector.spatial.y},${selector.spatial.width},${selector.spatial.height}`;

  return <Fragment key={serialised}>{fields}</Fragment>;
}
