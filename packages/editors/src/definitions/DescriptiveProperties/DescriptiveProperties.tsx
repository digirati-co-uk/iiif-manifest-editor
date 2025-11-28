import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { ActionButton, AddIcon, EmptyState, PaddedSidebarContainer, ViewProvider } from "@manifest-editor/components";
import { allRights } from "@manifest-editor/editor-api";
import { useCreator, useEditingResource, useEditor, useLayoutActions } from "@manifest-editor/shell";
import { useState } from "react";
import { EmptyPrompt } from "../../components/EmptyPrompt/EmptyPrompt";
import { Input, InputContainer, InputFieldset, InputLabel } from "../../components/Input";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { LinkingPropertyList } from "../../components/LinkingPropertyList/LinkingPropertyList";
import { createAppActions } from "../../helpers/create-app-actions";
import $ from "./DescriptiveProperties.module.css";

export function DescriptiveProperties() {
  const resource = useEditingResource();
  const [requiredStatementVisible, setRequiredStatementVisible] = useState(false);
  const { descriptive, notAllowed } = useEditor();
  const { edit } = useLayoutActions();

  const [canCreateProvider, providerActions] = useCreator(resource?.resource, "provider", "Agent");

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
                focusId={`${requiredStatement.focusId()}_label`}
                label={"Label"}
                fields={requiredStatement.get()?.label || { none: [] }}
                onSave={(e: any) => requiredStatement.updateLabel(e.toInternationalString())}
              />
              <LanguageFieldEditor
                focusId={`${requiredStatement.focusId()}_value`}
                label={"Value"}
                fields={requiredStatement.get()?.value || { none: [] }}
                onSave={(e: any) => requiredStatement.update(e.toInternationalString())}
              />
            </InputFieldset>
          )}
        </InputContainer>
      ) : null}

      {!notAllowed.includes("provider") ? (
        <InputContainer $wide id={provider.containerId()}>
          <InputLabel htmlFor={provider.focusId()}>Provider</InputLabel>

          {!(provider.get() || []).length ? (
            <>
              <EmptyState $noMargin $box>
                Add a provider to attach your institution name and logo to this Manifest.
              </EmptyState>
              <div className="pt-2">
                <ActionButton
                  onPress={async () => {
                    providerActions.creator("@manifest-editor/provider", {
                      id: "",
                      type: "Agent",
                      label: { en: ["Your institution"] },
                    });
                  }}
                >
                  <AddIcon /> Add Provider
                </ActionButton>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 mb-2">
                {(provider.get() || []).map((ref, i) => (
                  <ViewProvider key={i} resource={ref} onPress={() => edit(ref)} />
                ))}
              </div>

              <div>
                <ActionButton
                  onPress={() =>
                    providerActions.creator("@manifest-editor/provider", {
                      id: "",
                      type: "Agent",
                      label: { en: ["Your institution"] },
                    })
                  }
                >
                  <AddIcon /> Add Provider
                </ActionButton>
              </div>
            </>
          )}
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
  );
}
