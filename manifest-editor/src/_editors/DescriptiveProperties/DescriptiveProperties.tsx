import { EmptyPrompt } from "@/_components/ui/EmptyPrompt/EmptyPrompt";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { allRights } from "@/editor-api/meta/rights";
import { Input, InputContainer, InputFieldset, InputLabel } from "@/editors/Input";
import { LanguageFieldEditor } from "@/editors/generic/LanguageFieldEditor/LanguageFieldEditor";
import { useEditingResource, useEditor } from "@/shell/EditingStack/EditingStack";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { useState } from "react";
import { datePickerStyles } from "./DescriptiveProperties.styles";
import { createAppActions } from "@/_editors/LinkingProperties/LinkingProperties.helpers";
import { LinkingPropertyList } from "@/_components/ui/LinkingPropertyList/LinkingPropertyList";

export function DescriptiveProperties() {
  const resource = useEditingResource();
  const { descriptive, notAllowed } = useEditor();
  const [requiredStatementVisible, setRequiredStatementVisible] = useState(false);
  const { edit } = useLayoutActions();
  const {
    label,
    summary,
    language,
    navDate,
    provider,
    requiredStatement,
    rights,
    thumbnail,
    // Still @todo.
    accompanyingCanvas,
    placeholderCanvas,
  } = descriptive;

  return (
    <>
      <PaddedSidebarContainer>
        {!notAllowed.includes("label") ? (
          <LanguageFieldEditor
            focusId={label.focusId()}
            label={"Label"}
            fields={label.get()}
            onSave={(e: any) => label.set(e.toInternationalString())}
          />
        ) : null}
        {!notAllowed.includes("summary") ? (
          <LanguageFieldEditor
            focusId={summary.focusId()}
            label={"Summary"}
            fields={summary.get()}
            onSave={(e: any) => summary.set(e.toInternationalString())}
          />
        ) : null}

        {!notAllowed.includes("thumbnail") ? (
          <LinkingPropertyList
            label="Thumbnail"
            property="thumbnail"
            items={thumbnail.get()}
            singleMode
            reorder={(ctx) => thumbnail.reorder(ctx.startIndex, ctx.endIndex)}
            createActions={createAppActions(thumbnail)}
            creationType="ContentResource"
            emptyLabel="No thumbnail"
            parent={resource?.resource}
          />
        ) : null}

        {!notAllowed.includes("rights") ? (
          <InputContainer wide>
            <InputLabel htmlFor={rights.focusId()}>Rights</InputLabel>
            <Input
              id={rights.focusId()}
              value={rights.get() || ""}
              onChange={(e) => rights.set(e.target.value)}
              list="valid-rights"
            />
            <datalist id="valid-rights">
              {allRights.map((url) => (
                <option key={url} value={url} />
              ))}
            </datalist>
          </InputContainer>
        ) : null}

        {!notAllowed.includes("navDate") ? (
          <InputContainer wide>
            <InputLabel htmlFor={navDate.focusId()}>Nav Date</InputLabel>
            <DateTimePicker
              className={datePickerStyles}
              id={navDate.focusId()}
              value={navDate.getDate()}
              onChange={(v) => navDate.setDate(v)}
            />
          </InputContainer>
        ) : null}

        {!notAllowed.includes("requiredStatement") ? (
          <InputContainer wide>
            <InputLabel htmlFor={requiredStatement.focusId()}>Required statement</InputLabel>
            {!requiredStatement.get() && !requiredStatementVisible ? (
              <EmptyPrompt
                action={{
                  id: requiredStatement.focusId(),
                  label: "Add new",
                  onClick: () => setRequiredStatementVisible(true),
                }}
              >
                No required statement
              </EmptyPrompt>
            ) : (
              <InputFieldset id={requiredStatement.focusId()}>
                <LanguageFieldEditor
                  focusId={requiredStatement.focusId() + "_label"}
                  label={"Label"}
                  fields={requiredStatement.get()?.label || { none: [] }}
                  onSave={(e: any) => requiredStatement.updateLabel(e.toInternationalString())}
                />
                <LanguageFieldEditor
                  focusId={requiredStatement.focusId() + "_value"}
                  label={"Value"}
                  fields={requiredStatement.get()?.value || { none: [] }}
                  onSave={(e: any) => requiredStatement.update(e.toInternationalString())}
                />
              </InputFieldset>
            )}
          </InputContainer>
        ) : null}

        {!notAllowed.includes("provider") && provider.get() ? (
          <InputContainer wide>
            <InputLabel>Provider</InputLabel>
            {(provider.get() || []).map((item) => {
              return <div onClick={() => edit(item)}>{item.id}</div>;
            })}
          </InputContainer>
        ) : null}

        {/* NOTE: If this is an annotation, then it will be a string, otherwise a list of strings */}
        {!notAllowed.includes("language") ? (
          <InputContainer wide>
            <InputLabel htmlFor={language.focusId()}>Language</InputLabel>
            <Input
              id={language.focusId()}
              value={(language.get() || [])[0]}
              onChange={(e) => language.set([e.target.value])}
            />
          </InputContainer>
        ) : null}
      </PaddedSidebarContainer>
    </>
  );
}
