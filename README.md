[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/url-input-editor.svg)](https://www.npmjs.com/package/@advanced-rest-client/url-input-editor)

[![Build Status](https://travis-ci.org/advanced-rest-client/url-input-editor.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/url-input-editor)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/url-input-editor)

## &lt;url-input-editor&gt;

HTTP request URL editor.

```html
<url-input-editor></url-input-editor>
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/url-input-editor
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/url-input-editor/url-input-editor.js';
    </script>
  </head>
  <body>
    <url-input-editor></url-input-editor>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@advanced-rest-client/url-input-editor/url-input-editor.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <url-input-editor></url-input-editor>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/url-input-editor
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
