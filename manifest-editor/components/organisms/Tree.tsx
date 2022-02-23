import { useEffect, useContext, useState } from "react";
import { useManifest } from "../../hooks/useManifest";
import { getValue } from "@iiif/vault-helpers";
import { KeyValuePairString, KeyManifest } from "../atoms/IIIFElementsShared";
import { KeyValuePairArray } from "../atoms/IIIFElementsArrays";
import { KeyObjectPairing } from "../atoms/IIIFElementsObject";
import { Annotations } from "../atoms/IIIFAnnotationPages";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";
import { DownIcon } from "../icons/DownIcon";
import { Button } from "../atoms/Button";

import styled from "styled-components";

const TreeContainer = styled.div`
  z-index: 12;
  font-size: 0.85em;
  line-height: 1.3em;
`;

const HeaderPanel = styled.div`
  background-color: #f6f6f6;
  border-top: 1px solid #dddddd;
  border-bottom: 1px solid #dddddd;
  height: 51px;
  display: flex;
  align-items: center;
  padding: 1rem 0.75rem;
  justify-content: space-between;
`;

const IIIFTitle = styled.div`
  padding: 1rem 0.75rem;
  font-size: 0.875rem;
  font-weight: bold;
  white-space: nowrap;
  display: inline;
`;

export const Tree: React.FC = () => {
  const manifest = useManifest();
  const editorContext = useContext(ManifestEditorContext);
  const [open, setOpen] = useState(true);
  useEffect(() => {
    console.log(manifest);
  }, [manifest]);

  return (
    <TreeContainer>
      <HeaderPanel>
        <KeyManifest>{manifest?.type}</KeyManifest>
        <IIIFTitle>{getValue(manifest?.label)}</IIIFTitle>
        <Button onClick={() => setOpen(!open)}>
          <DownIcon rotate={open ? 180 : 0} />
        </Button>
      </HeaderPanel>
      {open && (
        <>
          <KeyObjectPairing
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("label")
                : () => {}
            }
            propertyName={"label"}
            object={manifest?.label || {}}
          />
          <Annotations
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
                ? () =>
                    editorContext.changeSelectedProperty("accompanyingCanvas")
                : () => {}
            }
            propertyName={"accompanyingCanvas"}
            object={manifest?.accompanyingCanvas || {}}
          />
          <KeyObjectPairing
            onClick={
              editorContext
                ? () =>
                    editorContext.changeSelectedProperty("placeholderCanvas")
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
                ? () =>
                    editorContext.changeSelectedProperty("requiredStatement")
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
        </>
      )}
    </TreeContainer>
  );
};
