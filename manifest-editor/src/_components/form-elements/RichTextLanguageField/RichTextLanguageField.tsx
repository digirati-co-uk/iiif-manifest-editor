import * as S from "./RichTextLanguageField.styles";
import { useReducer, useState } from "react";
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
  ContentBlock,
  CompositeDecorator,
} from "draft-js";
import { convertToHTML } from "draft-convert";
import linkIcon from "@/icons/LinkIcon.svg";
import copyIcon from "@/icons/CopyIcon.svg";
import codeIcon from "@/icons/CodeIcon.svg";
import editIcon from "@/icons/EditIcon.svg";
import tickIcon from "@/icons/TickIcon.svg";
import DOMPurify from "dompurify";
import { useCreateLink } from "@/_components/form-elements/RichTextLanguageField/hooks/use-create-link";

interface RichTextLanguageField {
  language: string;
  value: string;
  onUpdate: (value: string, lang: string) => void;
  onRemove?: () => void;
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
  const [htmlMode, _toggleHtmlMode] = useReducer((s) => !s, !isHtml);
  const [focus, setIsFocused] = useState(false);
  // Need to hold 2 states, the editorState and the textState
  const [textState, setTextState] = useState("Testing a value");
  const [editorState, setEditorState] = useState(() => {
    const blocksFromHTML = convertFromHTML(textState);
    return EditorState.createWithContent(
      ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap),
      decorator
    );
  });
  const [showLinkForm, setShowLinkForm] = useState(false);
  const linkForm = useCreateLink(editorState, setEditorState, () => setShowLinkForm(false));

  const [showControls, setShowControls] = useState(false);

  // State.
  const isStateHtml = textState[0] === "<";

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
          entityToHTML: (entity) => {
            if (entity.type === "LINK") {
              return <a href={entity.data.url} />;
            }
            return <span />;
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
          ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap),
          decorator
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
              <img src={linkIcon} alt="Add link" />
            </S.ToolbarItem>
            <S.ToolbarItem onClick={toggleHtmlMode}>
              <img src={codeIcon} alt="View source" />
            </S.ToolbarItem>
          </>
        )}
        <S.ToolbarSpacer />
        <S.ToolbarItem>
          <select name="langs">
            <option>en</option>
            <option>fr</option>
          </select>
        </S.ToolbarItem>

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
      <S.InputContainer $focus={focus} $disabled={showLinkForm}>
        {htmlMode ? (
          <>
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
          </>
        ) : (
          <S.InputInvisible
            as={Textarea}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={textState}
            onChange={(e: any) => setTextState(e.currentTarget.value)}
          />
        )}
        {showControls || focus ? (
          <S.CopyText onMouseDown={() => setShowControls((c) => !c)}>
            {showControls ? (
              <img src={tickIcon} alt="Copy value to clipboard" width="15px" />
            ) : (
              <img src={editIcon} alt="Copy value to clipboard" width="15px" />
            )}
          </S.CopyText>
        ) : (
          <S.LanguageDisplay onClick={() => setShowControls(true)}>
            <S.LanguageDisplayInner>{props.language}</S.LanguageDisplayInner>
          </S.LanguageDisplay>
        )}
      </S.InputContainer>
    </S.Container>
  );
}
