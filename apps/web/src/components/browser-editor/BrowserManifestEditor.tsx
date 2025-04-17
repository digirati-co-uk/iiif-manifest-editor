import * as manifestPreset from '@manifest-editor/manifest-preset';
import { mapApp } from '@manifest-editor/shell';
import BrowserEditor from './BrowserEditor';

const preset = mapApp(manifestPreset);

export default function BrowserManifestEditor({ id }: { id: string }) {
  return <BrowserEditor id={id} preset={preset} />
}
