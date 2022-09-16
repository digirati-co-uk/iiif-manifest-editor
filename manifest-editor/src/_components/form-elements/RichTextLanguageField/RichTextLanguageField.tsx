import * as S from "./RichTextLanguageField.styles";
import { SVGProps, useReducer, useState } from "react";
import { CloseIcon } from "@/icons/CloseIcon";
import Textarea from "react-textarea-autosize";
import {
  Editor,
  EditorState,
  convertFromHTML,
  ContentState,
  RichUtils,
  EditorCommand,
  DraftHandleValue,
} from "draft-js";
import { convertToHTML } from "draft-convert";
import DOMPurify from "dompurify";

interface RichTextLanguageField {
  language: string;
  value: string;
  onUpdate: (value: string, lang: string) => void;
  onRemove?: () => void;
}

export function RichTextLanguageField(props: RichTextLanguageField) {
  const isHtml = props.value[0] === "<";
  const [htmlMode, _toggleHtmlMode] = useReducer((s) => !s, !isHtml);
  const [focus, setIsFocused] = useState(false);
  // Need to hold 2 states, the editorState and the textState
  const [textState, setTextState] = useState("Testing a value");
  const [editorState, setEditorState] = useState(() => {
    const blocksFromHTML = convertFromHTML(textState);
    return EditorState.createWithContent(
      ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap)
    );
  });

  const controls = {
    bold() {
      setEditorState((prevState) => RichUtils.toggleInlineStyle(prevState, "BOLD"));
    },
    italic() {
      setEditorState((prevState) => RichUtils.toggleInlineStyle(prevState, "ITALIC"));
    },
    underline() {
      setEditorState((prevState) => RichUtils.toggleInlineStyle(prevState, "UNDERLINE"));
    },
  };

  const handleKeyCommand = (command: EditorCommand, editorState: EditorState): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      setEditorState(newState);
      return "handled";
    }

    return "not-handled";
  };

  const handleReturn = (e: any) => {
    if (!e.shiftKey) {
      setEditorState(RichUtils.insertSoftNewline(editorState));
      return "handled";
    }
    return "not-handled";
  };

  const isStateHtml = textState[0] === "<";

  const toggleHtmlMode = () => {
    //

    if (htmlMode) {
      const content = editorState.getCurrentContent();
      const blocks = content.getBlocksAsArray().filter((b) => b.getDepth() === 0);
      setTextState(
        convertToHTML({
          blockToHTML: (block) => {
            //
            if (blocks.length === 1 && block.depth === 0 && block.type === "unstyled") {
              return <span />;
            }
          },
        })(content)
          .replace(/<br\/>/g, "<br/>\n")
          .replace(/<\/p><p>/g, "</p>\n<p>")
      );
    } else {
      const blocksFromHTML = convertFromHTML(
        textState
          .replace(/<\/p>\n<p>/g, "</p><p>")
          .replace(/<br\/>\n/g, "<br/>")
          .replace(/\n/g, "<br/>")
      );
      setEditorState(
        EditorState.createWithContent(
          ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap)
        )
      );
    }

    _toggleHtmlMode();
  };

  const stripTags = () => {
    //
    setTextState((t) =>
      DOMPurify.sanitize(
        t
          .replace(/<br\/>\n/, "\n")
          .replace(/<br\/>/, "\n")
          .replace(/<\/p><p/, "</p>\n<p"),
        { ALLOWED_TAGS: [] }
      )
    );
  };

  //
  return (
    <S.Container>
      <S.ToolbarContainer>
        {!htmlMode ? (
          <>
            <S.ToolbarItem onClick={toggleHtmlMode}>
              <a>{isStateHtml ? "Edit HTML" : "Convert to HTML"}</a>
            </S.ToolbarItem>
            {isStateHtml ? (
              <S.ToolbarItem onClick={stripTags}>
                <a>Remove HTML</a>
              </S.ToolbarItem>
            ) : null}
          </>
        ) : (
          <>
            <S.ToolbarItem
              style={{ fontWeight: "bold" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={controls.bold}
            >
              B
            </S.ToolbarItem>
            <S.ToolbarItem
              style={{ fontStyle: "italic" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={controls.italic}
            >
              i
            </S.ToolbarItem>
            <S.ToolbarItem
              style={{ textDecoration: "underline" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={controls.underline}
            >
              u
            </S.ToolbarItem>
            <S.ToolbarItem onClick={toggleHtmlMode}>source</S.ToolbarItem>
          </>
        )}
        <S.ToolbarSpacer />
        <S.ToolbarItem>en V</S.ToolbarItem>
        {props.onRemove ? (
          <S.CloseIconContainer onClick={props.onRemove}>
            <CloseIcon />
          </S.CloseIconContainer>
        ) : null}
      </S.ToolbarContainer>
      <S.InputContainer $focus={focus}>
        {htmlMode ? (
          <S.StyledEditor>
            <Editor
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              editorState={editorState}
              handleKeyCommand={handleKeyCommand}
              onChange={setEditorState}
              handleReturn={handleReturn}
            />
          </S.StyledEditor>
        ) : (
          <S.InputInvisible
            as={Textarea}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={textState}
            onChange={(e: any) => setTextState(e.currentTarget.value)}
          />
        )}
        <S.CopyText>[C]</S.CopyText>
      </S.InputContainer>
    </S.Container>
  );
}
