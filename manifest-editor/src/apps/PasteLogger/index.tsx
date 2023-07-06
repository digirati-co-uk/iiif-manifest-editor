import { LayoutPanel } from "@/shell";
import { Reference } from "@iiif/presentation-3";
import { useEffect, useState } from "react";
import { UniversalCopyTarget } from "@/shell";
import styled from "styled-components";
import { useVault } from "react-iiif-vault";
import { Spinner } from "@/madoc/components/icons/Spinner";

export default { id: "copy-paste", title: "Copy and paste", dev: true };

export const centerPanels: LayoutPanel[] = [
  {
    id: "test-paste-ref",
    label: "Test paste reference",
    render: () => <TestPasteReference />,
  },
];

const DropTarget = styled.pre`
  width: 600px;
  min-height: 250px;
  background: #ddd;
  margin: auto auto 1em;
`;

function TestPasteReference() {
  const [ref, setRef] = useState<Reference>();
  const [link, setLink] = useState<string>();
  const vault = useVault();
  const [resp, setResp] = useState<any>();

  return (
    <div style={{ padding: 40, overflowY: "auto" }}>
      <h1>Test paste reference</h1>
      <UniversalCopyTarget
        onPasteReference={setRef}
        onDropReference={setRef}
        onPasteLink={setLink}
        onPasteAnalysis={setResp}
        as={DropTarget}
        style={{ width: 600, height: 250, background: "#f9f9f9" }}
      >
        {ref ? JSON.stringify(ref) : "- paste in reference to inspect -"}
      </UniversalCopyTarget>
      {ref ? <DropTarget>{JSON.stringify(vault.get(ref), null, 2)}</DropTarget> : null}
      {link || resp ? (
        <>
          <h2>Links</h2>
          {link ? <a href={link}>{link}</a> : null}
          {!resp ? <Spinner /> : <pre>{JSON.stringify(resp, null, 2)}</pre>}
        </>
      ) : null}
    </div>
  );
}
