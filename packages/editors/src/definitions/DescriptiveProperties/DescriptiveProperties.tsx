import { propertyLabels } from "@manifest-editor/editor-api";
import { useDisplayLabel } from "../../i18n";
import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { NavigationDateField } from "../../components/NavigationDateField";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import {
  ActionButton,
  AddIcon,
  DeleteIcon,
  EmptyState,
  PaddedSidebarContainer,
  ViewProvider,
} from "@manifest-editor/components";
import { allRights, creativeCommons } from "@manifest-editor/editor-api";
import { useCreator, useEditingResource, useEditor, useLayoutActions } from "@manifest-editor/shell";
import { useState } from "react";
import { EmptyPrompt } from "../../components/EmptyPrompt/EmptyPrompt";
import { Input, InputContainer, InputFieldset, InputLabel } from "../../components/Input";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { LinkingPropertyList } from "../../components/LinkingPropertyList/LinkingPropertyList";
import { createAppActions } from "../../helpers/create-app-actions";
import $ from "./DescriptiveProperties.module.css";

export function DescriptiveProperties() {
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
  const { resolveMessage } = useEditorI18n();
  const apiLabel = useDisplayLabel();
  const resource = useEditingResource();
  const [requiredStatementVisible, setRequiredStatementVisible] = useState(false);
  const { descriptive, notAllowed } = useEditor();
  const { edit } = useLayoutActions();

  const [_canCreateProvider, providerActions] = useCreator(resource?.resource, "provider", "Agent");

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
          label={apiLabel(propertyLabels.label)!}
          fields={label.get()}
          onSave={(e: any) => label.set(e.toInternationalString())}
        />
      ) : null}
      {!notAllowed.includes("summary") ? (
        <LanguageFieldEditor
          containerId={summary.containerId()}
          focusId={summary.focusId()}
          label={apiLabel(propertyLabels.summary)!}
          disallowHTML={false}
          fields={summary.get()}
          onSave={(e: any) => summary.set(e.toInternationalString())}
        />
      ) : null}

      {!notAllowed.includes("thumbnail") ? (
        <LinkingPropertyList
          containerId={thumbnail.containerId()}
          label={apiLabel(propertyLabels.thumbnail)!}
          property="thumbnail"
          items={thumbnail.get()}
          singleMode
          reorder={(ctx) => thumbnail.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(thumbnail, undefined, t, commonT)}
          creationType="ContentResource"
          emptyLabel={t("thumbnail.empty")}
          parent={resource?.resource}
        />
      ) : null}

      {!notAllowed.includes("rights") ? (
        <InputContainer $wide id={rights.containerId()}>
          <InputLabel htmlFor={rights.focusId()}>{apiLabel(propertyLabels.rights)!}</InputLabel>
          <Input
            id={rights.focusId()}
            value={rights.get() || ""}
            onChange={(e) => rights.set(e.target.value)}
            list="valid-rights"
          />
          <datalist id="valid-rights">
            {allRights.map((url) => {
              const definition = creativeCommons.find((item) => item.value === url);
              return (
                <option
                  key={url}
                  value={url}
                  label={definition ? apiLabel(definition) : undefined}
                  title={definition ? resolveMessage(definition.descriptionMessage, definition.description) : undefined}
                />
              );
            })}
          </datalist>
        </InputContainer>
      ) : null}

      {!notAllowed.includes("navDate") ? (
        <InputContainer $wide id={navDate.containerId()}>
          <InputLabel htmlFor={navDate.focusId()}>{apiLabel(propertyLabels.navDate)!}</InputLabel>
          <NavigationDateField
            className={$.datePicker}
            id={navDate.focusId()}
            value={navDate.getDate()}
            onChange={(v) => navDate.setDate(v)}
          />
        </InputContainer>
      ) : null}

      {!notAllowed.includes("requiredStatement") ? (
        <InputContainer $wide id={requiredStatement.containerId()}>
          <InputLabel htmlFor={requiredStatement.focusId()}>{apiLabel(propertyLabels.requiredStatement)!}</InputLabel>
          {!requiredStatement.get() && !requiredStatementVisible ? (
            <EmptyPrompt
              action={{
                id: requiredStatement.focusId(),
                label: t("ui.addNew"),
                onClick: () => setRequiredStatementVisible(true),
              }}
            >
              {t("ui.noRequiredStatement")}
            </EmptyPrompt>
          ) : (
            <InputFieldset id={requiredStatement.focusId()}>
              <LanguageFieldEditor
                focusId={`${requiredStatement.focusId()}_label`}
                label={apiLabel(propertyLabels.label)!}
                fields={requiredStatement.get()?.label || { none: [] }}
                onSave={(e: any) => requiredStatement.updateLabel(e.toInternationalString())}
              />
              <LanguageFieldEditor
                focusId={`${requiredStatement.focusId()}_value`}
                label={t("metadata.value")}
                disallowHTML={false}
                fields={requiredStatement.get()?.value || { none: [] }}
                onSave={(e: any) => requiredStatement.update(e.toInternationalString())}
              />
            </InputFieldset>
          )}
        </InputContainer>
      ) : null}

      {!notAllowed.includes("provider") ? (
        <InputContainer $wide id={provider.containerId()}>
          <InputLabel htmlFor={provider.focusId()}>{apiLabel(propertyLabels.provider)!}</InputLabel>

          {!(provider.get() || []).length ? (
            <>
              <EmptyState $noMargin $box>
                {t("ui.addAProviderToAttachYourInstitutionNameAndLogoToThisManifest")}
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
                  <AddIcon /> {t("ui.addProvider")}
                </ActionButton>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-5 mb-4">
                {(provider.get() || []).map((ref, i) => (
                  <div key={`provider_${i}`} className="flex flex-col gap-1">
                    <ViewProvider resource={ref} onPress={() => edit(ref)} />
                    <ActionButton
                      className="pl-3"
                      onPress={() => {
                        if (window.confirm(t("provider.removeConfirm"))) {
                          (provider as any).deleteAtIndex(i);
                        }
                      }}
                    >
                      <DeleteIcon className="mr-1" />
                      {t("ui.deleteProvider")}
                    </ActionButton>
                  </div>
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
                  <AddIcon /> {t("ui.addProvider")}
                </ActionButton>
              </div>
            </>
          )}
        </InputContainer>
      ) : null}

      {/* NOTE: If this is an annotation, then it will be a string, otherwise a list of strings */}
      {!notAllowed.includes("language") ? (
        <InputContainer $wide id={language.containerId()}>
          <InputLabel htmlFor={language.focusId()}>{apiLabel(propertyLabels.language)!}</InputLabel>
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
