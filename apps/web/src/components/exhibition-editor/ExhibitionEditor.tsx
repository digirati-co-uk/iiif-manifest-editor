'use client';
import type { Config } from "@manifest-editor/shell";
import { useMemo } from "react";
import BrowserEditor, { type BrowserEditorProps } from "../browser-editor/BrowserEditor";
import * as exampleLeftPanel from './left-panels/Example';

export default function ExhibitionEditor(props: { id: string }) {
  const config = useMemo(() => ({
    // Custom config here.
    // previews: [],
  } as Partial<Config>), []);

  const extensions = useMemo(() => ({
    leftPanels: [exampleLeftPanel],
  } as BrowserEditorProps['extensions']), []);


  return <BrowserEditor id={props.id} config={config} extensions={extensions} />;
}
