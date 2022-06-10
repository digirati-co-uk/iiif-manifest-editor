import { HTMLAttributes, useCallback, useMemo } from "react";
import { UniversalCopyPasteProps } from "./UniversalCopyPaste.types";
import { analyse } from "../../helpers/analyse";

export function UniversalCopyTarget<T>({
  as,
  onDropReference,
  reference: _ref,
  onPasteReference,
  onPasteLink,
  onPasteAnalysis,
  ...props
}: HTMLAttributes<HTMLElement> & UniversalCopyPasteProps<T> & T) {
  const Component = (as || "div") as any;
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
            return;
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

  const onDrop = useCallback(function onPaste(e: DragEvent) {
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
    }
  }, []);

  return (
    <Component onCopy={onCopy} onPaste={onPaste} onDrop={onDrop} onDragStart={onDragStart} tabIndex={-1} {...props} />
  );
}
