import * as manifestEditor from "../apps/ManifestEditor";
import * as collectionEditor from "../apps/CollectionEditor";
import * as about from "../apps/About";
import * as splash from "../apps/Splash";
import { allCreators } from "@/_creators";
import { allEditors } from "@/_editors";

export const apps = [manifestEditor, collectionEditor, about, splash];

export const availableApps = {
  manifestEditor,
  collectionEditor,
  about,
  splash,
};

export const defaultApp = splash;

export const defaultAppId = "splash";

export const creators = [...allCreators];

export const resourceTypes = [
  "Manifest",
  "Canvas",
  "ContentResource",
  "Agent",
  "AnnotationPage",
  "Annotation",
  "Range",
];

export const editors = [...allEditors];
