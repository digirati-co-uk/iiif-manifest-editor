import { Editor, EditorState } from "draft-js";
import { useState } from "react";
import styled from "styled-components";

const StyledEditor = styled.div`
  padding: 0.8em;
  flex: 1;
  font-size: 1em;
  //border-top: 1px solid #f8f9fa;
  margin-bottom: 1px;
`;

export function RichTextField() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  return (
    <StyledEditor>
      <Editor editorState={editorState} onChange={setEditorState} />
    </StyledEditor>
  );
}
