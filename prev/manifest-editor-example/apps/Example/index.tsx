import { LayoutPanel } from 'manifest-editor';
import Example from './components/example.vue';
import { defineCustomElement } from 'vue';
import { createElement } from "react";

export default { id: "example-app", title: "Custom splash" };

customElements.define('example-app', defineCustomElement(Example));

export const centerPanels: LayoutPanel[] = [
  {
    id: "default",
    label: "Current canvas",
    icon: "",
    onMount: (args, ctx, appState) => {
      const $el = document.getElementById('current-canvas') as any;

      $el.ctx = ctx;

      const int = setInterval(() => {
        appState.setState({ time: Date.now() })
      }, 2000)

      return () => {
        clearInterval(int);
      }
    },
    render: (args, ctx, appState) => {
     return createElement('example-app', { id: "current-canvas", time: appState.state.time});
    }
  },
  {
    id: 'other-center',
    render: (args, ctx) => <div>Other center <button onClick={() => ctx.actions.open('default')}>Back to normal</button></div>,
  }
];

export const leftPanels: LayoutPanel[] = [
  {
    id: 'example-left-panel',
    label: 'Example left panel',
    icon: '',
    render: (args) => `Example left panel (${args.time})`,
  }
]
