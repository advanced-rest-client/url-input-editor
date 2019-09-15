import { html } from 'lit-html';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@advanced-rest-client/arc-models/url-history-model.js';
import '../url-input-editor.js';
/* eslint-disable max-len */
class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
      'value'
    ]);
    this._componentName = 'url-input-editor';
    this.demoStates = ['Filles', 'Outlined', 'Anypoint'];

    this.value = location.href + '?token=eyJhbGRiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxMTMXNDgzOTM3NzUyNjE2NTgwMDIiLCJzY29wZXMiOlsiYWxsIl0sImlhdCI6MTU0NzYwOTc4OSwiZXhwIjoxNTQ3Njk2MTg5LCJpc3MiOiJ1cm46YXJjLWNUIn0.iLHFXNtfJx-wDDMGFDN6ooM9IZQoD72ZcswbFV0x0Pk';

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._valueHandler = this._valueHandler.bind(this);
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
  }

  _valueHandler(e) {
    this.value = e.detail.value;
  }

  async _sendHandler(e) {
    console.log('Storing URL in the history', e.target.value);
    const ev = new CustomEvent('url-history-store', {
      detail: {
        value: e.target.value
      },
      bubbles: true,
      cancelable: true
    });
    document.body.dispatchEvent(ev);
    try {
      const doc = await ev.detail.result;
      console.log(doc);
    } catch (e) {
      console.log(e);
    }
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      value
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the URL editor element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <url-input-editor
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            .value="${value}"
            @value-changed="${this._valueHandler}"
            @send-request="${this._sendHandler}"
            slot="content"
          ></url-input-editor>
        </arc-interactive-demo>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <url-history-model></url-history-model>
      <h2>ARC URL editor screen</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
