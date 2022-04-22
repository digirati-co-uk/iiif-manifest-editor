import { useContext, useState } from "react";
import { useManifest } from "../../hooks/useManifest";
import { getValue } from "@iiif/vault-helpers";

import { KeyValuePairString, KeyManifest } from "./IIIFElementsShared";
import { KeyValuePairArray } from "./IIIFElementsArrays";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { Annotations } from "./IIIFAnnotationPages";
import { DownIcon } from "../icons/DownIcon";

import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";

import styled from "styled-components";
import { FlexContainer } from "../layout/FlexContainer";
import { useVault } from "react-iiif-vault";

const TreeContainer = styled.div`
  z-index: 12;
  font-size: 0.75rem;
  max-height: 100%;
  overflow-y: auto;
  width: 350px;
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    width: 100%;
    border-right: none;
  }
`;

const HeaderPanel = styled.div`
  background-color: ${(props: any) =>
    props.theme.color.lightgrey || "lightgrey"};
  border-top: 1px solid ${(props: any) => props.theme.color.grey || "grey"};
  border-bottom: 1px solid ${(props: any) => props.theme.color.grey || "grey"};
  display: flex;
  align-items: center;
  padding: ${(props: any) => props.theme.padding.medium || "1rem"}
    ${(props: any) => props.theme.padding.small || "0.5rem"};
  justify-content: space-between;
`;

const IIIFTitle = styled.div`
  padding: ${(props: any) => props.theme.padding.medium || "1rem"}
    ${(props: any) => props.theme.padding.small || "0.5rem"};
  font-weight: bold;
  display: inline;
`;

export const Tree: React.FC = () => {
  const manifest = useManifest();
  const editorContext = useContext(ManifestEditorContext);
  const [open, setOpen] = useState(true);
  const vault = useVault();

  return (
    <TreeContainer key={manifest?.id}>
      <HeaderPanel onClick={() => setOpen(!open)}>
        <FlexContainer>
          <KeyManifest
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest")
                : () => {}
            }
          >
            {manifest?.type}
          </KeyManifest>
          <IIIFTitle>{getValue(manifest?.label)}</IIIFTitle>
        </FlexContainer>
        <DownIcon rotate={open ? 180 : 0} />
      </HeaderPanel>
      {open && (
        <>
          <KeyObjectPairing
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 0)
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
                ? () => editorContext.changeSelectedProperty("manifest", 1)
                : () => {}
            }
            propertyName={"behavior"}
            array={manifest?.behavior || []}
          />
          <KeyValuePairArray
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 2)
                : () => {}
            }
            propertyName={"homepage"}
            array={manifest?.homepage || []}
          />
          <KeyValuePairArray
            // @ts-ignore
            key={manifest}
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 4)
                : () => {}
            }
            propertyName={"items"}
            array={vault.get(manifest).items || []}
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
                ? () => editorContext.changeSelectedProperty("manifest", 1)
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
                ? () => editorContext.changeSelectedProperty("manifest", 0)
                : () => {}
            }
            propertyName={"navDate"}
            object={manifest?.navDate || {}}
          />
          <KeyValuePairArray
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 2)
                : () => {}
            }
            propertyName={"provider"}
            array={manifest?.provider || []}
          />
          <KeyValuePairArray
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 2)
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
                ? () => editorContext.changeSelectedProperty("manifest", 2)
                : () => {}
            }
            propertyName={"rendering"}
            array={manifest?.rendering || []}
          />
          <KeyObjectPairing
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 0)
                : () => {}
            }
            propertyName={"requiredStatement"}
            object={manifest?.requiredStatement || {}}
          />
          <KeyValuePairString
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 0)
                : () => {}
            }
            propertyName={"rights"}
            value={manifest?.rights || ""}
          />
          <KeyValuePairArray
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 3)
                : () => {}
            }
            propertyName={"seeAlso"}
            array={manifest?.seeAlso || []}
          />
          <KeyValuePairArray
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 2)
                : () => {}
            }
            propertyName={"service"}
            array={manifest?.service || []}
          />
          <KeyValuePairArray
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 2)
                : () => {}
            }
            propertyName={"services"}
            array={manifest?.services || []}
          />
          <KeyObjectPairing
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 4)
                : () => {}
            }
            propertyName={"start"}
            object={manifest?.start || {}}
          />

          <KeyValuePairArray
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 4)
                : () => {}
            }
            propertyName={"structures"}
            array={manifest?.structures || []}
          />
          <KeyObjectPairing
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 0)
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
            array={vault.get(manifest) || []}
          />
          <KeyValuePairString
            onClick={
              editorContext
                ? () => editorContext.changeSelectedProperty("manifest", 2)
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
            value={manifest && manifest["@context"]}
          />
        </>
      )}
    </TreeContainer>
  );
};
