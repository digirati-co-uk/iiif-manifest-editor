import * as S from "./RichTextLanguageField.styles";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Textarea from "react-textarea-autosize";
import {
  Editor,
  EditorState,
  convertFromHTML,
  ContentState,
  RichUtils,
  EditorCommand,
  DraftHandleValue,
  ContentBlock,
  CompositeDecorator,
} from "draft-js";
import { convertToHTML } from "draft-convert";
import DOMPurify from "dompurify";
import { useDebounce } from "tiny-use-debounce";
import { useCreateLink } from "./hooks/use-create-link";
import { LinkIcon } from "@manifest-editor/ui/icons/LinkIcon";
import { CodeIcon } from "@manifest-editor/ui/icons/CodeIcon";
import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { ComposableInput } from "../../form-elements/ComposableInput/ComposableInput";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";

interface RichTextLanguageField {
  id?: string;
  language: string;
  value: string;
  onUpdate: (value: string) => void;
  onRemove?: () => void;
  languages?: string[];
  onUpdateLanguage?: (lang: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const Link = (props: any) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return <S.InlineLink href={url}>{props.children}</S.InlineLink>;
};

function findLinkEntities(contentBlock: ContentBlock, callback: any, contentState: ContentState) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === "LINK";
  }, callback);
}

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  },
]);

