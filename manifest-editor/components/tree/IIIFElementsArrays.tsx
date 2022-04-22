import { useContext, useState } from "react";
import {
  Container,
  Count,
  KeyValuePairString,
  Key,
  Indentation,
  ContainerColumn,
  ValueSolo,
} from "./IIIFElementsShared";

import { DownIcon } from "../icons/DownIcon";

import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { FlexContainer } from "../layout/FlexContainer";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { ContentResources } from "./IIIFContentResource";
import { Canvases } from "./IIIFCanvas";
import { Ranges } from "./IIIFRange";
import { Services } from "./IIIFServices";
import { IIIFService } from "./IIIFService";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";

export type KeyArrayPairing = {
  propertyName: string;
  array: Array<any>;
  onClick: () => void;
};

export const KeyValuePairArray: React.FC<KeyArrayPairing> = ({
  propertyName,
  array,
  onClick,
}) => {
  const [open, setOpen] = useState(false);
  const editorContext = useContext(ManifestEditorContext);

  return (
    <ContainerColumn>
      <Container
        onClick={() => {
          onClick();
          setOpen(!open);
        }}
      >
        <FlexContainer>
          <Key>{propertyName}</Key>
          <Count title={`Count of ${propertyName}`}>{array.length}</Count>
        </FlexContainer>
        {array.length > 0 && <DownIcon rotate={open ? 180 : 0} />}
      </Container>
      <>
        <ErrorBoundary>
          {open && (
            <FlexContainer>
              <Indentation />
              <ContainerColumn>
                {array.map((val: any) => {
                  if (val && val.type === "ContentResource") {
                    return (
                      <ContentResources
                        propertyName="ContentResource"
                        object={val}
                        onClick={() => {}}
                      />
                    );
                  } else if (val && val.type === "Canvas") {
                    return (
                      <Canvases
                        propertyName="ContentResource"
                        object={val}
                        onClick={() =>
                          editorContext?.changeSelectedProperty("canvas")
                        }
                      />
                    );
                  } else if (propertyName === "services") {
                    return (
                      <Services
                        propertyName="Services"
                        object={val}
                        onClick={() => {}}
                      />
                    );
                  } else if (propertyName === "service") {
                    return (
                      <IIIFService
                        propertyName="Services"
                        object={val}
                        onClick={() => {}}
                      />
                    );
                  } else if (val && val.type === "Range") {
                    return (
                      <Ranges
                        propertyName="Range"
                        object={val}
                        onClick={() => {}}
                      />
                    );
                  } else if (typeof val === "string") {
                    return <ValueSolo>{val}</ValueSolo>;
                  } else {
                    return Object.entries(val).map(([key, value]) => {
                      if (
                        typeof value === "string" ||
                        typeof value === "number"
                      ) {
                        return (
                          <KeyValuePairString
                            key={key}
                            onClick={() => console.log("clicked", key)}
                            propertyName={key}
                            value={value}
                          />
                        );
                      } else if (Array.isArray(value)) {
                        return (
                          <KeyValuePairArray
                            key={key}
                            onClick={() => console.log("clicked", key)}
                            propertyName={key}
                            array={value}
                          />
                        );
                      } else {
                        return (
                          <KeyObjectPairing
                            object={value}
                            propertyName={key}
                            onClick={() => {}}
                          />
                        );
                      }
                    });
                  }
                })}
              </ContainerColumn>
            </FlexContainer>
          )}
        </ErrorBoundary>
      </>
    </ContainerColumn>
  );
};
