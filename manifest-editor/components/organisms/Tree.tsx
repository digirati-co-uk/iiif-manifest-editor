import { useEffect } from "react";
import { useManifest } from "../../hooks/useManifest";

import styled from "styled-components";
import {
  KeyValuePairString,
  KeyObjectPairing
} from "../atoms/IIIFElementsShared";
import { KeyValuePairArray } from "../atoms/IIIFElementsArrays";

const TreeContainer = styled.div`
  z-index: 12;
  font-size: 0.85em;
  line-height: 1.3em;
`;

export const Tree: React.FC = () => {
  const manifest = useManifest();

  useEffect(() => {
    {
      Object.entries(
        // @ts-ignore
        manifest ? manifest : {}
      ).map(([key, value], index: number) => {
        console.log(key, value);
      });
    }
  }, [manifest]);

  return (
    <TreeContainer>
      <h5>IIIF Properties</h5>
      {/* {Object.entries(
        // @ts-ignore
        manifest ? manifest : {}
      ).map(([key, value]) => {
        if (typeof value === "string") {
          return <p>{key}</p>;
        } else if (Array.isArray(value)) {
          return <KeyValuePairArray propertyName={key} array={value} />;
        } else {
          return <KeyObjectPairing name={key} object={value} />;
        }
      })} */}
      <KeyValuePairString
        onClick={() => console.log("clicked id")}
        propertyName={"id"}
        value={manifest?.id}
      />
      <KeyValuePairString
        onClick={() => console.log("clicked type")}
        propertyName={"type"}
        value={manifest?.type}
      />
      <KeyValuePairArray
        onClick={() => console.log("clicked type")}
        propertyName={"annotations"}
        array={manifest?.annotations}
      />
      <KeyValuePairArray
        onClick={() => console.log("behaviour type")}
        propertyName={"behavior"}
        array={manifest?.behavior}
      />
      <KeyValuePairArray
        onClick={() => console.log("homepage")}
        propertyName={"homepage"}
        array={manifest?.homepage}
      />
      <KeyValuePairArray
        onClick={() => console.log("items")}
        propertyName={"items"}
        array={manifest?.items}
      />
      <div>label</div>
      <KeyValuePairArray
        onClick={() => console.log("logo")}
        propertyName={"logo"}
        array={manifest?.logo}
      />
      <KeyValuePairArray
        onClick={() => console.log("metadata")}
        propertyName={"metadata"}
        array={manifest?.metadata}
      />
      <div>motovation</div>
      <div>navData</div>
      <KeyValuePairArray
        onClick={() => console.log("provider")}
        propertyName={"provider"}
        array={manifest?.provider}
      />
      <KeyValuePairArray
        onClick={() => console.log("partOf")}
        propertyName={"partOf"}
        array={manifest?.partOf}
      />
      <div>posterCanvas</div>
      <div>accompanyingCanvas</div>
      <div>placeholderCanvas</div>
      <KeyValuePairArray
        onClick={() => console.log("rendering")}
        propertyName={"rendering"}
        array={manifest?.rendering}
      />
      <KeyObjectPairing
        propertyName={"requiredStatement"}
        object={manifest?.requiredStatement}
      />
      <div>rights</div>
      <KeyValuePairArray
        onClick={() => console.log("clicked seeAlso")}
        propertyName={"seeAlso"}
        array={manifest?.seeAlso}
      />
      <KeyValuePairArray
        onClick={() => console.log("clicked service")}
        propertyName={"service"}
        array={manifest?.service}
      />
      <KeyValuePairArray
        onClick={() => console.log("clicked services")}
        propertyName={"services"}
        array={manifest?.services}
      />
      <div>start</div>
      <KeyValuePairArray
        onClick={() => console.log("clicked structures")}
        propertyName={"structures"}
        array={manifest?.structures}
      />
      <div>summary</div>
      <KeyValuePairArray
        onClick={() => console.log("clicked thumbnail")}
        propertyName={"thumbnail"}
        array={manifest?.thumbnail}
      />
      <KeyValuePairString
        onClick={() => console.log("clicked viewingDirection")}
        propertyName={"viewingDirection"}
        // @ts-ignore
        value={manifest.viewingDirection}
      />
      <KeyValuePairString
        onClick={() => console.log("clicked @context")}
        propertyName={"@context"}
        // @ts-ignore
        value={manifest["@context"]}
      />
    </TreeContainer>
  );
};
