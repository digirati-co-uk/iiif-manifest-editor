# Shell context

Usage:
```jsx
import { ShellProvider, useShell } from 'iiif-manifest-editor/shell';


function MyEditor() {
  const { resourceID } = useShell();
  
  return <div>{resourceID}</div>;
}

<ShellProvider>
  <MyEditor />
</ShellProvider>
```