export function RichTextLanguageField(props: RichTextLanguageField) {
  const isHtml = props.value[0] === "<";
  const editorRef = useRef<Editor>(null);
  const [htmlMode, setHtmlMode] = useState(isHtml);
  const [focus, _setIsFocused] = useState(false);
  // Need to hold 2 states, the editorState and the textState
  const [textState, _setTextState] = useState(props.value);
  const [editorState, _setEditorState] = useState(() => {
    const blocksFromHTML = convertFromHTML(textState);
    return EditorState.createWithContent(
      ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap),
      decorator
    );
  });
  const [showLinkForm, setShowLinkForm] = useState(false);

  const saveChanges = () => {
    props.onUpdate(getTextValue());
  };
  const debounceSave = useDebounce(saveChanges, 400);
  const [showControls, setShowControls] = useState(false);

  const setEditorState: React.Dispatch<React.SetStateAction<EditorState>> = (s) => {
    debounceSave();
    _setEditorState(s);
  };

  const setTextState: React.Dispatch<React.SetStateAction<string>> = (s) => {
    debounceSave();
    _setTextState(s);
  };

  const setIsFocused = (value: boolean) => {
    if (value && props.onFocus) {
      props.onFocus();
    }

    if (!value && props.onBlur) {
      props.onBlur();
    }

    _setIsFocused(value);
  };

  // State.
  const isStateHtml = textState[0] === "<";
  const linkForm = useCreateLink(editorState, setEditorState, () => setShowLinkForm(false));

  const isBold = htmlMode ? !!editorState.getCurrentInlineStyle().get("BOLD") : false;
  const isItalic = htmlMode ? !!editorState.getCurrentInlineStyle().get("ITALIC") : false;
  const isUnderline = htmlMode ? !!editorState.getCurrentInlineStyle().get("UNDERLINE") : false;

  // Getting current link.
  const contentState = editorState.getCurrentContent();
  const startKey = editorState.getSelection().getStartKey();
  const startOffset = editorState.getSelection().getStartOffset();
  const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
  const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
  const linkInstance = linkKey ? contentState.getEntity(linkKey) : null;
  const currentUrl = linkInstance ? linkInstance.getData().url : null;

  const isLink = htmlMode ? !!currentUrl : false;

  const getTextValue = () => {
    if (htmlMode) {
      const content = editorState.getCurrentContent();
      const blocks = content.getBlocksAsArray().filter((b) => b.getDepth() === 0);
      return convertToHTML({
        blockToHTML: (block) => {
          //
          if (blocks.length === 1 && block.depth === 0 && block.type === "unstyled") {
            return <span />;
          }
        },
        entityToHTML: (entity) => {
          if (entity.type === "LINK") {
            return <a href={entity.data.url} />;
          }
          return <span />;
        },
      })(content)
        .replace(/<br\/>/g, "<br/>\n")
        .replace(/<\/p><p>/g, "</p>\n<p>");
    } else {
      return textState;
    }
  };

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
    link() {
      setShowLinkForm((l) => !l);
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

  const toggleHtmlMode = () => {
    if (htmlMode) {
      setTextState(getTextValue());
    } else {
      const blocksFromHTML = convertFromHTML(
        textState
          .replace(/<\/p>\n<p>/g, "</p><p>")
          .replace(/<br\/>\n/g, "<br/>")
          .replace(/\n/g, "<br/>")
      );
      setEditorState(
        EditorState.createWithContent(
          ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap),
          decorator
        )
      );
    }

    setHtmlMode((m) => !m);
  };

  useLayoutEffect(() => {
    if (props.id) {
      const $el = document.querySelector(`label[for="${props.id}"]`);
      if ($el && htmlMode) {
        const currentEditor = editorRef.current;
        const listener = () => {
          if (htmlMode) {
            currentEditor?.focus();
          }
        };

        $el.addEventListener("click", listener);
        return () => {
          $el.removeEventListener("click", listener);
        };
      }
    }
    return () => void 0;
  }, [htmlMode, props.id]);

  useEffect(() => {
    return () => {
      debounceSave.cancel();
    };
  }, []);

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
      <S.ToolbarContainer $visible={showControls}>
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
              $active={isBold}
              style={{ fontWeight: "bold" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={controls.bold}
            >
              B
            </S.ToolbarItem>
            <S.ToolbarItem
              $active={isItalic}
              style={{ fontStyle: "italic" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={controls.italic}
            >
              i
            </S.ToolbarItem>
            <S.ToolbarItem
              $active={isUnderline}
              style={{ textDecoration: "underline" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={controls.underline}
            >
              u
            </S.ToolbarItem>
            <S.ToolbarItem
              $active={isLink || showLinkForm}
              onMouseDown={(e) => e.preventDefault()}
              onClick={controls.link}
            >
              <LinkIcon />
            </S.ToolbarItem>
            <S.ToolbarItem onClick={toggleHtmlMode}>
              <CodeIcon />
            </S.ToolbarItem>
          </>
        )}
        <S.ToolbarSpacer />
        {props.onUpdateLanguage && props.languages ? (
          <S.ToolbarItem>
            <select
              onFocus={props.onFocus}
              onBlur={props.onBlur}
              value={props.language}
              onChange={(e) => props.onUpdateLanguage && props.onUpdateLanguage(e.currentTarget.value)}
            >
              {props.languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </S.ToolbarItem>
        ) : null}

        {props.onRemove ? (
          <S.CloseIconContainer onClick={props.onRemove}>
            <CloseIcon />
          </S.CloseIconContainer>
        ) : null}
      </S.ToolbarContainer>
      {showLinkForm ? (
        <S.FloatingActionOuterContainer>
          <form {...linkForm}>
            <S.FloatingActionContainer>
              <S.FloatingActionInput type="text" name="link" defaultValue={currentUrl} />
              <S.FloatingActionButton type="submit" name="_action" value="add">
                Add link
              </S.FloatingActionButton>
              <S.FloatingActionButton type="submit" name="_action" value="remove">
                Remove
              </S.FloatingActionButton>
            </S.FloatingActionContainer>
          </form>
        </S.FloatingActionOuterContainer>
      ) : null}
      <ComposableInput.Container $focus={focus} disabled={showLinkForm}>
        {htmlMode ? (
          <>
            <S.StyledEditor>
              <Editor
                ref={editorRef}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  saveChanges();
                }}
                editorState={editorState}
                handleKeyCommand={handleKeyCommand}
                onChange={setEditorState}
                handleReturn={handleReturn}
              />
            </S.StyledEditor>
          </>
        ) : (
          <ComposableInput.Text
            id={props.id}
            as={Textarea}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              saveChanges();
            }}
            value={textState}
            onChange={(e: any) => setTextState(e.currentTarget.value)}
          />
        )}
        {showControls || focus ? (
          <S.CopyText onMouseDown={() => setShowControls((c) => !c)}>
            <TextFormatIcon />
          </S.CopyText>
        ) : (
          <S.LanguageDisplay onClick={() => setShowControls(true)}>
            {props.language === "none" ? null : <S.LanguageDisplayInner>{props.language}</S.LanguageDisplayInner>}
          </S.LanguageDisplay>
        )}
      </ComposableInput.Container>
    </S.Container>
  );
}
