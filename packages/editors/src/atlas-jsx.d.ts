import "@atlas-viewer/atlas";

// Atlas declares its renderer elements in global JSX; React 19 uses React.JSX.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends globalThis.JSX.IntrinsicElements {}
  }
}
