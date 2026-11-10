import type * as L from "leaflet";
import type { useTranslations } from "@manifest-editor/i18n";

type Translate = ReturnType<typeof useTranslations>;

/** Display-only adaptation: all input measurements remain numeric map/GeoJSON values. */
export function createMapLocalisation(t: Translate, locale: string): L.Draw.Localisation {
  const measurement = (kind: "distance" | "area", value: number, options: L.Draw.MeasurementOptions) => {
    let unit: string;
    let precisionKey: string;
    if (kind === "distance") {
      const units = options.metric
        ? typeof options.metric === "string"
          ? options.metric
          : "metric"
        : options.feet
          ? "feet"
          : options.nautic
            ? "nauticalMile"
            : "yards";
      if (units === "metric") {
        if (value > 1000) {
          value /= 1000;
          unit = "kilometres";
          precisionKey = "km";
        } else {
          unit = "metres";
          precisionKey = "m";
        }
      } else if (units === "feet") {
        value *= 1.09361 * 3;
        unit = "feet";
        precisionKey = "ft";
      } else if (units === "nauticalMile") {
        value *= 0.53996 / 1000;
        unit = "nauticalMiles";
        precisionKey = "nm";
      } else {
        value *= 1.09361;
        if (value > 1760) {
          value /= 1760;
          unit = "miles";
          precisionKey = "mi";
        } else {
          unit = "yards";
          precisionKey = "yd";
        }
      }
    } else if (options.metric) {
      const units =
        typeof options.metric === "string"
          ? [options.metric]
          : Array.isArray(options.metric)
            ? options.metric
            : ["ha", "m"];
      if (value >= 1_000_000 && units.includes("km")) {
        value /= 1_000_000;
        unit = "squareKilometres";
        precisionKey = "km";
      } else if (value >= 10_000 && units.includes("ha")) {
        value /= 10_000;
        unit = "hectares";
        precisionKey = "ha";
      } else {
        unit = "squareMetres";
        precisionKey = "m";
      }
    } else {
      value /= 0.836127;
      if (value >= 3_097_600) {
        value /= 3_097_600;
        unit = "squareMiles";
        precisionKey = "mi";
      } else if (value >= 4840) {
        value /= 4840;
        unit = "acres";
        precisionKey = "ac";
      } else {
        unit = "squareYards";
        precisionKey = "yd";
      }
    }
    const digits =
      options.precision?.[precisionKey] ?? { km: 2, ha: 2, m: 0, mi: 2, ac: 2, yd: 0, ft: 0, nm: 2 }[precisionKey] ?? 0;
    const rounded = Number(value.toFixed(digits));
    return t(`map.measure.${unit}`, {
      count: rounded,
      value: new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(
        rounded
      ),
    });
  };
  return {
    translate: (key) => t(`map.${key}`),
    formatMeasurement: measurement,
    formatRadius: (radius, options) => t("map.radius", { value: measurement("distance", radius, options) }),
  };
}
