import "@storylite/storylite/styles.css";

// @ts-ignore
import stories from "@storylite/vite-plugin:stories";
import { renderStoryLiteApp } from "@storylite/storylite";

import "../src/index.css";
import "../stories/stories.css";

import config from "./config";

const rootElement = document.getElementById("root") as HTMLElement;

renderStoryLiteApp(rootElement, stories, config);
