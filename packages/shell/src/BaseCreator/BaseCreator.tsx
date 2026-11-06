import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { NotebookCreatorSources } from "../Notebook/ProjectNotebook";
import { toRef } from "@iiif/parser";
import {
  ActionButton,
  CreatorGrid,
  EmptyState,
  ErrorMessage,
  GridIcon,
  IconButton,
  InfoIcon,
  Tooltip,
  TooltipTrigger,
  DefaultTooltipContent,
  ModalBackSlot,
  Spinner,
} from "@manifest-editor/components";
import {
  type CreatableResource,
  type CreatorDefinition,
  type CreatorOptions,
  type CreatorValidationMessage,
  type CreatorResourceProbeHelpers,
  type CreatorResourceProbeResult,
  getCreatorConfigKey,
  matchBasedOnResource,
} from "@manifest-editor/creator-api";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { type FormEvent, memo, Suspense, useEffect, useId, useMemo, useRef, useState } from "react";
import { useVault } from "react-iiif-vault";
import { useApp } from "../AppContext/AppContext";
import { useConfig } from "../ConfigContext/ConfigContext";
import { useTemporaryHighlight } from "../highlighted-image-resources";
import { ModulePanelButton, useSetCustomTitle } from "../Layout/components/ModularPanel";
import { useLayoutActions } from "../Layout/Layout.context";
import { useInlineCreator } from "./BaseCreator.hooks";
import { completeCreator } from "./creator-completion";
import { useInitialData } from "./CreatorInitialData";
import { CreatorResourceInput } from "./CreatorResourceInput";

interface BaseCreatorProps {
  resource: CreatableResource;
}

export const RenderCreator = memo(function RenderCreator(props: {
  resource: CreatableResource;
  creator: CreatorDefinition;
  onCreate?: () => void;
  skipEditingOnCreate?: boolean;
  initialData?: Record<string, any>;
  /** The parent shows the summary; no-form creators render just their action. */
  compact?: boolean;
}) {
  const { resolveMessage } = useEditorI18n();

  const t = useTranslations("shell");

  const vault = useVault();
  const { edit, modal, open } = useLayoutActions();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | CreatorValidationMessage | null>(null);
  const creator = useInlineCreator();
  const config = useConfig();
  const isCreatingRef = useRef(false);

  const canvasSelector = props.resource.initialData?.selector;
  useTemporaryHighlight(canvasSelector);

  const initialData = useInitialData<Record<string, unknown>>(props.creator.id);

  const options: CreatorOptions = {
    targetType: props.resource.type,
    parent: props.resource.parent
      ? {
          property: props.resource.property as string,
          atIndex: props.resource.index,
          resource: props.resource.parent,
        }
      : undefined,
    target: props.resource.target,
    placeholderPosition: props.resource.placeholderPosition,
    initialData: { ...initialData, ...(props.resource.initialData || {}), ...(props.initialData || {}) },
  };

  const runCreate = async (payload: any) => {
    if (isCreating || isCreatingRef.current) return;

    setError(null);
    setIsCreating(true);
    isCreatingRef.current = true;

    try {
      await completeCreator({
        create: () => creator.create(props.creator.id, payload, options),
        onCreate: props.onCreate,
        close: props.skipEditingOnCreate
          ? undefined
          : () => {
              modal.popStack();
              modal.close();
            },
        edit:
          props.skipEditingOnCreate || props.resource.initialData?.skipEditingOnCreate
            ? undefined
            : (resource) => {
                if (resource.type === "Canvas") open({ id: "current-canvas" });
                edit(resource, {
                  parent: toRef(props.resource.parent),
                  property: props.resource.property,
                  index: props.resource.index,
                });
              },
      });
    } catch (err: any) {
      setError(
        props.creator.validationErrorMessage?.(err, { payload, vault }) ||
          err?.message || { message: { namespace: "shell", key: "creator.unknownError" } }
      );
    } finally {
      setIsCreating(false);
      isCreatingRef.current = false;
    }
  };

  const validate = async () => {
    return true;
  };

  useEffect(() => {
    if (props.resource.initialData?.showEmptyForm) {
      return;
    }

    if (!props.creator.render && !isCreating) {
      runCreate({});
    }
  }, [props.creator]);

  const spinner = (
    <div className="flex flex-col items-center py-8">
      <div className="flex gap-2 items-center">
        <Spinner /> <span>{t("creator.loading")}</span>
      </div>
    </div>
  );

  if (!props.creator.render) {
    if (isCreating) return spinner;
    if (props.compact) {
      return (
        <>
          {error ? (
            <ErrorMessage>{typeof error === "string" ? error : resolveMessage(error.message)}</ErrorMessage>
          ) : null}
          <div className="flex justify-end">
            <ActionButton primary onPress={() => runCreate({})}>
              {resolveMessage(props.creator?.actionButtonMessage, props.creator.actionButton) || t("creator.create")}
            </ActionButton>
          </div>
        </>
      );
    }
    return (
      <>
        {error ? (
          <ErrorMessage>{typeof error === "string" ? error : resolveMessage(error.message)}</ErrorMessage>
        ) : (
          <EmptyState>{t("creator.noOptions")}</EmptyState>
        )}
        <ActionButton primary onPress={() => runCreate({})}>
          {resolveMessage(props.creator?.actionButtonMessage, props.creator.actionButton) || t("creator.create")}
        </ActionButton>
      </>
    );
  }

  return (
    <>
      {isCreating ? spinner : null}
      <div hidden={isCreating}>
        {resolveMessage(props.creator.helpMessage || props.creator.summaryMessage, props.creator.summary) &&
        !props.compact &&
        !props.creator.hideSummary ? (
          <div className="flex justify-end px-4">
            <Tooltip>
              <TooltipTrigger
                aria-label={t("creator.help", {
                  name: resolveMessage(props.creator.labelMessage, props.creator.label),
                })}
                className="rounded p-1 text-gray-500 focus-visible:outline focus-visible:outline-2"
              >
                <InfoIcon className="h-5 w-5" />
              </TooltipTrigger>
              <DefaultTooltipContent
                className="max-w-xs"
                root={document.getElementById("headlessui-portal-root") || undefined}
              >
                {resolveMessage(props.creator.helpMessage || props.creator.summaryMessage, props.creator.summary)}
              </DefaultTooltipContent>
            </Tooltip>
          </div>
        ) : null}
        {error ? (
          <ErrorMessage>{typeof error === "string" ? error : resolveMessage(error.message)}</ErrorMessage>
        ) : null}
        <Suspense fallback={spinner}>
          {props.creator.render({
            vault,
            i18n: { resolveMessage },
            runCreate,
            validate,
            options,
            config: config.creators?.[getCreatorConfigKey(props.creator)] || {},
          })}
        </Suspense>
      </div>
    </>
  );
});

