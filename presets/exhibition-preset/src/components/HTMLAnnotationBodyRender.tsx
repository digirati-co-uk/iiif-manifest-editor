import { useAnnotation } from "react-iiif-vault";

export function HTMLAnnotationBodyRender({ className, locale }: { className?: string; locale?: string }) {
  const annotation = useAnnotation();
  const filteredBodies =
    locale && annotation
      ? annotation?.body.filter((body: any) => {
          const language = Array.isArray(body.language) ? body.language[0] : body.language;
          return language === locale;
        })
      : annotation?.body || [];

  const bodiesToRender = filteredBodies.length
    ? filteredBodies
    : locale
      ? [(annotation?.body || [])[0]]
      : annotation?.body || [];

  return (
    <div className={className}>
      {bodiesToRender.map((body: any, idx) => {
        return (
          <div key={idx} className="prose-headings:mt-1 prose-headings:mb-1 prose-sm leading-normal">
            <div dangerouslySetInnerHTML={{ __html: body.value }} />
          </div>
        );
      })}
    </div>
  );
}
