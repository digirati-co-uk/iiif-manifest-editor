import { InternationalString } from "@iiif/presentation-3";
import { useConfig } from "@manifest-editor/shell";
import { produce } from "immer";
import { useMemo, useReducer } from "react";
import { useClosestLanguage } from "react-iiif-vault";

export type MetadataEditorState = {
  fieldIds: number[]; // for ordering.
  selected: string | undefined;
  fields: {
    [id: string]: MetadataDefinition;
  };
  modified: string[];
  removed: number[];
  added: string[];
  hasChanged: boolean;
};

export type MetadataDiff = {
  added: Array<{ key: string; language: string; value: string }>;
  removed: number[];
  modified: Array<{
    id?: number;
    key: string;
    language: string;
    value: string;
  }>;
};

export type MetadataDefinition = {
  id?: number;
  language: string;
  value: string;
  key: string;
  source?: string;
  edited?: boolean;
  auto_update?: boolean;
  readonly?: boolean;
  data?: any;
};

export type MetadataEditorActions =
  | {
      type: "CHANGE_LANGUAGE";
      payload: {
        id: string;
        language: string;
      };
    }
  | {
      type: "CHANGE_VALUE";
      payload: {
        id: string;
        value: string;
      };
    }
  | {
      type: "REMOVE_ITEM";
      payload: { id: string };
    }
  | {
      type: "CREATE_ITEM";
      payload: {
        id: string;
        key: string;
        language: string;
        value: string;
        select: boolean;
      };
    }
  | {
      type: "SELECT_ITEM";
      payload: { id: string };
    };

export const metadataEditorReducer = produce((state: MetadataEditorState, action: MetadataEditorActions) => {
  switch (action.type) {
    case "SELECT_ITEM": {
      // Toggle.
      state.selected = state.selected === action.payload.id ? undefined : action.payload.id;
      break;
    }

    case "CHANGE_LANGUAGE": {
      state.hasChanged = true;
      state.fields[action.payload.id]!.language = action.payload.language;
      if (state.modified.indexOf(action.payload.id) === -1) {
        state.modified.push(action.payload.id);
      }
      state.selected = undefined;
      break;
    }

    case "CHANGE_VALUE": {
      state.hasChanged = true;
      state.fields[action.payload.id]!.value = action.payload.value;
      if (state.modified.indexOf(action.payload.id) === -1) {
        state.modified.push(action.payload.id);
      }
      break;
    }

    case "CREATE_ITEM": {
      state.hasChanged = true;
      state.fields[action.payload.id] = {
        language: action.payload.language,
        value: action.payload.value,
        key: action.payload.key,
      };
      if (action.payload.select) {
        state.selected = action.payload.id;
      }
      state.added.push(action.payload.id);
      break;
    }

    case "REMOVE_ITEM": {
      state.hasChanged = true;
      const toRemove = state.fields[action.payload.id];
      if (!toRemove) return state;
      delete state.fields[action.payload.id];
      if (typeof toRemove.id !== "undefined") {
        state.removed.push(toRemove.id);
      }
      if (state.added.indexOf(action.payload.id) !== -1) {
        state.added = state.added.filter((id) => id !== action.payload.id);
      }
      if (state.modified.indexOf(action.payload.id) !== -1) {
        state.modified = state.modified.filter((id) => id !== action.payload.id);
      }
      if (state.selected === action.payload.id) {
        state.selected = undefined;
      }
      break;
    }

    default:
      return state;
  }
});

export const valuesToIntlString = (values: MetadataDefinition[]): InternationalString => {
  const languageMap: InternationalString = {};

  for (const { value, language } of values) {
    languageMap[language] = languageMap[language] ? languageMap[language] : [];
    (languageMap[language] as string[]).push(value);
  }

  return languageMap;
};