export function BaseCreator(props: BaseCreatorProps) {
  const { resolveMessage } = useEditorI18n();

  const t = useTranslations("shell");

  const app = useApp();
  const config = useConfig();
  const vault = useVault();
  const [currentId, setCurrentId] = useState(props.resource.initialCreator || "");
  const [currentInitialData, setCurrentInitialData] = useState<Record<string, any> | undefined>();
  const [resourceValue, setResourceValue] = useState("");
  const [isProbing, setIsProbing] = useState(false);
  const [probeError, setProbeError] = useState("");
  const [probeMatches, setProbeMatches] = useState<ProbeMatch[] | null>(null);
  const resourceInputRef = useRef<HTMLInputElement>(null);
  const probeRun = useRef(0);
  const probeController = useRef<AbortController | null>(null);
  const gridId = useId();
  const linkFirst =
    props.resource.type === "Canvas" &&
    props.resource.parent?.type === "Manifest" &&
    props.resource.property === "items";
  const [showAll, setShowAll] = useState(false);
  const set = useSetCustomTitle();
  const supported = useMemo(
    () =>
      matchBasedOnResource(props.resource, app.layout.creators || [], {
        vault,
      }),
    [props.resource, app.layout.creators, vault]
  );

  const canProbe = supported.some((creator) => creator.supportsResource);
  const browserCreator =
    supported.find((creator) => creator.id === config.notebook?.browserCreatorId) ??
    supported.find((creator) => getCreatorConfigKey(creator) === "@manifest-editor/iiif-browser-creator");
  const manualCreators = supported.filter((creator) => !creator.supportsResource);

  useEffect(
    () => () => {
      probeRun.current++;
      probeController.current?.abort();
    },
    []
  );

  const cancelProbe = () => {
    probeRun.current++;
    probeController.current?.abort();
    probeController.current = null;
    setIsProbing(false);
  };

  useEffect(() => {
    if (supported.length === 1 && !currentId && !canProbe) {
      setCurrentId(supported[0]!.id);
    }
  }, [canProbe, currentId, supported]);

  useEffect(() => {
    if (canProbe && !currentId) {
      resourceInputRef.current?.focus();
    }
  }, [canProbe, currentId]);

  const current = supported.find((t) => t.id === currentId);

  useEffect(() => {
    set?.(resolveMessage(current?.labelMessage, current?.label) || t("creator.add"));
  });

  if (supported.length === 0) {
    return <EmptyState>{t("creator.unsupported")}</EmptyState>;
  }

  const selectCreator = (creator: CreatorDefinition, initialData?: Record<string, any>) => {
    cancelProbe();
    setCurrentInitialData(initialData || getDefaultProbeInitialData(resourceValue));
    setCurrentId(creator.id);
  };

  const openBrowser = browserCreator
    ? (url?: string) => selectCreator(browserCreator, { url: url ?? (resourceValue.trim() || undefined) })
    : undefined;

  const runResourceProbe = async (e?: FormEvent, source?: string) => {
    e?.preventDefault();
    const value = (source ?? resourceValue).trim();
    if (source) setResourceValue(source);
    if (!value || isProbing) return;

    const requestId = ++probeRun.current;
    const controller = new AbortController();
    probeController.current = controller;
    setIsProbing(true);
    setProbeError("");
    setProbeMatches(null);

    let requestFailed = false;
    let timedOut = false;
    const helpers = createProbeHelpers(controller.signal, () => {
      requestFailed = true;
    });
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<null>((resolve) => {
      timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
        resolve(null);
      }, 10_000);
    });
    const results = await Promise.all(
      supported.map(async (creator): Promise<ProbeResult> => {
        if (!creator.supportsResource) return null;
        const probe = async (): Promise<ProbeResult> => {
          try {
            const result = await creator.supportsResource!(value, helpers, { vault, resource: props.resource });
            return result ? { creator, initialData: normaliseProbeResult(value, result).initialData } : null;
          } catch {
            return { creator, error: t("creator.probeFailed") };
          }
        };
        return Promise.race([probe(), timeout]);
      })
    );
    clearTimeout(timer!);
    if (requestId !== probeRun.current) return;
    probeController.current = null;
    setIsProbing(false);
    const matches = results.filter(isProbeMatch);

    if (matches.length === 1) {
      selectCreator(matches[0]!.creator, matches[0]!.initialData);
      return;
    }

    if (matches.length > 1) {
      setShowAll(false);
      setProbeMatches(matches);
      return;
    }

    setShowAll(true);
    setProbeError(
      timedOut
        ? "creator.timeout"
        : requestFailed || results.some(isProbeError)
          ? "creator.requestFailed"
          : "creator.unrecognised"
    );
  };

  const backButton = (
    <ModalBackSlot>
      <IconButton
        root={document.getElementById("headlessui-portal-root") || undefined}
        label={t("creator.back")}
        className="group"
        placement="right"
        onPress={() => {
          cancelProbe();
          setCurrentId("");
          setCurrentInitialData(undefined);
        }}
      >
        <GridIcon className="text-2xl opacity-50 group-hover:opacity-70" />
      </IconButton>
    </ModalBackSlot>
  );

  if (current) {
    const shouldHideModal = current.hiddenModal;

    if (shouldHideModal) {
      return (
        <>
          {backButton}
          <RenderCreator creator={current} resource={props.resource} initialData={currentInitialData} />
        </>
      );
    }

    return (
      <div>
        {backButton}
        <div className={"p-2 py-6"}>
          <RenderCreator creator={current} resource={props.resource} initialData={currentInitialData} />
        </div>
      </div>
    );
  }

  const allVisible = !canProbe || showAll || (!linkFirst && !probeMatches);
  const gridItems = allVisible ? supported : probeMatches?.map((match) => match.creator) || [];
  const initialDataByCreator = new Map(probeMatches?.map((match) => [match.creator.id, match.initialData]));
  const renderGrid = (items: CreatorDefinition[], label: string, compact = false) => (
    <CreatorGrid
      label={label}
      compact={compact}
      items={items.map((item) => ({
        id: item.id,
        title: resolveMessage(item?.labelMessage, item.label),
        description: resolveMessage(item?.summaryMessage, item.summary) || "",
        icon: item.icon,
        onClick: () => selectCreator(item, initialDataByCreator.get(item.id)),
      }))}
    />
  );

  return (
    <>
      {canProbe ? (
        <form className="p-4" onSubmit={(e) => void runResourceProbe(e)} aria-busy={isProbing}>
          <CreatorResourceInput
            inputRef={resourceInputRef}
            rotateExamples={linkFirst}
            onBrowse={openBrowser ? () => openBrowser() : undefined}
            value={resourceValue}
            isChecking={isProbing}
            onChange={(value) => {
              cancelProbe();
              setResourceValue(value);
              setProbeError("");
              setProbeMatches(null);
            }}
          />
          <div role="status" aria-live="polite" className="text-sm text-gray-600">
            {isProbing ? <span className="sr-only">{t("creator.checking")}</span> : null}
            {probeError ? <p className="mt-3">{t(probeError)}</p> : null}
            {probeMatches && !allVisible ? <p className="mt-3">{t("creator.chooseLink")}</p> : null}
          </div>
          {!resourceValue ? (
            <NotebookCreatorSources
              isDisabled={isProbing}
              onSelect={(url) => void runResourceProbe(undefined, url)}
              onOpenNotebook={openBrowser ? () => openBrowser("iiif://notes") : undefined}
            />
          ) : null}
        </form>
      ) : null}
      <div id={gridId}>
        {gridItems.length
          ? renderGrid(gridItems, probeMatches && !allVisible ? t("creator.matches") : t("creator.selectType"))
          : null}
      </div>
      {linkFirst && !allVisible && manualCreators.length ? renderGrid(manualCreators, t("creator.noLink"), true) : null}
      {canProbe && (linkFirst || probeMatches) ? (
        <div className="px-4 pb-4">
          <Button
            className="rounded px-2 py-1 text-sm text-me-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2"
            aria-expanded={showAll}
            aria-controls={gridId}
            onClick={() => {
              cancelProbe();
              setShowAll(!showAll);
            }}
          >
            {showAll ? t("creator.fewer") : t("creator.chooseType")}
          </Button>
        </div>
      ) : null}
    </>
  );
}

