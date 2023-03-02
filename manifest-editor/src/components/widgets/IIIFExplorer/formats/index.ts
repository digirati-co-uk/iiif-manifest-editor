import { ExplorerFormat, OutputFormat } from "../IIIFExplorer.types";
import { urlFormat } from "./url";
import { contentStateFormat } from "./content-state";
import { jsonFormat } from "./json";
import { customFormat } from "./custom";
import { thumbnailFormat } from "./thumbnail";

export const formats: { [K in OutputFormat["type"]]: ExplorerFormat<K> } = {
  "content-state": contentStateFormat,
  custom: customFormat,
  json: jsonFormat,
  url: urlFormat,
  thumbnail: thumbnailFormat,
};
