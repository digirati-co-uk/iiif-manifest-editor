import { HTMLAttributes, useCallback, useMemo } from "react";
import { UniversalCopyPasteProps } from "./UniversalCopyPaste.types";
import { analyse } from "../../helpers/analyse";

export function UniversalCopyTarget<T>({
  as,
  reference: _ref,
  onReference,
  onLink,
  onAnalysis,
  onDropReference: _onDropReference,
  onDropLink: _onDropLink,
  onDropAnalysis: _onDropAnalysis,
  onPasteReference: _onPasteReference,
  onPasteLink: _onPasteLink,
  onPasteAnalysis: _onPasteAnalysis,
  ...props
}: Partial<HTMLAttributes<HTMLElement>> & UniversalCopyPasteProps<T> & T) {
  // const vault = useVault();
  const Component = (as || "div") as any;

  const onDropReference = _onDropReference || onReference;
  const onDropLink = _onDropLink || onLink;
  const onDropAnalysis = _onDropAnalysis || onAnalysis;
  const onPasteReference = _onPasteReference || onReference;
  const onPasteLink = _onPasteLink || onLink;
  const onPasteAnalysis = _onPasteAnalysis || onAnalysis;

  const reference = useMemo(() => {
    return _ref;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_ref?.id, _ref?.type]);

  const onCopy = useCallback(
    function onCopy(e: ClipboardEvent) {
      if (e.defaultPrevented) {
        return;
      }
      e.preventDefault();
      if (e.clipboardData) {
        if (reference && reference.id && reference.type) {
          // const full = vault.get(reference);
          // if (full) {
          //   e.clipboardData.setData("application/json", JSON.stringify(vault.toPresentation3(vault.get(reference))));
          // }

          e.clipboardData.setData(
            "application/json+vault",
            JSON.stringify({
              id: reference.id,
              type: reference.type,
            })
          );
        }
      }
    },
    [reference]
  );

  const onPaste = useCallback(async function onPaste(e: ClipboardEvent) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    if (e.clipboardData) {
      if (props.onLoading) {
        props.onLoading();
      }

      if (onPasteReference) {
        const data = e.clipboardData.getData("application/json+vault");
        if (data) {
          try {
            const dataAsJson = JSON.parse(data);
            if (dataAsJson && dataAsJson.id && dataAsJson.type) {
              onPasteReference(dataAsJson);
            }
          } catch (e) {
            // ignore.
          }
        }
      }

      if (onPasteLink || onPasteAnalysis) {
        const data = e.clipboardData.getData("text");
        if (data.startsWith("http")) {
          const allLinks = data.split("\n");
          for (const link of allLinks) {
            if (onPasteAnalysis) {
              try {
                const result = await analyse(link);
                if (result) {
                  onPasteAnalysis(result);
                  continue;
                }
              } catch (e) {
                // let it fallback to onPasteLink
              }
            }
            if (onPasteLink) {
              onPasteLink(link);
            }
          }
        }
      }
      if (props.onComplete) {
        props.onComplete();
      }
    }
  }, []);

  // @todo not working..
  const onDragStart = useCallback(function onPaste(e: DragEvent) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    if (e.dataTransfer && props.draggable) {
      e.dataTransfer.effectAllowed = "all";

      if (reference && reference.id && reference.type) {
        e.dataTransfer.setData(
          "application/json+vault",
          JSON.stringify({
            id: reference.id,
            type: reference.type,
          })
        );
      }
    }
  }, []);

  const onDrop = useCallback(async function onDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      if (onDropReference) {
        const data = e.dataTransfer.getData("application/json+vault");
        if (data) {
          try {
            const dataAsJson = JSON.parse(data);
            if (dataAsJson && dataAsJson.id && dataAsJson.type) {
              onDropReference(dataAsJson, e);
            }
          } catch (e) {
            // ignore.
            return;
          }
        }
      }
      const json = e.dataTransfer.getData("application/json");
      if (json) {
        const parsed = JSON.parse(json);
        // @todo this could be raw JSON or a Content State.
        return;
      }
      const link = e.dataTransfer.getData("text/plain");
      if (link) {
        console.log("link", link);
        return;
      }
    }
  }, []);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  return (
    <Component
      onCopy={onCopy}
      onPaste={onPaste}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      tabIndex={-1}
      {...props}
    />
  );
}
