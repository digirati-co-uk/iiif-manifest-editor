import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { useState } from "react";
import $ from "./DescriptiveProperties.module.css";
import { allRights } from "@manifest-editor/editor-api";
import { useEditingResource, useEditor, useLayoutActions } from "@manifest-editor/shell";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { InputContainer, InputLabel, Input, InputFieldset } from "../../components/Input";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { LinkingPropertyList } from "../../components/LinkingPropertyList/LinkingPropertyList";
import { createAppActions } from "../../helpers/create-app-actions";
import { EmptyPrompt } from "../../components/EmptyPrompt/EmptyPrompt";

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
            containerId={label.containerId()}
            focusId={label.focusId()}
            label={"Label"}
            fields={label.get()}
            onSave={(e: any) => label.set(e.toInternationalString())}
          />
        ) : null}
        {!notAllowed.includes("summary") ? (
          <LanguageFieldEditor
            containerId={summary.containerId()}
            focusId={summary.focusId()}
            label={"Summary"}
            fields={summary.get()}
            onSave={(e: any) => summary.set(e.toInternationalString())}
          />
        ) : null}

        {!notAllowed.includes("thumbnail") ? (
          <LinkingPropertyList
            containerId={thumbnail.containerId()}
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
          <InputContainer $wide id={rights.containerId()}>
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
          <InputContainer $wide id={navDate.containerId()}>
            <InputLabel htmlFor={navDate.focusId()}>Nav Date</InputLabel>
            <DateTimePicker
              className={$.datePicker}
              id={navDate.focusId()}
              value={navDate.getDate()}
              onChange={(v) => navDate.setDate(v)}
            />
          </InputContainer>
        ) : null}

        {!notAllowed.includes("requiredStatement") ? (
          <InputContainer $wide id={requiredStatement.containerId()}>
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
          <InputContainer $wide id={provider.containerId()}>
            <InputLabel>Provider</InputLabel>
            {(provider.get() || []).map((item) => {
              return (
                <div key={item.id} onClick={() => edit(item)}>
                  {item.id}
                </div>
              );
            })}
          </InputContainer>
        ) : null}

        {/* NOTE: If this is an annotation, then it will be a string, otherwise a list of strings */}
        {!notAllowed.includes("language") ? (
          <InputContainer $wide id={language.containerId()}>
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
