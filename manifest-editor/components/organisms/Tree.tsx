import { useEffect, useContext } from "react";
import { useManifest } from "../../hooks/useManifest";

import styled from "styled-components";
import { KeyValuePairString } from "../atoms/IIIFElementsShared";
import { KeyValuePairArray } from "../atoms/IIIFElementsArrays";
import { KeyObjectPairing } from "../atoms/IIIFElementsObject";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";
const TreeContainer = styled.div`
  z-index: 12;
  font-size: 0.85em;
  line-height: 1.3em;
  max-width: 40vw;
`;

export const Tree: React.FC = () => {
  const manifest = useManifest();

  const editorContext = useContext(ManifestEditorContext);

  useEffect(() => {
    {
      Object.entries(
        // @ts-ignore
        manifest ? manifest : {}
      ).map(([key, value], index: number) => {
        console.log(key, value);
      });
    }
    console.log(editorContext);
  }, [manifest]);

  return (
    <TreeContainer>
      <h5>IIIF Properties</h5>
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
        array={manifest?.annotations || []}
      />
      <KeyValuePairArray
        onClick={() => console.log("behaviour type")}
        propertyName={"behavior"}
        array={manifest?.behavior || []}
      />
      <KeyValuePairArray
        onClick={() => console.log("homepage")}
        propertyName={"homepage"}
        array={manifest?.homepage || []}
      />
      <KeyValuePairArray
        onClick={() => console.log("items")}
        propertyName={"items"}
        array={manifest?.items || []}
      />
      <KeyObjectPairing propertyName={"label"} object={manifest?.label || {}} />
      <KeyValuePairArray
        onClick={() => console.log("logo")}
        propertyName={"logo"}
        array={manifest?.logo || []}
      />
      <KeyValuePairArray
        onClick={() => console.log("metadata")}
        propertyName={"metadata"}
        array={manifest?.metadata || []}
      />
      <KeyObjectPairing
        propertyName={"motivation"}
        object={manifest?.motivation || {}}
      />
      <KeyObjectPairing
        propertyName={"navDate"}
        object={manifest?.navDate || {}}
      />
      <KeyValuePairArray
        onClick={() => console.log("provider")}
        propertyName={"provider"}
        array={manifest?.provider || []}
      />
      <KeyValuePairArray
        onClick={() => console.log("partOf")}
        propertyName={"partOf"}
        array={manifest?.partOf || []}
      />
      <KeyObjectPairing
        propertyName={"posterCanvas"}
        object={manifest?.posterCanvas || {}}
      />
      <KeyObjectPairing
        propertyName={"accompanyingCanvas"}
        object={manifest?.accompanyingCanvas || {}}
      />
      <KeyObjectPairing
        propertyName={"placeholderCanvas"}
        object={manifest?.placeholderCanvas || {}}
      />
      <KeyValuePairArray
        onClick={() => console.log("rendering")}
        propertyName={"rendering"}
        array={manifest?.rendering || []}
      />
      <KeyObjectPairing
        propertyName={"requiredStatement"}
        object={manifest?.requiredStatement || {}}
      />
      <KeyObjectPairing
        propertyName={"rights"}
        object={manifest?.rights || {}}
      />
      <KeyValuePairArray
        onClick={() => console.log("clicked seeAlso")}
        propertyName={"seeAlso"}
        array={manifest?.seeAlso || []}
      />
      <KeyValuePairArray
        onClick={() => console.log("clicked service")}
        propertyName={"service"}
        array={manifest?.service || []}
      />
      <KeyValuePairArray
        onClick={() => console.log("clicked services")}
        propertyName={"services"}
        array={manifest?.services || []}
      />
      <KeyObjectPairing propertyName={"start"} object={manifest?.start || {}} />

      <KeyValuePairArray
        onClick={() => console.log("clicked structures")}
        propertyName={"structures"}
        array={manifest?.structures || []}
      />
      <KeyObjectPairing
        propertyName={"summary"}
        object={manifest?.summary || {}}
      />
      <KeyValuePairArray
        onClick={() => console.log("clicked thumbnail")}
        propertyName={"thumbnail"}
        array={manifest?.thumbnail || []}
      />
      <KeyValuePairString
        onClick={() => console.log("clicked viewingDirection")}
        propertyName={"viewingDirection"}
        value={manifest?.viewingDirection}
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
