import { useMemo } from "react";
import { useAnnotation } from "react-iiif-vault";

export function HTMLAnnotationBodyRender({
  className,
  locale,
}: {
  className?: string;
  locale?: string;
}) {
  const annotation = useAnnotation();

  const htmlValues = useMemo(() => {
    if (!annotation?.body) return [];

    let bodiesToRender: any[] = [];

    if (locale && annotation) {
      const filteredBodies = annotation.body.filter((body: any) => {
        const language = Array.isArray(body.language)
          ? body.language[0]
          : body.language;
        return language === locale;
      });

      if (filteredBodies.length) {
        bodiesToRender = filteredBodies;
      } else {
        bodiesToRender = [annotation.body[0]];
      }
    } else {
      bodiesToRender = annotation.body;
    }

    return bodiesToRender
      .filter((body) => body)
      .map((body: any) => body.value)
      .filter(Boolean);
  }, [locale, annotation]);

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
