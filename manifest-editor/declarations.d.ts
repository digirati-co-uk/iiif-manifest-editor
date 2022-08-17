declare namespace JSX {
  interface IntrinsicElements {
    "canvas-panel": any;
  }
}

declare module '*.html?raw'
declare module '*.json?import'

declare interface Window {
  __TAURI__: any
}
