"use client";

import * as collectionPreset from '@manifest-editor/collection-preset';
import { mapApp } from '@manifest-editor/shell';
import BrowserEditor from './BrowserEditor';

const preset = mapApp(collectionPreset);

export default function BrowserCollectionEditor({ id }: { id: string }) {
  return <BrowserEditor id={id} preset={preset} />
}