type ProbeMatch = { creator: CreatorDefinition; initialData?: Record<string, any> };
type ProbeError = { creator: CreatorDefinition; error: string };
type ProbeResult = ProbeMatch | ProbeError | null;

function isProbeMatch(result: ProbeResult): result is ProbeMatch {
  return !!result && !("error" in result);
}

function isProbeError(result: ProbeResult): result is ProbeError {
  return !!result && "error" in result;
}

function normaliseProbeResult(
  value: string,
  result: CreatorResourceProbeResult
): Exclude<CreatorResourceProbeResult, boolean> {
  return typeof result === "object" ? result : { initialData: getDefaultProbeInitialData(value) };
}

function getDefaultProbeInitialData(value: string) {
  const trimmed = value.trim();
  return trimmed ? { url: trimmed, youtubeUrl: trimmed } : undefined;
}

function createProbeHelpers(signal: AbortSignal, onRequestError: () => void): CreatorResourceProbeHelpers {
  const request = async (url: string, method = "GET") => {
    try {
      const response = await fetch(url, { method, signal });
      if (!response.ok) throw new Error("Could not load link");
      return response;
    } catch (error) {
      onRequestError();
      throw error;
    }
  };
  const textCache = new Map<string, Promise<string>>();
  const jsonCache = new Map<string, Promise<any>>();
  const headCache = new Map<string, Promise<Response>>();

  const text = (url: string) => {
    if (!textCache.has(url)) {
      textCache.set(
        url,
        request(url).then((response) => response.text())
      );
    }
    return textCache.get(url)!;
  };

  const head = (url: string) => {
    if (!headCache.has(url)) {
      headCache.set(url, request(url, "HEAD"));
    }
    return headCache.get(url)!;
  };

  return {
    text,
    head,
    json(url) {
      if (!jsonCache.has(url)) {
        jsonCache.set(
          url,
          text(url).then((body) => JSON.parse(body))
        );
      }
      return jsonCache.get(url)!;
    },
    async contentType(url) {
      return (await head(url)).headers.get("content-type") || "";
    },
  };
}
