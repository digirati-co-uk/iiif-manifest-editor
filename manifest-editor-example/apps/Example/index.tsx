import { LayoutPanel } from 'manifest-editor';
import Example from './components/example.vue';
import { defineCustomElement } from 'vue';
import { createElement } from "react";
import { html } from 'lighterhtml';
import { ExampleReact } from './components/example-react';

export default { id: "example-app", title: "Custom splash" };

customElements.define('example-app', defineCustomElement(Example));

export const centerPanels: LayoutPanel[] = [
  {
    id: "default",
    label: "Vue example",
    icon: "",
    onMount: (args, ctx, appState) => {
      const $el = document.getElementById('example-center') as any;

      $el.ctx = ctx;

      const int = setInterval(() => {
        appState.setState({ time: Date.now() })
      }, 2000)

      return () => {
        clearInterval(int);
      }
    },
    render: (args, ctx, appState) => {
     return createElement('example-app', { id: "example-center", time: appState.state.time});
    }
  },
  {
    id: 'react',
    label: 'React',
    render: (args, ctx) => <ExampleReact onClick={() => ctx.actions.open('html-el')} />
  },
  {
    id: 'html-el',
    label: 'HTML Element',
    render: (args, ctx) => {
      const div = document.createElement('div');
      const h3 = document.createElement('h3');
      h3.innerText = 'HTML (elements)';
      const button = document.createElement('button');
      button.innerText = 'Next renderer';
      button.addEventListener('click', () => {
        ctx.actions.open('html-text')
      });
      div.appendChild(h3);
      div.appendChild(button);

      return div;
    }
  },
  {
    id: 'html-text',
    label: 'HTML (text)',
    onMount: (args, ctx, appState) => {
      const onClick = (e) => {
        const $btn = (e.target as any).id === 'back'; // (1)
        if ($btn) {
          ctx.actions.open('html-lighterhtml')
        }
      };
      document.addEventListener('click', onClick);

      const int = setInterval(() => {
        appState.setState({ time: Date.now() })
      }, 2000);

      return () => {
        clearInterval(int);
        document.removeEventListener('click', onClick);
      }
    },
    render: (args, ctx, appState) => `
      <div>
        <h3>Custom center (HTML)</h3>
        <p>Count: ${appState.state.time}</p>
        <button id="back">Next renderer</button>
      </div>
    `
  },
  {
    id: 'html-lighterhtml',
    label: 'Lighter HTML',
    render: (args, ctx) => {
      return html.node`
        <div>
          <h3>Lighter HTML</h3>
          <button onclick=${() => ctx.actions.open('default')}>Back to main</button>
        </div>
      `;
    }
  }
];

export const leftPanels: LayoutPanel[] = [
  {
    id: 'example-left-panel',
    label: 'Example left panel',
    icon: '',
    render: (args) => `Example left panel (${args.time})`,
  },
]
