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
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("id")
            : () => {}
        }
        propertyName={"id"}
        value={manifest?.id}
      />
      <KeyValuePairString
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("type")
            : () => {}
        }
        propertyName={"type"}
        value={manifest?.type}
      />
      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("annotations")
            : () => {}
        }
        propertyName={"annotations"}
        array={manifest?.annotations || []}
      />
      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("behavior")
            : () => {}
        }
        propertyName={"behavior"}
        array={manifest?.behavior || []}
      />
      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("homepage")
            : () => {}
        }
        propertyName={"homepage"}
        array={manifest?.homepage || []}
      />
      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("items")
            : () => {}
        }
        propertyName={"items"}
        array={manifest?.items || []}
      />
      <KeyObjectPairing
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("label")
            : () => {}
        }
        propertyName={"label"}
        object={manifest?.label || {}}
      />
      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("logo")
            : () => {}
        }
        propertyName={"logo"}
        array={manifest?.logo || []}
      />
      <KeyObjectPairing
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("metadata")
            : () => {}
        }
        propertyName={"metadata"}
        object={manifest?.metadata || {}}
      />
      <KeyObjectPairing
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("motivation")
            : () => {}
        }
        propertyName={"motivation"}
        object={manifest?.motivation || {}}
      />
      <KeyObjectPairing
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("navDate")
            : () => {}
        }
        propertyName={"navDate"}
        object={manifest?.navDate || {}}
      />
      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("provider")
            : () => {}
        }
        propertyName={"provider"}
        array={manifest?.provider || []}
      />
      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("partOf")
            : () => {}
        }
        propertyName={"partOf"}
        array={manifest?.partOf || []}
      />
      <KeyObjectPairing
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("posterCanvas")
            : () => {}
        }
        propertyName={"posterCanvas"}
        object={manifest?.posterCanvas || {}}
      />
      <KeyObjectPairing
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("accompanyingCanvas")
            : () => {}
        }
        propertyName={"accompanyingCanvas"}
        object={manifest?.accompanyingCanvas || {}}
      />
      <KeyObjectPairing
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("placeholderCanvas")
            : () => {}
        }
        propertyName={"placeholderCanvas"}
        object={manifest?.placeholderCanvas || {}}
      />
      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("rendering")
            : () => {}
        }
        propertyName={"rendering"}
        array={manifest?.rendering || []}
      />
      <KeyObjectPairing
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("requiredStatement")
            : () => {}
        }
        propertyName={"requiredStatement"}
        object={manifest?.requiredStatement || {}}
      />
      <KeyValuePairString
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("rights")
            : () => {}
        }
        propertyName={"rights"}
        value={manifest?.rights || ""}
      />
      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("seeAlso")
            : () => {}
        }
        propertyName={"seeAlso"}
        array={manifest?.seeAlso || []}
      />
      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("service")
            : () => {}
        }
        propertyName={"service"}
        array={manifest?.service || []}
      />
      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("services")
            : () => {}
        }
        propertyName={"services"}
        array={manifest?.services || []}
      />
      <KeyObjectPairing
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("start")
            : () => {}
        }
        propertyName={"start"}
        object={manifest?.start || {}}
      />

      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("structures")
            : () => {}
        }
        propertyName={"structures"}
        array={manifest?.structures || []}
      />
      <KeyObjectPairing
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("summary")
            : () => {}
        }
        propertyName={"summary"}
        object={manifest?.summary || {}}
      />
      <KeyValuePairArray
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("thumbnail")
            : () => {}
        }
        propertyName={"thumbnail"}
        array={manifest?.thumbnail || []}
      />
      <KeyValuePairString
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("viewingDirection")
            : () => {}
        }
        propertyName={"viewingDirection"}
        value={manifest?.viewingDirection}
      />
      <KeyValuePairString
        onClick={
          editorContext
            ? () => editorContext.changeSelectedProperty("@context")
            : () => {}
        }
        propertyName={"@context"}
        // @ts-ignore
        value={manifest["@context"]}
      />
    </TreeContainer>
  );
};
