[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/url-input-editor.svg)](https://www.npmjs.com/package/@advanced-rest-client/url-input-editor)

[![Build Status](https://travis-ci.com/advanced-rest-client/url-input-editor.svg)](https://travis-ci.com/advanced-rest-client/url-input-editor)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/url-input-editor)

## &lt;url-input-editor&gt;

A HTTP request URL editor for a HTTP request editor.

## Usage

### Installation
```
npm install --save @advanced-rest-client/url-input-editor
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/url-input-editor/url-input-editor.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <url-input-editor
      .value="${this.url}"
      @value-changed="${this._valueChanged}"
      @url-history-query="${this._queryUrlHistory}"></url-input-editor>
    `;
  }

  _valueChanged(e) {
    this.url = e.detail.value;
  }

  _queryUrlHistory(e) {
    e.preventDefault();
    const query = e.detail.q;
    e.detail.value = Promise.resolve([{
      url: '... some value'
    }]);
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/url-input-editor
cd url-input-editor
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```
