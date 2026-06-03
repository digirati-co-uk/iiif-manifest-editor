import { useMemo } from "react";
import { useAnnotation, useVault } from "react-iiif-vault";

export function HTMLAnnotationBodyRender({
  className,
  locale,
}: {
  className?: string;
  locale?: string;
}) {
  const annotation = useAnnotation();
  const vault = useVault();

  const htmlValues = useMemo(() => {
    if (!annotation?.body) return [];

    const textualBodies = flattenTextualBodies(annotation.body, vault);
    let bodiesToRender: any[] = [];

    if (locale && annotation) {
      const filteredBodies = textualBodies.filter((body: any) => {
        const language = Array.isArray(body.language)
          ? body.language[0]
          : body.language;
        return language === locale;
      });

      if (filteredBodies.length) {
        bodiesToRender = filteredBodies;
      } else {
        bodiesToRender = textualBodies.length ? [textualBodies[0]] : [];
      }
    } else {
      bodiesToRender = textualBodies;
    }

    return bodiesToRender
      .filter((body) => body)
      .map((body: any) => body.value)
      .filter(Boolean);
  }, [locale, annotation, vault]);

  return (
    <div className={className}>
      {htmlValues.map((htmlValue: string, idx) => {
        return (
          <div
            key={idx}
            className="prose-headings:mt-1 prose-headings:mb-1 prose-sm"
          >
            <div dangerouslySetInnerHTML={{ __html: htmlValue }} />
          </div>
        );
      })}
    </div>
  );
}

function flattenTextualBodies(bodies: any[], vault: any): any[] {
  return bodies.flatMap((body) => flattenTextualBody(body, vault));
}

function flattenTextualBody(body: any, vault: any): any[] {
  const resource = resolveResource(body, vault);
  if (!resource) {
    return [];
  }

  if (resource.type === "Choice") {
    return toArray(resource.items).flatMap((item) =>
      flattenTextualBody(item, vault),
    );
  }

  return resource.type === "TextualBody" || resource.type === "Text"
    ? [resource]
    : [];
}

function resolveResource(resource: any, vault: any) {
  if (!resource?.id || resource.value || resource.items) {
    return resource;
  }

  return (
    vault.get(resource as any, { skipSelfReturn: false } as any) || resource
  );
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "undefined" || value === null) return [];
  return [value];
}