export const intlStringToValues = (intlStr: InternationalString, key: string): MetadataDefinition[] => {
  if (!intlStr) {
    return [];
  }

  const languages = Object.keys(intlStr);
  const items: MetadataDefinition[] = [];
  let count = 0;
  for (const lang of languages) {
    for (const value of intlStr[lang] || []) {
      items.push({
        language: lang,
        id: count,
        key,
        value,
      });
      count++;
    }
  }
  return items;
};

export const createInitialValues = ({
  key,
  fields: input,
}: {
  key: string;
  fields: InternationalString | Array<MetadataDefinition>;
}) => {
  const fields = Array.isArray(input) ? input : intlStringToValues(input, key);

  const fieldIds = fields.map((field) => {
    return field.id;
  });

  const fieldMap: any = {};
  for (const f of fields) {
    fieldMap[`original-${f.id}`] = f;
  }

  return {
    selected: undefined,
    fieldIds,
    fields: fieldMap,
    modified: [],
    removed: [],
    added: [],
    hasChanged: false,
  } as MetadataEditorState;
};

export type MetadataSave = (
  data: {
    getDiff: () => MetadataDiff;
    key: string;
    items: MetadataDefinition[];
    toInternationalString: () => InternationalString;
  },
  index?: number,
  property?: "label" | "value"
) => void;

export interface UseMetadataEditor {
  fields: InternationalString | MetadataDefinition[];
  metadataKey?: string;

  // Actions.
  onSave?: MetadataSave;
  /** @deprecated use config context */
  availableLanguages?: string[];
  /** @deprecated use config context */
  defaultLocale?: string;
}

export function useMetadataEditor({ fields, metadataKey = "none", onSave }: UseMetadataEditor) {
  const { i18n } = useConfig();
  const { availableLanguages, defaultLanguage: defaultLocale } = i18n;
  const [state, dispatch] = useReducer(metadataEditorReducer, { fields, key: metadataKey }, createInitialValues);

  // Computed values.
  const fieldKeys = Object.keys(state.fields);
  // Returns a language code to display as the default to the user, based on their language.
  const closestLang = useClosestLanguage(() => fieldKeys.map((key) => state.fields[key]!.language), [state.fields]);
  const defaultItem = useMemo(() => {
    if (state.fields) {
      const keys = Object.keys(state.fields);
      for (const key of keys) {
        if (state.fields[key]!.language === closestLang) {
          return key;
        }
      }
    }
  }, [state.fields, closestLang]);

  const firstItem = defaultItem
    ? {
        id: defaultItem,
        field: state.fields[defaultItem],
      }
    : null;

  // Actions.
  const createNewItem = (select = true) =>
    dispatch({
      type: "CREATE_ITEM",
      payload: {
        id: `new-${new Date().getTime()}-${fieldKeys.length}`,
        key: metadataKey,
        language: (defaultLocale || availableLanguages[0]) as string,
        value: "",
        select,
      },
    });

  const saveChanges = (index?: number, property?: "label" | "value") => {
    if (onSave && state && state.hasChanged) {
      onSave(
        {
          items: Object.values(state.fields),
          key: metadataKey,
          getDiff: () => ({
            added: (state.added as string[]).map((fid) => state.fields[fid]!),
            removed: state.removed as number[],
            modified: (state.modified as string[])
              .filter((fid) => state.added.indexOf(fid) === -1)
              .map((fid) => state.fields[fid]!),
          }),
          toInternationalString: () => valuesToIntlString(Object.values(state.fields)),
        },
        index,
        property
      );
    }
  };

  const changeValue = (id: string, value: string) => {
    dispatch({
      type: "CHANGE_VALUE",
      payload: { id, value },
    });
  };

  const changeLanguage = (id: string, language: string) => {
    dispatch({ type: "CHANGE_LANGUAGE", payload: { id, language } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id } });
  };

  const getFieldByKey = (id: string) => {
    return state.fields[id];
  };

  return {
    // Data
    firstItem,
    fieldKeys,

    // Actions
    createNewItem,
    saveChanges,
    changeValue,
    changeLanguage,
    removeItem,
    getFieldByKey,
  } as const;
}
